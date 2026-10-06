import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createServer } from 'node:http';
import { readFile, mkdtemp } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, extname, resolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { buildStandalone } from '../../../scripts/build-standalone.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
let playwright;
try { playwright = await import(process.env.STUDYOS_PLAYWRIGHT_MODULE ? pathToFileURL(process.env.STUDYOS_PLAYWRIGHT_MODULE).href : 'playwright'); } catch { /* Native test needs the declared devDependency. */ }
let o3Available = false;
try { execFileSync('git', ['rev-parse', '--verify', 'o3-content-stable'], { cwd: root, stdio: 'pipe' }); o3Available = true; } catch { /* Shallow CI must fetch the baseline tag for this gate. */ }

test('O4 PWA native: true O3-controlled client uses explicit bridge, retains data, then serves V1 fully offline', {
  skip: !playwright ? 'Playwright unavailable' : !o3Available ? 'fetch o3-content-stable to run the real upgrade gate' : false,
  timeout: 60000
}, async () => {
  const dist = await mkdtemp(join(tmpdir(), 'studyos-o4-pwa-native-'));
  await buildStandalone({ dist, buildId: 'pwa-native-v1', buildTimestamp: '2026-10-03T00:00:00.000Z' });
  const legacy = new Map();
  const fromTag = (name) => {
    if (!legacy.has(name)) legacy.set(name, execFileSync('git', ['show', `o3-content-stable:${name}`], { cwd: root, maxBuffer: 8 * 1024 * 1024 }));
    return legacy.get(name);
  };
  const o3App = fromTag('sites/tce-go-ti-2026/dist/app.js').toString();
  assert.doesNotMatch(o3App, /waiting|updatefound/, 'must exercise the real legacy runtime without update UX');
  let phase = 'o3';
  let rejectUpdate = false;
  const mime = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.svg': 'image/svg+xml', '.png': 'image/png' };
  const server = createServer(async (req, res) => {
    try {
      const url = new URL(req.url, 'http://localhost');
      if (rejectUpdate && url.pathname.endsWith('/sw.js')) { res.writeHead(503); res.end('isolated update failure'); return; }
      let data;
      if (url.pathname === '/fixtures/o3-seed.mjs') data = await readFile(new URL('./o4-browser-fixtures/o3-seed.mjs', import.meta.url));
      else if (url.pathname.startsWith('/fixtures/runtime/pack/')) data = fromTag(`exam-packs/tce-go-ti-2026/${url.pathname.split('/').at(-1)}`);
      else if (url.pathname.startsWith('/fixtures/runtime/')) data = fromTag(`core/src/${url.pathname.split('/').at(-1)}`);
      else {
        if (!url.pathname.startsWith('/Nivelando_Game/')) { res.writeHead(404); res.end(); return; }
        const name = decodeURIComponent(url.pathname.slice('/Nivelando_Game/'.length)) || 'index.html';
        const path = resolve(dist, name);
        if (!path.startsWith(dist + sep)) { res.writeHead(403); res.end(); return; }
        data = phase === 'o3' ? fromTag(`sites/tce-go-ti-2026/dist/${name}`) : await readFile(path);
      }
      res.writeHead(200, { 'Content-Type': mime[extname(url.pathname)] ?? (url.pathname.endsWith('/') ? 'text/html' : 'application/octet-stream'), 'Cache-Control': 'no-store' });
      res.end(data);
    } catch { res.writeHead(404); res.end(); }
  });
  await new Promise((done) => server.listen(0, '127.0.0.1', done));
  let browser;
  try {
    const edge = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
    const executablePath = process.env.STUDYOS_CHROMIUM_EXECUTABLE ?? (process.platform === 'win32' && existsSync(edge) ? edge : undefined);
    browser = await playwright.chromium.launch({ headless: true, ...(executablePath ? { executablePath } : {}) });
    const context = await browser.newContext();
    const page = await context.newPage();
    const base = `http://127.0.0.1:${server.address().port}/Nivelando_Game/`;
    await page.goto(base);
    await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
    await page.reload();
    await page.waitForFunction(() => document.querySelector('#pack-status')?.textContent.includes('disciplinas') || document.querySelector('#today-dashboard')?.querySelector('ol'));
    assert.equal(await page.evaluate(async () => (await fetch('./app.js').then(r => r.text())).includes('updatefound')), false);
    await page.evaluate(async () => { const { seedO3 } = await import('/fixtures/o3-seed.mjs'); await seedO3({ base: new URL('/fixtures/runtime/', location.href).href }); });
    await page.reload();
    await page.waitForFunction(() => document.querySelector('#pack-status')?.dataset.todayState === 'plan-ready');
    const snapshot = () => page.evaluate(async () => {
      const db = await new Promise((done, fail) => { const request = indexedDB.open('studyos-tce-go-ti-2026-v2'); request.onsuccess = () => done(request.result); request.onerror = () => fail(request.error); });
      const records = await new Promise((done, fail) => { const request = db.transaction('records', 'readonly').objectStore('records').getAll(); request.onsuccess = () => done(request.result); request.onerror = () => fail(request.error); });
      db.close(); return records;
    });
    const before = await snapshot(); assert.ok(before.some(row => row.collection === 'scores')); assert.ok(before.some(row => row.collection === 'xp-awards'));
    const legacyCacheNames = await page.evaluate(() => caches.keys());
    // Unrelated caches are created after O3 activation because O3 itself deletes all caches.
    await page.evaluate(async () => { await caches.open('unrelated-app-native'); await caches.open(`studyos-scope:${encodeURIComponent(new URL('/other/', location.href).href)}:other`); });
    phase = 'v1';
    await page.evaluate(() => navigator.serviceWorker.getRegistration().then(reg => reg.update()));
    await page.waitForFunction(async () => Boolean((await navigator.serviceWorker.getRegistration()).waiting));
    assert.equal(await page.locator('#update-banner').count(), 0);
    const oldWorker = await page.evaluate(() => navigator.serviceWorker.controller.scriptURL);
    const bridge = await context.newPage();
    await bridge.goto(`${base}update.html`);
    rejectUpdate = true;
    await bridge.getByRole('button', { name: 'Verificar atualização' }).click();
    await bridge.waitForFunction(() => /(?:Não foi possível verificar|Nova versão disponível)/.test(document.querySelector('#status').textContent));
    assert.equal(await bridge.evaluate(async () => Boolean((await navigator.serviceWorker.getRegistration()).waiting)), true, 'network failure must not activate waiting worker');
    assert.equal(await page.evaluate(async () => (await fetch('./app.js').then(response => response.text())).includes('updatefound')), false);
    assert.deepEqual(await snapshot(), before, 'failed verification preserves the second tab and storage');
    rejectUpdate = false;
    await bridge.getByRole('button', { name: 'Verificar atualização' }).click();
    await bridge.waitForFunction(() => document.querySelector('#status').textContent.includes('Nova versão disponível'));
    assert.equal(await bridge.getByRole('button', { name: 'Atualizar agora' }).isDisabled(), true);
    assert.equal(await bridge.evaluate(async () => Boolean((await navigator.serviceWorker.getRegistration()).waiting)), true);
    assert.equal(await page.evaluate(() => navigator.serviceWorker.controller.scriptURL), oldWorker);
    await bridge.locator('#safe').check();
    bridge.once('dialog', dialog => dialog.dismiss());
    await bridge.getByRole('button', { name: 'Atualizar agora' }).click();
    assert.equal(await bridge.evaluate(async () => Boolean((await navigator.serviceWorker.getRegistration()).waiting)), true);
    assert.equal(await page.evaluate(async () => (await fetch('./app.js').then(response => response.text())).includes('updatefound')), false, 'cancel leaves the second O3 tab uninterrupted');
    assert.deepEqual(await snapshot(), before, 'cancel preserves all records');
    await page.close(); // Required contextual safety: old sessions saved and other tabs closed.
    bridge.once('dialog', dialog => dialog.accept());
    await bridge.getByRole('button', { name: 'Atualizar agora' }).click();
    await bridge.waitForURL(base);
    await bridge.waitForFunction(() => document.querySelector('#pack-status')?.textContent.includes('versão 1.0.0'));
    await bridge.waitForFunction(() => document.querySelector('#pack-status')?.dataset.todayState === 'plan-ready');
    const records = await bridge.evaluate(async () => {
      const db = await new Promise(resolve => { const request = indexedDB.open('studyos-tce-go-ti-2026-v2'); request.onsuccess = () => resolve(request.result); });
      const rows = await new Promise(resolve => { const request = db.transaction('records', 'readonly').objectStore('records').getAll(); request.onsuccess = () => resolve(request.result); }); db.close(); return rows;
    });
    const retained = new Map(records.map(row => [row.key, row]));
    for (const record of before) assert.deepEqual(retained.get(record.key), record, record.key);
    assert.equal(await bridge.evaluate(() => localStorage.getItem('studyos-daily-minutes:tce-go-ti-2026')), '60');
    const keys = await bridge.evaluate(() => caches.keys());
    for (const name of legacyCacheNames) assert.ok(keys.includes(name));
    assert.ok(keys.includes('unrelated-app-native'));
    assert.ok(keys.some(name => name.endsWith(':other')));
    await bridge.goto(`${base}release-diagnostics.html`);
    await bridge.getByRole('button', { name: 'Consultar diagnóstico' }).click();
    await bridge.waitForFunction(() => document.querySelector('#output').dataset.result === 'passed');
    const afterHealth = await bridge.evaluate(async () => {
      const db = await new Promise(resolve => { const request = indexedDB.open('studyos-tce-go-ti-2026-v2'); request.onsuccess = () => resolve(request.result); });
      const rows = await new Promise(resolve => { const request = db.transaction('records', 'readonly').objectStore('records').getAll(); request.onsuccess = () => resolve(request.result); }); db.close(); return rows;
    });
    assert.deepEqual(afterHealth, records, 'health must not mutate any real records');
    await context.setOffline(true);
    await bridge.goto(`${base}#questions`);
    await bridge.waitForFunction(() => document.querySelector('#pack-status')?.textContent.includes('versão 1.0.0'));
    for (const module of ['curriculum', 'revision', 'analytics', 'factory', 'study-ui']) assert.equal(await bridge.evaluate(async name => (await import(`./core/src/${name}.js`)) !== undefined, module), true);
    for (const payload of ['questions', 'flashcards', 'simulations']) assert.equal(await bridge.evaluate(async name => (await fetch(`./exam-pack/${name}.json`)).ok, payload), true);
    await bridge.goto(`${base}release-diagnostics.html`); await bridge.getByRole('button', { name: 'Consultar diagnóstico' }).click();
    await bridge.waitForFunction(() => document.querySelector('#output').dataset.result === 'passed');
    await context.close();
  } finally {
    await browser?.close();
    await new Promise(resolve => server.close(resolve));
  }
});
