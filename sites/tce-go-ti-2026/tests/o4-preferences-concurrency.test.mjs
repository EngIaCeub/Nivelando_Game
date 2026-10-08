import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

let playwright;
try { playwright = await import('playwright'); } catch { /* Browser integration is available in CI/dev dependencies. */ }

const root = fileURLToPath(new URL('../../../', import.meta.url));
const dist = resolve(root, 'sites/tce-go-ti-2026/dist');
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.css': 'text/css', '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json', '.png': 'image/png' };

test('O4 backup round-trip preserves the latest preferences across open tabs', {
  timeout: 30000,
  skip: !playwright && 'Playwright unavailable; install the declared browser dependency'
}, async () => {
  const server = createServer(async (req, res) => {
    try {
      const url = new URL(req.url, 'http://localhost');
      if (!url.pathname.startsWith('/Nivelando_Game/')) { res.writeHead(404).end(); return; }
      const file = resolve(dist, decodeURIComponent(url.pathname.slice('/Nivelando_Game/'.length)) || 'index.html');
      if (!file.startsWith(dist + sep)) { res.writeHead(403).end(); return; }
      res.setHeader('Content-Type', mime[extname(file)] ?? 'application/octet-stream');
      res.end(await readFile(file));
    } catch { res.writeHead(404).end(); }
  });
  await new Promise(done => server.listen(0, '127.0.0.1', done));
  let browser;
  try {
    const edge = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
    const executablePath = process.env.STUDYOS_CHROMIUM_EXECUTABLE ?? (process.platform === 'win32' && existsSync(edge) ? edge : undefined);
    browser = await playwright.chromium.launch({ headless: true, ...(executablePath ? { executablePath } : {}) });
    const context = await browser.newContext({ acceptDownloads: true });
    const first = await context.newPage(), second = await context.newPage();
    const url = `http://127.0.0.1:${server.address().port}/Nivelando_Game/`;
    const ready = async page => {
      await page.getByRole('button', { name: 'Salvar meta diária', exact: true }).waitFor();
      await page.locator('#today-dashboard select').waitFor();
    };
    const persistedSettings = page => page.evaluate(async () => {
      const { IndexedDbStore } = await import('./core/src/storage.js');
      const store = new IndexedDbStore({ name: 'studyos-tce-go-ti-2026-v2', version: 2 });
      return store.get('tce-go-ti-2026', 'user-settings', 'preferences');
    });

    await first.goto(url); await ready(first);
    await second.goto(url); await ready(second);
    await second.locator('#study-onboarding input').fill('90');
    await second.getByRole('button', { name: 'Salvar meta diária', exact: true }).click();
    await second.waitForFunction(() => document.querySelector('#today-dashboard').textContent.includes('Meta diária: 90'));
    assert.equal((await persistedSettings(first)).dailyMinutes, 90);

    first.setDefaultTimeout(5000);
    await first.goto(url + '#settings');
    await first.getByRole('button', { name: 'Exportar meus dados', exact: true }).waitFor();
    const downloading = first.waitForEvent('download', { timeout: 5000 });
    await first.getByRole('button', { name: 'Exportar meus dados', exact: true }).click();
    const download = await downloading;
    const payload = JSON.parse(await readFile(await download.path(), 'utf8'));
    assert.equal(payload.settings.dailyMinutes, 90);
    assert.equal(payload.data.collections['user-settings'].find(row => row.id === 'preferences').value.dailyMinutes, 90);

    first.on('dialog', dialog => dialog.accept());
    await first.locator('#production-settings input[type=file]').setInputFiles({ name: 'backup.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(payload)) });
    const reloading = first.waitForEvent('load');
    await first.getByRole('button', { name: 'Importar backup', exact: true }).click();
    await reloading;
    await first.getByRole('button', { name: 'Exportar meus dados', exact: true }).waitFor();
    assert.equal((await persistedSettings(first)).dailyMinutes, 90);
    await context.close();
  } finally {
    if (browser) await browser.close();
    await new Promise(done => server.close(done));
  }
});
