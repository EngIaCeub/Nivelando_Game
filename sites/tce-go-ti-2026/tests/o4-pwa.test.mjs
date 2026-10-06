import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFile, mkdtemp, mkdir, writeFile, cp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runInNewContext } from 'node:vm';
import { inflateSync } from 'node:zlib';
import { buildStandalone, validateBuildMetadata } from '../../../scripts/build-standalone.mjs';
import { inspectIndexedDB, collectHealth } from '../release-diagnostics.js';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const dist = await mkdtemp(join(tmpdir(), 'studyos-o4-pwa-tests-'));
const built = await buildStandalone({ dist, buildId: 'pwa-build-a', buildTimestamp: '2026-10-03T00:00:00.000Z' });
const swSource = await readFile(join(dist, 'sw.js'), 'utf8');

function worker(source = swSource, scope = 'https://study.test/Nivelando_Game/', extra = []) {
  const handlers = new Map(), entries = new Map(), deleted = [], cacheNames = new Set(extra);
  let skips = 0, claims = 0;
  const cache = {
    async addAll(paths) {
      for (const path of paths) {
        const url = new URL(path, scope), name = decodeURIComponent(url.pathname.slice(new URL(scope).pathname.length)) || 'index.html';
        const body = await readFile(join(dist, name)); // A missing asset fails installation.
        entries.set(url.href, new Response(body));
      }
    },
    async match(key) { return entries.get(key)?.clone(); }
  };
  const self = { registration: { scope }, addEventListener(type, handler) { handlers.set(type, handler); },
    async skipWaiting() { skips++; }, clients: { async claim() { claims++; } } };
  runInNewContext(source, { self, URL, Response, caches: {
    async open(name) { cacheNames.add(name); return cache; }, async keys() { return [...cacheNames]; },
    async delete(name) { deleted.push(name); cacheNames.delete(name); return true; }
  } });
  const dispatch = async (type, data = {}) => {
    let promise; handlers.get(type)({ ...data, waitUntil(value) { promise = value; }, respondWith(value) { promise = value; } });
    return promise ? await promise : undefined;
  };
  return { dispatch, entries, deleted, cacheNames, get skips() { return skips; }, get claims() { return claims; } };
}

test('O4 PWA: metadata comes from the pack manifest and satisfies its schema', async () => {
  const schema = JSON.parse(await readFile(join(root, 'schemas/build-metadata.schema.json'), 'utf8'));
  const pack = JSON.parse(await readFile(join(root, 'exam-packs/tce-go-ti-2026/manifest.json'), 'utf8'));
  assert.equal(built.metadata.examId, pack.examId);
  assert.equal(built.metadata.examPackVersion, pack.version);
  assert.equal(built.metadata.schemaVersion, pack.schemaVersion);
  assert.equal(validateBuildMetadata(built.metadata, schema), built.metadata);
  for (const field of schema.required) { const bad = { ...built.metadata }; delete bad[field]; assert.throws(() => validateBuildMetadata(bad, schema), /metadata/); }
  assert.throws(() => validateBuildMetadata({ ...built.metadata, storageVersion: 0 }, schema));
  assert.throws(() => validateBuildMetadata({ ...built.metadata, channel: "bad'channel" }, schema));
});

test('O4 PWA: a fresh generic build copies new nested modules and has no pack version fallback', async () => {
  const fixture = await mkdtemp(join(tmpdir(), 'studyos-o4-pwa-generic-'));
  for (const directory of ['core/src/nested', 'schemas', 'exam-packs/test-exam', 'sites/test-exam/ui']) await mkdir(join(fixture, directory), { recursive: true });
  for (const name of ['index.html', 'manifest.webmanifest', 'styles.css', 'app.js']) await cp(join(root, 'core', name), join(fixture, 'core', name));
  await cp(join(root, 'schemas/build-metadata.schema.json'), join(fixture, 'schemas/build-metadata.schema.json'));
  await writeFile(join(fixture, 'core/src/nested/new.js'), 'export const addedByAnotherWorker = true;');
  await writeFile(join(fixture, 'sites/test-exam/site-app.js'), "import './ui/runtime.mjs';");
  await writeFile(join(fixture, 'sites/test-exam/ui/runtime.mjs'), 'export const nestedRuntime = true;');
  const manifest = { examId: 'test-exam', version: '7.8.9', schemaVersion: 4 };
  await writeFile(join(fixture, 'exam-packs/test-exam/manifest.json'), JSON.stringify(manifest));
  const result = await buildStandalone({ root: fixture, examId: 'test-exam', dist: join(fixture, 'bundle'), buildId: 'new-modules' });
  assert.equal(result.metadata.examPackVersion, '7.8.9');
  assert.equal(result.metadata.schemaVersion, 4);
  assert.ok(result.files.includes('core/src/nested/new.js'));
  assert.ok(result.files.includes('ui/runtime.mjs'));
  const sw = await readFile(join(result.dist, 'sw.js'), 'utf8');
  assert.match(sw, /\.\/core\/src\/nested\/new\.js/);
  assert.match(sw, /\.\/ui\/runtime\.mjs/);
  delete manifest.version;
  await writeFile(join(fixture, 'exam-packs/test-exam/manifest.json'), JSON.stringify(manifest));
  await assert.rejects(buildStandalone({ root: fixture, examId: 'test-exam', dist: join(fixture, 'invalid') }), /examPackVersion/);
});

test('O4 PWA: fresh install precaches every runtime module and all packaged content', async () => {
  const sw = worker();
  await sw.dispatch('install');
  assert.equal(sw.skips, 0);
  for (const name of built.files.filter((name) => name !== 'sw.js')) assert.ok(sw.entries.has(`https://study.test/Nivelando_Game/${name}`), name);
  for (const name of ['curriculum', 'revision', 'analytics', 'factory']) {
    const response = await sw.dispatch('fetch', { request: { method: 'GET', mode: 'cors', url: `https://study.test/Nivelando_Game/core/src/${name}.js` } });
    assert.equal(response.status, 200);
    assert.equal(await response.text(), await readFile(join(dist, 'core/src', `${name}.js`), 'utf8'));
  }
});

test('O4 PWA: activation deletes only StudyOS caches in this exact scope', async () => {
  const scope = 'https://study.test/Nivelando_Game/';
  const prefix = `studyos-scope:${encodeURIComponent(scope)}:`;
  const unrelated = ['other-app-cache', 'studyos-legacy-unscoped', `studyos-scope:${encodeURIComponent('https://study.test/other/')}:old`];
  const sw = worker(swSource, scope, [...unrelated, `${prefix}old-build`]);
  await sw.dispatch('install');
  const current = [...sw.cacheNames].find((name) => name.startsWith(prefix) && !name.endsWith('old-build'));
  await sw.dispatch('activate');
  assert.deepEqual(sw.deleted, [`${prefix}old-build`]);
  assert.ok(sw.cacheNames.has(current));
  for (const name of unrelated) assert.ok(sw.cacheNames.has(name));
  assert.equal(sw.claims, 1);
  await sw.dispatch('message', { data: { type: 'OTHER' } }); assert.equal(sw.skips, 0);
  await sw.dispatch('message', { data: { type: 'SKIP_WAITING' } }); assert.equal(sw.skips, 1);
  let health; await sw.dispatch('message', { data: { type: 'STUDYOS_HEALTH' }, ports: [{ postMessage(value) { health = value; } }] });
  assert.equal(health.cacheName, current);
  assert.equal(health.buildId, 'pwa-build-a');
  const other = await buildStandalone({ dist: await mkdtemp(join(tmpdir(), 'studyos-o4-pwa-b-')), buildId: 'pwa-build-b', buildTimestamp: '2026-10-03T00:00:00.000Z' });
  const otherSource = await readFile(join(other.dist, 'sw.js'), 'utf8');
  assert.notEqual(swSource.match(/const CACHE_NAME = '([^']+)'/)[1], otherSource.match(/const CACHE_NAME = '([^']+)'/)[1]);
});

test('O4 PWA: offline hash routes serve one consistent build and external requests pass through', async () => {
  const sw = worker(); await sw.dispatch('install');
  for (const route of ['#today', '#questions', '?launch=installed#progress']) {
    const response = await sw.dispatch('fetch', { request: { method: 'GET', mode: 'navigate', url: `https://study.test/Nivelando_Game/${route}` } });
    assert.equal(await response.text(), await readFile(join(dist, 'index.html'), 'utf8'));
  }
  const alias = await sw.dispatch('fetch', { request: { method: 'GET', mode: 'cors', url: 'https://study.test/Nivelando_Game/site-app.js?v=pwa-build-a' } });
  assert.equal(alias.status, 200);
  for (const url of ['https://external.test/video', 'https://study.test/other/index.html', 'https://study.test/Nivelando_Game/unknown.json']) assert.equal(await sw.dispatch('fetch', { request: { method: 'GET', mode: 'cors', url } }), undefined);
  assert.equal(await sw.dispatch('fetch', { request: { method: 'POST', url: 'https://study.test/Nivelando_Game/index.html' } }), undefined);
  sw.entries.delete('https://study.test/Nivelando_Game/core/src/analytics.js');
  const missing = await sw.dispatch('fetch', { request: { method: 'GET', url: 'https://study.test/Nivelando_Game/core/src/analytics.js' } });
  assert.equal(missing.status, 503, 'must not mix network assets from a newer release');
});

test('O4 PWA: install manifest retains SVG first and includes real PNG 192/512', async () => {
  const manifest = JSON.parse(await readFile(join(dist, 'manifest.webmanifest'), 'utf8'));
  assert.equal(manifest.icons[0].src, './icon.svg');
  assert.equal(manifest.start_url, './'); assert.equal(manifest.scope, './');
  for (const size of [192, 512]) {
    const icon = manifest.icons.find((item) => item.sizes === `${size}x${size}`);
    assert.equal(icon.type, 'image/png');
    const data = await readFile(join(dist, icon.src));
    assert.equal(data.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
    assert.equal(data.readUInt32BE(16), size); assert.equal(data.readUInt32BE(20), size);
    const chunks = []; for (let offset = 8; offset < data.length;) { const length = data.readUInt32BE(offset); if (data.toString('ascii', offset + 4, offset + 8) === 'IDAT') chunks.push(data.subarray(offset + 8, offset + 8 + length)); offset += length + 12; }
    assert.equal(inflateSync(Buffer.concat(chunks)).length, size * (size * 3 + 1));
  }
});

test('O4 PWA: health never creates/upgrades storage or reads personal records', async () => {
  let opens = 0, closes = 0, aborts = 0;
  assert.equal((await inspectIndexedDB({ async databases() { return []; }, open() { opens++; throw new Error('must not open'); } }, built.metadata)).status, 'not-created');
  assert.equal(opens, 0);
  const name = `studyos-${built.metadata.examId}-v${built.metadata.storageVersion}`;
  const api = { async databases() { return [{ name }]; }, open(...args) {
    assert.deepEqual(args, [name]); opens++;
    const request = { result: { objectStoreNames: ['records'], version: 2, close() { closes++; }, transaction() { throw new Error('must not read records'); } } };
    queueMicrotask(() => request.onsuccess()); return request;
  } };
  assert.equal((await inspectIndexedDB(api, built.metadata)).status, 'readable');
  assert.equal(closes, 1);
  const race = { ...api, open() { const request = { transaction: { abort() { aborts++; queueMicrotask(() => request.onerror()); } } }; queueMicrotask(() => request.onupgradeneeded()); return request; } };
  assert.equal((await inspectIndexedDB(race, built.metadata)).status, 'unreadable'); assert.equal(aborts, 1);
  const base = new URL('https://study.test/Nivelando_Game/');
  const prefix = `studyos-scope:${encodeURIComponent(base.href)}:`;
  const worker = { state: 'activated', postMessage(message, ports) { assert.equal(message.type, 'STUDYOS_HEALTH'); ports[0].postMessage({ cacheName: `${prefix}build`, buildId: built.metadata.buildId, appVersion: built.metadata.appVersion }); } };
  const health = await collectHealth({ base, idb: api, nav: { serviceWorker: { controller: worker, async getRegistration(scope) { assert.equal(scope, base.href); return { scope, active: worker }; } } },
    cacheStorage: { async keys() { return [`${prefix}build`, 'private-other-app-cache']; }, open() { throw new Error('must not create cache'); } },
    fetcher: async (url) => new Response(JSON.stringify(url.pathname.endsWith('build-meta.json') ? built.metadata : { examId: built.metadata.examId, version: built.metadata.examPackVersion, schemaVersion: built.metadata.schemaVersion })) });
  assert.equal(health.passed, true); assert.equal(health.basePath, '/Nivelando_Game/');
  assert.equal(JSON.stringify(health).includes('private-other-app'), false);
  const source = await readFile(join(dist, 'release-diagnostics.js'), 'utf8');
  assert.doesNotMatch(source, /submitAnswer|awardForEvent|\.put\(|\.getAll\(|readwrite|createObjectStore|deleteDatabase/);
});

class Target {
  handlers = new Map();
  addEventListener(type, fn) { const list = this.handlers.get(type) ?? []; list.push(fn); this.handlers.set(type, list); }
  dispatchEvent(event) { for (const fn of this.handlers.get(event.type) ?? []) fn(event); }
  async emit(type) { await Promise.all((this.handlers.get(type) ?? []).map((fn) => fn({ type }))); }
}
class Element extends Target {
  dataset = {}; children = []; hidden = true; disabled = false; textContent = '';
  append(...children) { this.children.push(...children); }
  replaceChildren() { this.children = []; }
}
async function appHarness(waiting = true) {
  const document = new Target(), window = new Target(), serviceWorker = new Target(), registration = new Target();
  const banner = new Element(), status = new Element(), messages = [];
  let reloads = 0, confirms = 0;
  document.documentElement = { dataset: { studyActive: 'false' } };
  document.querySelector = (selector) => selector === '#update-banner' ? banner : selector === '#session-status' ? status : null;
  document.createElement = () => new Element();
  window.confirm = () => { confirms++; return true; };
  window.location = { reload() { reloads++; } };
  registration.waiting = waiting ? { postMessage(value) { messages.push(value); } } : null;
  serviceWorker.register = async (url, options) => { assert.equal(url, 'https://study.test/Nivelando_Game/sw.js'); assert.equal(options.scope, 'https://study.test/Nivelando_Game/'); return registration; };
  serviceWorker.controller = {};
  const source = (await readFile(join(root, 'core/app.js'), 'utf8')).replaceAll('import.meta.url', "'https://study.test/Nivelando_Game/app.js'");
  runInNewContext(source, { document, window, navigator: { serviceWorker }, URL, CustomEvent: class { constructor(type, options) { this.type = type; this.detail = options?.detail; } } });
  await Promise.resolve();
  return { document, window, serviceWorker, registration, banner, messages, get reloads() { return reloads; }, get confirms() { return confirms; }, button() { return banner.children[1]; } };
}

test('O4 PWA: waiting on load and updatefound show banner; reload requires explicit activation', async () => {
  const app = await appHarness(); assert.equal(app.banner.hidden, false);
  await app.serviceWorker.emit('controllerchange'); assert.equal(app.reloads, 0);
  await app.button().emit('click'); assert.equal(app.messages[0].type, 'SKIP_WAITING'); assert.equal(app.reloads, 0);
  await app.serviceWorker.emit('controllerchange'); await app.serviceWorker.emit('controllerchange'); assert.equal(app.reloads, 1);
  const found = await appHarness(false); assert.equal(found.banner.hidden, true);
  found.registration.installing = new Target(); found.registration.installing.state = 'installing';
  await found.registration.emit('updatefound');
  found.registration.waiting = { postMessage() {} }; found.registration.installing.state = 'installed';
  await found.registration.installing.emit('statechange'); assert.equal(found.banner.hidden, false);
});

test('O4 PWA: active study blocks update unless confirmed pause commits and clears activity', async () => {
  const app = await appHarness(); app.document.documentElement.dataset.studyActive = 'true';
  app.window.confirm = () => false; await app.button().emit('click'); assert.equal(app.messages.length, 0);
  app.window.confirm = () => true; await app.button().emit('click'); assert.equal(app.messages.length, 0);
  let resolvePause;
  app.window.studyosUpdates.setSessionGuard({ isActive: () => app.document.documentElement.dataset.studyActive === 'true', pause: () => new Promise((resolve) => { resolvePause = resolve; }) });
  const pending = app.button().emit('click'); await Promise.resolve(); assert.equal(app.messages.length, 0);
  app.document.documentElement.dataset.studyActive = 'false'; resolvePause(); await pending; assert.equal(app.messages.length, 1);
  const failure = await appHarness(); failure.document.documentElement.dataset.studyActive = 'true';
  failure.window.studyosUpdates.setSessionGuard({ isActive: () => true, async pause() { throw new Error('storage failed'); } });
  await failure.button().emit('click'); assert.equal(failure.messages.length, 0); assert.equal(failure.button().disabled, false);
  const event = await appHarness(); event.document.documentElement.dataset.studyActive = 'true';
  event.document.addEventListener('studyos:before-update', ({ detail }) => detail.waitUntil(Promise.resolve().then(() => { event.document.documentElement.dataset.studyActive = 'false'; })));
  await event.button().emit('click'); assert.equal(event.messages.length, 1);
});
