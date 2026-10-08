import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir, mkdtemp } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve, join, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'node:http';
import { buildStandalone } from '../../scripts/build-standalone.mjs';

// Real browser coverage is explicitly invoked to avoid requiring a browser on
// headless unit-test runners: STUDYOS_RUN_STUDY_BROWSER=1 node --test this-file.
test('O4 study browser: onboarding, persisted diagnostic/quiz/flashcards/simulation, recovery, mobile and offline', { skip: process.env.STUDYOS_RUN_STUDY_BROWSER !== '1', timeout: 120000 }, async () => {
  const { chromium } = await import('playwright');
  const root = fileURLToPath(new URL('../../', import.meta.url));
  const sites = await readdir(join(root, 'sites'), { withFileTypes: true });
  const site = sites.find(entry => entry.isDirectory() && existsSync(join(root, 'sites', entry.name, 'site-app.js')));
  assert.ok(site, 'A configured study site is required');
  const dist = await mkdtemp(join(tmpdir(), 'studyos-o4-ui-'));
  const build = await buildStandalone({ root, examId: site.name, dist, buildId: 'study-ui-test', commitSha: 'local-ui-test' });
  const bank = JSON.parse(await readFile(join(root, 'exam-packs', site.name, 'questions.json'), 'utf8'));
  const server = createServer(async (req, res) => {
    try {
      const url = new URL(req.url, 'http://localhost');
      if (!url.pathname.startsWith('/study/')) { res.writeHead(404); res.end(); return; }
      const path = resolve(dist, decodeURIComponent(url.pathname.slice('/study/'.length)) || 'index.html');
      if (!path.startsWith(dist + sep)) { res.writeHead(403); res.end(); return; }
      const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.svg': 'image/svg+xml' };
      res.writeHead(200, { 'Content-Type': mime[extname(path)] ?? 'application/octet-stream' }); res.end(await readFile(path));
    } catch { res.writeHead(404); res.end(); }
  });
  await new Promise(done => server.listen(0, '127.0.0.1', done));
  const edge = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
  const executablePath = process.env.STUDYOS_CHROMIUM_EXECUTABLE ?? (existsSync(edge) ? edge : undefined);
  const browser = await chromium.launch({ headless: true, ...(executablePath ? { executablePath } : {}) });
  const context = await browser.newContext({ acceptDownloads: true, serviceWorkers: 'allow' });
  const page = await context.newPage(); const errors = []; page.on('pageerror', error => errors.push(error.message));
  page.on('dialog', dialog => dialog.type() === 'confirm' ? dialog.accept() : dialog.dismiss());
  const base = 'http://127.0.0.1:' + server.address().port + '/study/';
  const ready = async () => { await page.locator('#today-dashboard select').waitFor(); await page.getByRole('button', { name: 'Exportar meus dados', exact: true }).waitFor(); };
  const rows = () => page.evaluate(async () => {
    const request = indexedDB.open('studyos-' + document.title.split(' — ')[1]);
    // The actual database name is discovered, keeping this test pack-independent.
    request.onupgradeneeded = () => request.transaction.abort();
    await new Promise(done => { request.onsuccess = () => { request.result.close(); done(); }; request.onerror = done; });
    const databases = await indexedDB.databases(); const dbName = databases.find(db => db.name.endsWith('-v2')).name;
    const open = indexedDB.open(dbName); const db = await new Promise((done, fail) => { open.onsuccess = () => done(open.result); open.onerror = () => fail(open.error); });
    const tx = db.transaction('records', 'readonly'); const get = tx.objectStore('records').getAll();
    const records = await new Promise((done, fail) => { get.onsuccess = () => done(get.result); get.onerror = () => fail(get.error); }); db.close(); return records;
  });
  const answer = async (container, correct = true) => {
    const stem = await container.locator(':scope > p').nth(1).textContent(); const question = bank.find(q => q.stem === stem); assert.ok(question, stem);
    const option = question.options.find(option => (option.id === question.correctOptionId) === correct);
    await container.getByRole('button', { name: option.text, exact: true }).click(); await container.locator('.study-feedback').waitFor(); return question;
  };
  try {
    await page.goto(base); await ready();
    assert.equal(await page.evaluate(() => getComputedStyle(document.documentElement).colorScheme), 'dark');
    assert.equal(await page.locator('main > section[id]:not([hidden])').count(), 1, 'only the active view is exposed');
    for (const route of ['plan', 'subjects', 'library', 'questions', 'reviews', 'diagnostic', 'flashcards', 'simulations', 'progress', 'settings', 'login', 'register', 'recover']) {
      await page.goto(base + '#' + route);
      await page.waitForFunction(id => document.querySelectorAll('main > section[id]:not([hidden])').length === 1 && document.querySelector('main > section:not([hidden])').id === id, route);
    }
    await page.goto(base + '#today'); await ready();
    await page.getByRole('button', { name: 'Pular e estudar agora', exact: true }).click(); await page.reload(); await ready();
    assert.equal(await page.getByRole('button', { name: 'Pular e estudar agora', exact: true }).count(), 0);
    await page.locator('#study-onboarding input').fill('90'); await page.getByRole('button', { name: 'Salvar meta diária', exact: true }).click();
    await page.waitForFunction(() => document.querySelector('#today-dashboard').textContent.includes('Meta diária: 90'));
    await page.getByRole('button', { name: 'Fazer diagnóstico', exact: true }).click(); const diagnostic = page.locator('#diagnostic-panel');
    await answer(diagnostic); await diagnostic.getByRole('button', { name: 'Pausar e continuar depois', exact: true }).click();
    assert.equal(await page.locator('html').getAttribute('data-study-active'), 'false');
    const diagBefore = (await rows()).find(row => row.collection === 'diagnostic-runs').value;
    await page.reload(); await ready(); await page.locator('#study-resume button').filter({ hasText: 'Diagnóstico inicial' }).click();
    const diagAfter = (await rows()).find(row => row.collection === 'diagnostic-runs').value; assert.deepEqual(diagAfter.responses, diagBefore.responses);
    await diagnostic.getByRole('button', { name: 'Pausar e continuar depois', exact: true }).click();
    await page.locator('#today-dashboard').getByRole('button', { name: 'COMEÇAR', exact: true }).click(); const quiz = page.locator('#questions');
    await answer(quiz, false); const snapshot = await rows(); const scores = snapshot.filter(row => row.collection === 'scores'); const awards = snapshot.filter(row => row.collection === 'xp-awards');
    await quiz.getByRole('button', { name: 'Tentar novamente (preserva score e XP)', exact: true }).click(); await answer(quiz, true);
    const retaken = await rows(); assert.deepEqual(retaken.filter(row => row.collection === 'scores'), scores); assert.deepEqual(retaken.filter(row => row.collection === 'xp-awards'), awards);
    await quiz.getByRole('button', { name: 'Pausar e continuar depois', exact: true }).click(); await page.reload(); await ready();
    await page.locator('#study-resume button').filter({ hasText: 'questões' }).first().click(); await quiz.locator('.study-feedback').waitFor(); await quiz.getByRole('button', { name: 'Continuar', exact: true }).click();
    while (await quiz.getByRole('button', { name: 'Pausar e continuar depois', exact: true }).count()) { await answer(quiz); await quiz.getByRole('button', { name: 'Continuar', exact: true }).click(); }
    await quiz.getByRole('button', { name: 'Finalizar sessão', exact: true }).click(); await page.waitForFunction(() => document.documentElement.dataset.studyActive === 'false');
    await page.getByRole('button', { name: 'Estudar flashcards', exact: true }).click(); const cards = page.locator('#flashcards-panel');
    assert.equal(await cards.getByRole('button', { name: 'Lembrei', exact: true }).count(), 0);
    await cards.getByRole('button', { name: 'Revelar resposta', exact: true }).click(); await cards.getByRole('button', { name: 'Lembrei', exact: true }).click(); await cards.locator('.study-feedback').waitFor();
    await cards.getByRole('button', { name: 'Pausar e continuar depois', exact: true }).click(); await page.reload(); await ready();
    assert.ok((await rows()).some(row => row.collection === 'revisions'));
    await page.getByRole('button', { name: 'Escolher simulado', exact: true }).click(); await page.locator('#simulations-panel button').first().click();
    while (await quiz.getByRole('button', { name: 'Pausar e continuar depois', exact: true }).count()) { await answer(quiz); await quiz.getByRole('button', { name: 'Continuar', exact: true }).click(); }
    await quiz.getByRole('button', { name: 'Finalizar sessão', exact: true }).click(); await page.locator('#simulations-panel').getByRole('button', { name: 'Rever respostas / retentativa', exact: true }).waitFor();
    await page.goto(base + '#settings');
    await page.getByRole('button', { name: 'Exportar meus dados', exact: true }).waitFor();
    const downloadPromise = page.waitForEvent('download'); await page.getByRole('button', { name: 'Exportar meus dados', exact: true }).click();
    const download = await downloadPromise; const payload = JSON.parse(await readFile(await download.path(), 'utf8')); assert.ok(payload.globalData); assert.equal(payload.settings.dailyMinutes, 90);
    const beforeRestore = await rows(); await page.locator('#production-settings input[type=file]').setInputFiles({ name: 'backup.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(payload)) });
    await page.getByRole('button', { name: 'Importar backup', exact: true }).click(); await ready();
    await page.waitForFunction(() => document.querySelector('#today-dashboard').textContent.includes('Meta diária: 90'));
    const afterRestore = await rows(); assert.deepEqual(afterRestore.filter(row => row.collection === 'scores'), beforeRestore.filter(row => row.collection === 'scores'));
    const recoveryPromise = page.waitForEvent('download'); await page.getByRole('button', { name: 'Baixar backup automático de recuperação', exact: true }).click(); await recoveryPromise;
    for (const width of [375, 390, 430, 1280]) { await page.setViewportSize({ width, height: 844 }); assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, 'overflow at ' + width); }
    await page.evaluate(async () => { await navigator.serviceWorker.ready; }); await page.reload(); await ready();
    await context.setOffline(true); await page.reload(); await ready();
    await page.getByRole('button', { name: 'Escolher simulado', exact: true }).click(); assert.ok(await page.locator('#simulations-panel button').count());
    assert.deepEqual(errors, []); assert.equal(build.metadata.channel, 'production');
  } finally { await context.close(); await browser.close(); await new Promise(done => server.close(done)); }
});
