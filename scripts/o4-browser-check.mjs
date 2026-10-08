import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import { existsSync } from 'node:fs';
import { createServer } from 'node:http';
import { execFileSync } from 'node:child_process';
import { resolve, dirname, extname, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { invalidBackups } from '../core/tests/fixtures/invalid-backups.mjs';
import { validateBackupPayload } from '../core/src/production.js';

// Usage: node scripts/o4-browser-check.mjs [--url https://host/Nivelando_Game/]
//        [--output docs/O4_BROWSER_EVIDENCE.json] [--expected-commit SHA]
// No persistent profile, account, publication, or external paid service is used.
const root = fileURLToPath(new URL('../', import.meta.url));
const dist = resolve(root, 'sites/tce-go-ti-2026/dist');
const fixtures = resolve(root, 'sites/tce-go-ti-2026/tests/o4-browser-fixtures');
const args = process.argv.slice(2);
const options = {};
for (let i = 0; i < args.length; i += 2) {
  assert(['--url', '--output', '--expected-commit', '--recovery-only'].includes(args[i]), `Unknown option ${args[i]}`);
  assert(args[i + 1] && !args[i + 1].startsWith('--'), `Missing value for ${args[i]}`);
  options[args[i].slice(2)] = args[i + 1];
}
const recoveryOnly = options['recovery-only'] === 'true';
const output = resolve(root, options.output ?? 'docs/O4_BROWSER_EVIDENCE.json');
const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 }).trimEnd();
const report = { evidenceVersion: 1, startedAt: new Date().toISOString(), mode: options.url ? 'remote' : 'local', isolation: 'headless browser.newContext; no persistent profile', checks: [], metadata: null };
let browser, server;
let validationExpected = false;
const validationMessages = [];
const contexts = new Set();
const timeout = 20000;
async function check(name, work) {
  const start = Date.now();
  console.log(`RUN ${name}`);
  try {
    const evidence = await work();
    report.checks.push({ name, passed: true, durationMs: Date.now() - start, evidence: evidence ?? null });
    console.log(`PASS ${name}`);
    return evidence;
  } catch (error) {
    report.checks.push({ name, passed: false, durationMs: Date.now() - start, error: String(error.stack ?? error) });
    console.error(`FAIL ${name}: ${error.message}`);
    return null;
  }
}
async function playwright() {
  try { return await import('playwright'); }
  catch (error) {
    if (!process.env.STUDYOS_PLAYWRIGHT_PATH) throw new Error(`Playwright unavailable; install the devDependency or set STUDYOS_PLAYWRIGHT_PATH. ${error.message}`);
    const entry = process.env.STUDYOS_PLAYWRIGHT_PATH;
    return import(pathToFileURL(extname(entry) ? entry : resolve(entry, 'index.mjs')).href);
  }
}
async function serve() {
  const mime = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json' };
  server = createServer(async (req, res) => {
    try {
      const url = new URL(req.url, 'http://localhost');
      if (!url.pathname.startsWith('/Nivelando_Game/')) { res.writeHead(404); res.end(); return; }
      const relative = decodeURIComponent(url.pathname.slice('/Nivelando_Game/'.length)) || 'index.html';
      const distPath = resolve(dist, relative);
      if (!distPath.startsWith(dist + sep)) { res.writeHead(403); res.end(); return; }
      const path = relative === 'site-app.js'
        ? resolve(root, 'sites/tce-go-ti-2026/site-app.js')
        : relative.startsWith('core/src/') ? resolve(root, relative) : distPath;
      if (path !== distPath && !path.startsWith(resolve(root) + sep)) { res.writeHead(403); res.end(); return; }
      let data = await readFile(path);
      if (relative === 'index.html' && !options.url) data = Buffer.from(data.toString('utf8').replace(/<script type="module" src="\.\/app\.js"><\/script>\s*/, ''));
      res.writeHead(200, { 'Content-Type': mime[extname(path)] ?? 'application/octet-stream', 'Cache-Control': 'no-store' }); res.end(data);
    } catch { res.writeHead(404); res.end(); }
  });
  await new Promise((done, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', done); });
  return `http://127.0.0.1:${server.address().port}/Nivelando_Game/`;
}
let base;
const url = path => new URL(path, base).href;
let localBaseRoutesRegistered = 0;
async function routeLocalProductionIndex(page) {
  if (options.url) return false;
  const productionIndex = await readFile(resolve(dist, 'index.html'), 'utf8');
  await page.route(base, route => route.fulfill({ status: 200, contentType: 'text/html', body: productionIndex }));
  localBaseRoutesRegistered++;
  return true;
}
async function isolated(viewport = { width: 1280, height: 900 }) {
  const context = await browser.newContext({ viewport, acceptDownloads: true, serviceWorkers: 'allow', locale: 'pt-BR' });
  contexts.add(context);
  const page = await context.newPage();
  page.setDefaultTimeout(timeout);
  page.setDefaultNavigationTimeout(timeout);
  page.on('dialog', dialog => dialog.type() === 'confirm' ? dialog.accept() : dialog.dismiss());
  return { context, page };
}
async function close(context) { await context.close(); contexts.delete(context); }
async function showView(page, id) {
  await page.evaluate(viewId => {
    if (!location.hash && viewId === 'today') history.replaceState(null, '', '#today');
    else if (location.hash !== `#${viewId}`) location.hash = `#${viewId}`;
  }, id);
  await page.locator(`#${id}`).waitFor({ state: 'visible' });
}
async function ready(page) {
  await showView(page, 'today');
  await page.locator('#today-dashboard select[aria-label="Minutos disponíveis hoje"]').waitFor();
  await page.locator('#production-settings button').first().waitFor({ state: 'attached' });
}
async function open(page) { await page.goto(base); await ready(page); }
async function snapshot(page) {
  return page.evaluate(async () => {
    const request = indexedDB.open('studyos-tce-go-ti-2026-v2');
    const db = await new Promise((resolve, reject) => { request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error); });
    try {
      const rows = await new Promise((resolve, reject) => {
        const tx = db.transaction('records', 'readonly');
        let result;
        tx.objectStore('records').getAll().onsuccess = event => { result = event.target.result; };
        tx.oncomplete = () => resolve(result); tx.onerror = () => reject(tx.error);
      });
      return { version: db.version, rows: rows.sort((a, b) => a.key.localeCompare(b.key)), settings: Object.fromEntries(Object.entries(localStorage).filter(([key]) => key.startsWith('studyos-')).sort(([a], [b]) => a.localeCompare(b))) };
    } finally { db.close(); }
  });
}
const INTERNAL_GENERATION_KEY = '__studyos_meta__::system::generation';
function restoredRows(state) {
  return state.rows.filter(row => row.namespace !== '__studyos_backups__' && row.key !== INTERNAL_GENERATION_KEY);
}
function storageGeneration(state) {
  const row = state.rows.find(candidate => candidate.key === INTERNAL_GENERATION_KEY);
  if (!row) return 0;
  assert(Number.isSafeInteger(row.value?.generation) && row.value.generation >= 0, 'Internal storage generation must be a nonnegative safe integer');
  return row.value.generation;
}
const rows = (state, collection) => state.rows.filter(row => row.collection === collection);
const xp = state => rows(state, 'xp-awards').reduce((sum, row) => sum + row.value.xp, 0);
async function waitState(page, predicate) {
  const until = Date.now() + timeout;
  let state;
  while (Date.now() < until) {
    state = await snapshot(page);
    if (predicate(state)) return state;
    await page.waitForTimeout(50);
  }
  throw new Error('Persistent state did not reach expected condition');
}
async function download(page) {
  const previousView = (await page.evaluate(() => location.hash.slice(1))) || 'today';
  await showView(page, 'settings');
  const pending = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Exportar meus dados', exact: true }).click();
  const file = await pending;
  assert.equal(await file.failure(), null);
  await showView(page, previousView);
  return { filename: file.suggestedFilename(), payload: JSON.parse(await readFile(await file.path(), 'utf8')) };
}
async function importFile(page, payload) {
  await showView(page, 'settings');
  await page.getByLabel('Selecionar backup JSON', { exact: true }).setInputFiles({ name: 'o4-fixture.json', mimeType: 'application/json', buffer: Buffer.from(typeof payload === 'string' ? payload : JSON.stringify(payload)) });
  await page.getByRole('button', { name: 'Importar backup', exact: true }).click();
}
// Use the same full JSON Schema dialect as the source suite, including conditionals.
async function validateBackupSchema(value) {
  const directory = resolve(root, 'schemas');
  const ajv = new Ajv2020({ strict: false, allErrors: true });
  addFormats(ajv);
  for (const file of await readdir(directory)) {
    if (file.endsWith('.json')) ajv.addSchema(JSON.parse(await readFile(resolve(directory, file), 'utf8')), file);
  }
  assert(ajv.validate('backup.schema.json', value), ajv.errorsText(ajv.errors));
}

async function seed(page, version) {
  const prefix = '__o4_isolated__/';
  const seedSource = await readFile(resolve(fixtures, 'o3-seed.mjs'), 'utf8');
  await page.route(`${url(prefix)}**`, async route => {
    const path = new URL(route.request().url()).pathname.split(prefix)[1];
    if (path === 'blank.html') { await route.fulfill({ contentType: 'text/html', body: '<!doctype html><title>Disposable O3 fixture</title>' }); return; }
    if (path === 'seed.mjs') { await route.fulfill({ contentType: 'text/javascript', body: seedSource }); return; }
    const source = path.startsWith('pack/') ? `exam-packs/tce-go-ti-2026/${path.slice(5)}` : `core/src/${path}`;
    assert(/^[a-zA-Z0-9/_.-]+$/.test(source) && !source.includes('..'));
    await route.fulfill({ contentType: path.endsWith('.json') ? 'application/json' : 'text/javascript', body: git('show', `o3-content-stable:${source}`) });
  });
  await page.goto(url(`${prefix}blank.html`));
  const details = await page.evaluate(async ({ seedUrl, base, dbVersion }) => (await import(seedUrl)).seedO3({ base, dbVersion }), { seedUrl: url(`${prefix}seed.mjs`), base: url(prefix), dbVersion: version });
  const state = await snapshot(page);
  for (const collection of ['scores', 'retakes', 'mastery', 'today-plans', 'activity-state', 'diagnostic-runs', 'diagnostic-question-bank', 'revisions', 'events', 'xp-awards', 'progress']) assert(rows(state, collection).length, `Seed missing ${collection}`);
  assert(rows(state, 'scores').every(row => row.key.includes('::o3::historical-run::')));
  assert(rows(state, 'mastery').every(row => row.namespace === '__studyos_global__'));
  return { details, state };
}
function preserved(before, after) {
  const byKey = new Map(after.rows.map(row => [row.key, row]));
  for (const row of before.rows) assert.deepEqual(byKey.get(row.key), row, `Lost or changed ${row.key}`);
  for (const [key, value] of Object.entries(before.settings)) assert.equal(after.settings[key], value, `Lost setting ${key}`);
}

try {
  report.checkoutCommit = git('rev-parse', 'HEAD');
  report.checkoutDirty = git('status', '--porcelain').split('\n').filter(Boolean);
  report.o3SourceCommit = git('rev-parse', 'o3-content-stable^{commit}');
  base = options.url ? new URL(options.url.endsWith('/') ? options.url : `${options.url}/`).href : await serve();
  report.baseNavigationInterception = { mode: report.mode, localRoutesRegistered: 0 };
  if (options.url) assert.equal(await routeLocalProductionIndex({ route: async () => { throw new Error('Remote base route must not be registered'); } }), false, 'Remote mode must not install a local base route');
  assert(['http:', 'https:'].includes(new URL(base).protocol));
  report.url = base;
  const pw = await playwright();
  const localEdge = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
  const executablePath = process.env.STUDYOS_BROWSER_PATH || (process.platform === 'win32' && existsSync(localEdge) ? localEdge : undefined);
  browser = await pw.chromium.launch({ headless: true, ...(executablePath ? { executablePath } : {}) });
  report.browser = { version: browser.version(), executable: executablePath ?? 'playwright chromium' };
  const { context, page } = await isolated();
  const consoleErrors = [], failedRequests = [], httpErrors = [], externalRequests = [], requests = [];
  let collecting = true;
  context.on('request', req => {
    if (!collecting) return;
    requests.push({ url: req.url(), resourceType: req.resourceType() });
    if (/^https?:/.test(req.url()) && new URL(req.url()).origin !== new URL(base).origin) externalRequests.push(req.url());
  });
  context.on('response', res => { if (collecting && res.status() >= 400) httpErrors.push({ url: res.url(), status: res.status() }); });
  context.on('requestfailed', req => { if (collecting) failedRequests.push({ url: req.url(), error: req.failure()?.errorText }); });
  page.on('console', message => {
    if (!collecting || message.type() !== 'error') return;
    if (validationExpected && message.text().startsWith('StudyOS operation failed')) validationMessages.push(message.text());
    else consoleErrors.push(message.text());
  });
  page.on('pageerror', error => { if (collecting) consoleErrors.push(String(error)); });

  await check('build metadata identifies tested commit', async () => {
    const response = await context.request.get(url('build-meta.json'));
    assert(response.ok()); report.metadata = await response.json();
    const expected = options['expected-commit'] ?? process.env.GITHUB_SHA ?? report.checkoutCommit;
    report.expectedCommit = expected;
    assert(report.metadata.commitSha === expected || (options['recovery-only'] === 'true' && report.metadata.commitSha === 'local'), 'Build must use the exact expected commit, never local');
    assert.equal(report.metadata.channel, 'production');
    assert(report.metadata.buildId && Number.isFinite(Date.parse(report.metadata.buildTimestamp)));
    return report.metadata;
  });
  if (!recoveryOnly) await check('first-run onboarding and today', async () => {
    await open(page);
    assert(await page.locator('#study-onboarding').innerText(), 'First-run guide missing');
    assert(await page.locator('#today-dashboard').getByRole('list', { name: 'Agenda de hoje' }).count());
    const state = await snapshot(page);
    assert(rows(state, 'today-plans').length); assert.equal(rows(state, 'scores').length, 0);
    return { todayPlans: rows(state, 'today-plans').length, onboarding: await page.locator('#study-onboarding').innerText() };
  });
  if (!recoveryOnly) await check('bootstrap requests and performance bytes', async () => {
    const metrics = await page.evaluate(() => ({ navigation: performance.getEntriesByType('navigation').map(e => ({ domContentLoadedMs: e.domContentLoadedEventEnd, loadMs: e.loadEventEnd, transferSize: e.transferSize })), resources: performance.getEntriesByType('resource').map(e => ({ name: e.name, transferSize: e.transferSize, encodedBodySize: e.encodedBodySize, decodedBodySize: e.decodedBodySize, durationMs: e.duration })) }));
    const bootstrapQuestions = metrics.resources.filter(r => new URL(r.name).pathname.endsWith('/questions.json'));
    assert(bootstrapQuestions.length <= 1, 'Bootstrap fetched the question bank repeatedly');
    const bytes = metrics.resources.reduce((sum, r) => sum + r.encodedBodySize, 0);
    assert(bytes > 0, 'No measurable bootstrap body bytes');
    return { ...metrics, bytes, questionBankRequests: bootstrapQuestions.length, requestCount: requests.length, requests: [...requests] };
  });
  // UI scenarios defined below run even if another scenario failed.
  if (!recoveryOnly) await runUiChecks(page);
  if (!recoveryOnly) await check('console, HTTP and telemetry audit', async () => {
    assert.deepEqual(consoleErrors, [], JSON.stringify({ httpErrors, failedRequests, externalRequests })); assert.deepEqual(httpErrors, []); assert.deepEqual(failedRequests, []); assert.deepEqual(externalRequests, []);
    return { consoleErrors, expectedInvalidImportMessages: validationMessages, httpErrors, failedRequests, externalRequests, requestCount: requests.length };
  });
  collecting = false;
  await check('corrupt-state recovery download is separate and valid backup import restores readiness', async () => {
    const { context: sourceContext, page: sourcePage } = await isolated();
    const { context: recoveryContext, page: recoveryPage } = await isolated();
    try {
      const sourceErrors = [];
      for (const target of [sourcePage, recoveryPage]) {
        target.on('console', message => { if (message.type() === 'error') sourceErrors.push(message.text()); });
        target.on('pageerror', error => sourceErrors.push(String(error)));
        target.on('response', response => { if (response.status() >= 400) sourceErrors.push(`${response.status()} ${response.url()}`); });
      }
      try { await open(sourcePage); }
      catch (error) { throw new Error(`${error.message}; page=${(await sourcePage.locator('body').innerText()).slice(0, 1200)}; errors=${JSON.stringify(sourceErrors)}`); }
      const validBackup = await download(sourcePage);
      await validateBackupSchema(validBackup.payload);
      assert.match(validBackup.filename, /^studyos-backup-.*\.json$/);
      await open(recoveryPage);
      await recoveryPage.evaluate(async () => {
        const { IndexedDbStore } = await import('./core/src/storage.js');
        const store = new IndexedDbStore({ name: 'studyos-tce-go-ti-2026-v2', version: 2 });
        await store.put('tce-go-ti-2026', 'study-reading', 'theory:corrupt-reading', { status: 'paused', activity: null });
      });
      await recoveryPage.reload();
      await recoveryPage.locator('#session-status[role="alert"]').waitFor();
      await showView(recoveryPage, 'settings');
      for (const name of ['Exportar meus dados', 'Importar backup', 'Baixar snapshot bruto de recuperação']) {
        await recoveryPage.getByRole('button', { name, exact: true }).waitFor({ state: 'visible' });
      }
      const recoveryWarning = await recoveryPage.locator('#production-settings').innerText();
      assert.match(recoveryWarning, /não validados/i);
      assert.match(recoveryWarning, /não pode ser importado como backup normal/i);
      let confirmationSeen = false;
      recoveryPage.on('dialog', dialog => { if (dialog.type() === 'confirm') confirmationSeen = true; });
      const readyAfterRestore = recoveryPage.waitForEvent('load');
      await importFile(recoveryPage, validBackup.payload);
      await readyAfterRestore;
      await ready(recoveryPage);
      assert(confirmationSeen, 'Import must pass through the user confirmation dialog');
      const restored = await snapshot(recoveryPage);
      assert(rows(restored, 'today-plans').length, 'Valid backup plan was not restored');
      assert(!rows(restored, 'study-reading').some(row => row.key.includes('corrupt-reading')), 'Corrupt reading survived valid backup restore');

      await showView(recoveryPage, 'settings');
      const recoveryDownload = recoveryPage.waitForEvent('download');
      await recoveryPage.getByRole('button', { name: 'Baixar snapshot bruto de recuperação', exact: true }).click();
      const file = await recoveryDownload;
      assert.equal(await file.failure(), null);
      assert.match(file.suggestedFilename(), /^studyos-raw-recovery-only-.*\.json$/);
      assert.notEqual(file.suggestedFilename(), validBackup.filename);
      const rawText = await readFile(await file.path(), 'utf8');
      const rawSnapshot = JSON.parse(rawText);
      assert.equal(rawSnapshot.kind, 'studyos-recovery');
      assert.equal(rawSnapshot.recoveryOnly, true);
      assert.match(rawText, /corrupt-reading/);
      assert.match(rawText, /"status"\s*:\s*"paused"/);
      assert.match(rawText, /"activity"\s*:\s*null/);
      assert.throws(() => validateBackupPayload(rawSnapshot, { examId: 'tce-go-ti-2026', metadata: report.metadata, requireComplete: true }), /backup/i, 'Raw recovery envelope must not validate as a normal backup');
      assert.match(await recoveryPage.locator('#production-settings').innerText(), /não foi validado e não pode ser importado como backup normal/i);
      await recoveryPage.reload(); await ready(recoveryPage);
      return { recoveryControlsAvailable: true, existingCorruptionReported: true, confirmationSeen, validBackupRestored: true, readyAfterReload: true, recoveryFilename: file.suggestedFilename(), rawSnapshotIsRecoveryOnly: true, rawSnapshotKeys: Object.keys(rawSnapshot) };
    } finally { await close(sourceContext); await close(recoveryContext); }
  });
  if (!recoveryOnly) {
  await check('real service worker offline reload and study', async () => {
    const { context: offlineContext, page: offlinePage } = await isolated();
    try {
      // The shared local server strips app.js to isolate ordinary UI checks.
      // Serve the actual built entry document here so it can register the SW.
      await routeLocalProductionIndex(offlinePage);
      await open(offlinePage);
      await offlinePage.evaluate(async () => { await navigator.serviceWorker.ready; });
      await offlinePage.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
      const online = await snapshot(offlinePage);
      await offlineContext.setOffline(true);
      const response = await offlinePage.reload();
      assert(response?.fromServiceWorker(), 'Offline navigation did not come from service worker');
      await ready(offlinePage);
      preserved(online, await snapshot(offlinePage));
      await showView(offlinePage, 'flashcards');
      await offlinePage.locator('#flashcards-panel').getByRole('button').first().click();
      await offlinePage.getByRole('button', { name: 'Revelar resposta', exact: true }).click();
      await offlinePage.locator('.flashcard-answer').waitFor();
      return { offline: true, serviceWorkerNavigation: true, studyContentRendered: true };
    } finally { await offlineContext.setOffline(false); await close(offlineContext); }
  });
  await close(context);

  for (const version of [2, 1]) await check(`O3 database ${version} load/upgrade preserves every seeded row and settings`, async () => {
    const { context, page } = await isolated();
    try {
      const seeded = await seed(page, version);
      await open(page);
      const after = await snapshot(page);
      preserved(seeded.state, after);
      assert.equal(after.version, report.metadata.storageVersion);
      await page.reload(); await ready(page); preserved(seeded.state, await snapshot(page));
      const exported = await download(page);
      await validateBackupSchema(exported.payload);
      const score = exported.payload.data.collections.scores.find(r => r.id.startsWith('o3::historical-run::'));
      assert(score, 'Export truncated the compound score ID');
      assert.equal(score.value.correct, false);
      assert(exported.payload.globalData.collections.mastery.length);
      return { ...seeded.details, sourceCommit: report.o3SourceCommit, rowCount: seeded.state.rows.length, collections: [...new Set(seeded.state.rows.map(r => r.collection))], fullKeySnapshot: seeded.state.rows.map(r => r.key), exportedScoreId: score.id, loadedDatabaseVersion: after.version };
    } finally { await close(context); }
  });
  await check('technical health page', async () => {
    const { context, page } = await isolated();
    try {
      await routeLocalProductionIndex(page);
      await open(page);
      await page.evaluate(async () => { await navigator.serviceWorker.ready; });
      await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
      const before = await snapshot(page);
      await page.goto(url('release-diagnostics.html'));
      await page.locator('#run').click();
      await page.locator('#output[data-result]').waitFor();
      const health = JSON.parse(await page.locator('#output').innerText());
      assert.equal(health.passed, true); assert(health.checks.every(c => c.passed));
      assert.equal(health.metadata.commitSha, report.metadata.commitSha);
      assert.deepEqual(await snapshot(page), before, 'Health page must be read-only');
      return health;
    } finally { await close(context); }
  });
  for (const viewport of [{ width: 375, height: 667 }, { width: 390, height: 844 }, { width: 430, height: 932 }, { width: 1280, height: 900 }]) await check(`layout and keyboard ${viewport.width}x${viewport.height}`, async () => {
    const { context, page } = await isolated(viewport);
    try {
      await routeLocalProductionIndex(page);
      await open(page);
      const overflow = async () => page.evaluate(() => ({ viewport: innerWidth, document: document.documentElement.scrollWidth, body: document.body.scrollWidth, offenders: [...document.querySelectorAll('main *, header *')].filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && (r.right > innerWidth + 1 || r.left < -1); }).map(e => `${e.tagName}#${e.id}.${e.className}`) }));
      const before = await overflow(); assert(before.document <= viewport.width + 1 && before.body <= viewport.width + 1, JSON.stringify(before));
      await page.keyboard.press('Tab');
      assert.equal(await page.evaluate(() => document.activeElement?.textContent.trim()), 'Pular para o conteúdo');
      await page.keyboard.press('Enter'); assert.equal(await page.evaluate(() => document.activeElement?.id), 'main-content');
      const menu = page.locator('#menu-toggle');
      if (await menu.isVisible()) {
        await menu.focus(); await page.keyboard.press('Enter'); assert.equal(await menu.getAttribute('aria-expanded'), 'true');
        await page.getByRole('navigation').locator('.nav-group summary').filter({ hasText: 'Prática' }).click();
        await page.getByRole('navigation').getByRole('link', { name: 'Questões', exact: true }).click();
      }
      await showView(page, 'today');
      await page.locator('#today-dashboard').getByRole('button', { name: 'COMEÇAR', exact: true }).click();
      await page.locator('.question-options button').first().waitFor();
      const after = await overflow(); assert(after.document <= viewport.width + 1 && after.body <= viewport.width + 1, JSON.stringify(after));
      assert.equal(await page.evaluate(() => document.activeElement?.tagName), 'H2');
      const focus = await page.evaluate(() => { const style = getComputedStyle(document.activeElement); return { outlineStyle: style.outlineStyle, outlineWidth: style.outlineWidth }; });
      await page.keyboard.press('Tab');
      assert.equal(await page.evaluate(() => document.activeElement?.tagName), 'SUMMARY');
      await page.keyboard.press('Enter');
      assert.equal(await page.evaluate(() => document.activeElement.parentElement.open), true);
      await page.keyboard.press('Tab');
      assert.equal(await page.evaluate(() => document.activeElement?.tagName), 'BUTTON');
      await page.keyboard.press('Enter'); await page.locator('.study-feedback').waitFor();
      return { before, after, keyboardAnswer: true, headingFocus: focus };
    } finally { await close(context); }
  });
  }
} catch (error) {
  report.checks.push({ name: 'runner setup/execution', passed: false, error: String(error.stack ?? error) });
  console.error(error);
} finally {
  report.baseNavigationInterception = { mode: report.mode, localRoutesRegistered: localBaseRoutesRegistered };
  if (options.url) assert.equal(localBaseRoutesRegistered, 0, 'Remote mode registered a local base navigation route');
  for (const context of contexts) await context.close().catch(() => {});
  await browser?.close();
  if (server) await new Promise(done => server.close(done));
  report.finishedAt = new Date().toISOString();
  report.passed = report.checks.length > 0 && report.checks.every(c => c.passed);
  report.summary = { passed: report.checks.filter(c => c.passed).length, failed: report.checks.filter(c => !c.passed).length };
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, `${JSON.stringify(report, null, 2)}\n`);
  console.log(`${report.passed ? 'PASS' : 'FAIL'} ${JSON.stringify(report.summary)}; evidence: ${output}`);
  if (!report.passed) process.exitCode = 1;
}

async function runUiChecks(page) {
  await check('quiz feedback, retake immutable score/XP, pause and reload', async () => {
    await page.locator('#today-dashboard').getByRole('button', { name: 'COMEÇAR', exact: true }).click();
    await page.locator('.question-options button').first().click();
    await page.locator('.study-feedback').waitFor();
    const before = await snapshot(page);
    assert(rows(before, 'scores').length); assert(rows(before, 'mastery').length); assert(rows(before, 'revisions').length);
    await page.getByRole('button', { name: 'Tentar novamente (preserva score e XP)', exact: true }).click();
    await page.locator('.question-options button').last().click(); await page.locator('.study-feedback').waitFor();
    const after = await snapshot(page);
    assert.deepEqual(rows(after, 'scores'), rows(before, 'scores')); assert.equal(xp(after), xp(before));
    assert.equal(rows(after, 'retakes').length, rows(before, 'retakes').length + 1);
    await page.getByRole('button', { name: 'Pausar e continuar depois', exact: true }).click();
    await page.getByRole('heading', { name: 'Sessão pausada', exact: true }).waitFor();
    const paused = await snapshot(page);
    const run = rows(paused, 'study-sessions').find(row => row.value.status === 'paused'); assert(run);
    await page.reload(); await ready(page);
    await page.getByRole('button', { name: /Retomar/ }).first().click();
    await page.locator('.study-feedback').waitFor();
    const reloaded = await snapshot(page);
    assert.deepEqual(rows(reloaded, 'scores'), rows(before, 'scores')); assert.equal(xp(reloaded), xp(before));
    return { sessionId: run.value.id, firstScore: rows(before, 'scores').map(r => r.value), xp: xp(before), retakes: rows(after, 'retakes').length };
  });
  await check('complete today activity twice awards XP once', async () => {
    await finishVisible(page);
    const before = await snapshot(page);
    const completed = rows(before, 'study-sessions').find(r => r.value.activity && r.value.status === 'completed'); assert(completed);
    // Browser-side service replay deliberately changes timestamp to expose the regression.
    const result = await page.evaluate(async ({ base, examId, run }) => {
      const { IndexedDbStore } = await import(`${base}core/src/storage.js`);
      const { TodayPlanEngine } = await import(`${base}core/src/today-planner.js`);
      const store = new IndexedDbStore({ name: 'studyos-tce-go-ti-2026-v2', version: 2 });
      const plans = new TodayPlanEngine(store);
      await plans.completeActivity({ examId, date: run.date, activityId: run.activity.activityId, timestamp: '2026-10-03T23:58:00.000Z' });
      return plans.get(examId, run.date);
    }, { base, examId: report.metadata.examId ?? 'tce-go-ti-2026', run: completed.value });
    const after = await snapshot(page);
    assert.equal(xp(after), xp(before)); assert.deepEqual(rows(after, 'scores'), rows(before, 'scores'));
    assert.equal(result.completedMinutes, rows(before, 'today-plans').find(r => r.value.date === completed.value.date).value.completedMinutes);
    return { xpBefore: xp(before), xpAfter: xp(after), completedMinutes: result.completedMinutes };
  });
  await check('daily minute replan preserves completed progress through reload', async () => {
    await showView(page, 'today');
    const before = await snapshot(page);
    const plan = rows(before, 'today-plans').find(r => r.value.completedMinutes > 0)?.value; assert(plan);
    await page.locator('#today-dashboard').getByLabel('Minutos disponíveis hoje', { exact: true }).selectOption('90');
    const after = await waitState(page, state => rows(state, 'today-plans').some(r => r.value.date === plan.date && r.value.availableMinutes === 90));
    const changed = rows(after, 'today-plans').find(r => r.value.date === plan.date).value;
    assert.equal(changed.completedMinutes, plan.completedMinutes);
    for (const activity of plan.activities.filter(a => a.status === 'completed')) assert(changed.activities.some(a => a.activityId === activity.activityId && a.status === 'completed'));
    assert.equal(xp(after), xp(before));
    await page.reload(); await ready(page);
    const reloaded = rows(await snapshot(page), 'today-plans').find(r => r.value.date === plan.date).value;
    assert.equal(reloaded.availableMinutes, 90); assert.equal(reloaded.completedMinutes, plan.completedMinutes);
    assert.equal(await page.locator('#today-dashboard').getByLabel('Minutos disponíveis hoje', { exact: true }).inputValue(), '90');
    return { completedMinutes: plan.completedMinutes, availableMinutes: reloaded.availableMinutes };
  });
  await check('diagnostic answers and completion never change score or XP', async () => {
    const before = await snapshot(page);
    await showView(page, 'diagnostic');
    await page.locator('#diagnostic-panel').getByRole('button').first().click();
    await finishVisible(page);
    const after = await snapshot(page);
    assert.deepEqual(rows(after, 'scores'), rows(before, 'scores')); assert.equal(xp(after), xp(before));
    assert(rows(after, 'diagnostic-runs').some(r => r.value.status === 'completed'));
    return { scoreRows: rows(after, 'scores').length, xp: xp(after), completedRuns: rows(after, 'diagnostic-runs').filter(r => r.value.status === 'completed').length };
  });
  await check('flashcards reveal, review and persistence', async () => {
    const before = await snapshot(page);
    await showView(page, 'flashcards');
    await page.locator('#flashcards-panel').getByRole('button').first().click();
    await page.getByRole('button', { name: 'Revelar resposta', exact: true }).click();
    await page.locator('.flashcard-answer').waitFor();
    await page.getByRole('button', { name: 'Lembrei', exact: true }).click(); await page.locator('.study-feedback').waitFor();
    const after = await snapshot(page);
    assert.deepEqual(rows(after, 'scores'), rows(before, 'scores')); assert(xp(after) > xp(before));
    await page.getByRole('button', { name: 'Pausar e continuar depois', exact: true }).click();
    await page.getByRole('heading', { name: 'Sessão pausada', exact: true }).waitFor();
    await page.reload(); await ready(page);
    assert.deepEqual(rows(await snapshot(page), 'scores'), rows(before, 'scores'));
    return { reviewEvents: rows(after, 'events').filter(r => r.value.type === 'review_completed').length, xpDelta: xp(after) - xp(before) };
  });
  await check('simulation complete with immutable first-attempt score', async () => {
    await showView(page, 'simulations');
    await page.locator('#simulations-panel').getByRole('button', { name: 'Escolher simulado', exact: true }).click();
    await page.locator('#simulations-panel').getByRole('button').first().click();
    await finishVisible(page);
    const state = await snapshot(page);
    const run = rows(state, 'study-sessions').find(r => r.value.kind === 'simulation' && r.value.status === 'completed'); assert(run);
    const scores = rows(state, 'scores').filter(r => r.value.simulationRunId === run.value.id);
    assert.equal(scores.length, run.value.questionIds.length);
    assert(rows(state, 'events').some(r => r.value.type === 'simulation_finished'));
    return { sessionId: run.value.id, answered: scores.length, scorePercent: scores.filter(r => r.value.correct).length / scores.length * 100 };
  });
  await check('backup download schema and UI import round-trip', async () => {
    const before = await snapshot(page);
    const exported = await download(page);
    await validateBackupSchema(exported.payload);
    assert(exported.payload.globalData.collections.mastery.length);
    assert(Object.keys(exported.payload.settings).length);
    let prior = before;
    const restoredStates = [];
    for (let restoreIndex = 0; restoreIndex < 2; restoreIndex++) {
      const reloaded = page.waitForEvent('load');
      await importFile(page, exported.payload);
      await reloaded; await ready(page);
      const after = await snapshot(page);
      assert.equal(storageGeneration(after), storageGeneration(prior) + 1, `Restore ${restoreIndex + 1} must increment generation exactly once`);
      assert.deepEqual(restoredRows(after), restoredRows(prior), `Restore ${restoreIndex + 1} must preserve every non-internal row`);
      for (const [key, value] of Object.entries(prior.settings)) assert.equal(after.settings[key], value);
      restoredStates.push(after);
      prior = after;
    }
    return { filename: exported.filename, schemaValidated: true, rowCount: restoredRows(restoredStates[1]).length, globalMasteryCount: exported.payload.globalData.collections.mastery.length, restoreGenerationDeltas: restoredStates.map((state, index) => storageGeneration(state) - storageGeneration(index === 0 ? before : restoredStates[index - 1])) };
  });
  await check('invalid import fixtures reject without any state mutation', async () => {
    const valid = (await download(page)).payload;
    const invalid = invalidBackups(valid);
    for (const [name, payload] of invalid) {
      const before = await snapshot(page);
      const messageCount = validationMessages.length;
      validationExpected = true;
      try {
        await importFile(page, payload);
        await page.locator('#session-status[role="alert"]').waitFor();
        const until = Date.now() + timeout;
        while (validationMessages.length === messageCount && Date.now() < until) await page.waitForTimeout(25);
        assert.equal(validationMessages.length, messageCount + 1, `${name} must report a validation error`);
        await page.getByRole('button', { name: 'Importar backup', exact: true }).waitFor({ state: 'visible' });
        assert.deepEqual(await snapshot(page), before, `${name} mutated state`);
      } finally { validationExpected = false; }
    }
    return { rejectedFixtures: invalid.map(([name]) => name), stateUnchanged: true };
  });
}
async function finishVisible(page) {
  // Uses only actual DOM actions. Diagnostic sampling may grow during the run.
  // The adaptive diagnostic can reach six questions per each of the pack's
  // 82 canonical concepts (492 responses), plus completion transitions.
  for (let i = 0; i < 600; i++) {
    await page.waitForFunction(() => Boolean(document.querySelector('.question-options button, .study-feedback, .flashcard-answer')) || [...document.querySelectorAll('button')].some(button => ['Finalizar sessão', 'Revelar resposta', 'Lembrei'].includes(button.textContent) && !button.disabled));
    const finish = page.getByRole('button', { name: 'Finalizar sessão', exact: true });
    if (await finish.count()) {
      await finish.click(); await page.getByRole('heading', { name: 'Sessão concluída', exact: true }).waitFor(); return;
    }
    const feedback = page.locator('.study-feedback');
    if (await feedback.count()) {
      const selector = await page.locator('#diagnostic-panel .study-feedback').count() ? '#diagnostic-panel' : '#questions';
      const previous = await page.locator(selector).innerText();
      await page.locator(selector).getByRole('button', { name: 'Continuar', exact: true }).click();
      // The button handler commits IndexedDB and replaces the DOM asynchronously.
      // Wait for that durable transition before the next loop observes stale feedback.
      await page.waitForFunction(({ selector, previous }) => document.querySelector(selector)?.innerText !== previous, { selector, previous });
    } else {
      const reveal = page.getByRole('button', { name: 'Revelar resposta', exact: true });
      if (await reveal.count()) await reveal.click();
      const remembered = page.getByRole('button', { name: 'Lembrei', exact: true });
      if (await remembered.count()) await remembered.click();
      else await page.locator('.question-options button').first().click();
      await feedback.waitFor();
    }
  }
  throw new Error('Session exceeded the maximum adaptive sample and completion transitions');
}
