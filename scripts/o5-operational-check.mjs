import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { existsSync } from 'node:fs';

const args = process.argv.slice(2);
const options = {};
for (let i = 0; i < args.length; i += 2) {
  assert(['--url', '--expected-commit', '--output'].includes(args[i]), `Unknown option ${args[i]}`);
  assert(args[i + 1] && !args[i + 1].startsWith('--'), `Missing value for ${args[i]}`);
  options[args[i].slice(2)] = args[i + 1];
}
const base = new URL(options.url ?? 'https://engiaceub.github.io/Nivelando_Game/');
if (!base.pathname.endsWith('/')) base.pathname += '/';
const expectedCommit = options['expected-commit'];
assert(expectedCommit, 'Pass --expected-commit for a release-bound observation.');
const output = resolve(options.output ?? 'docs/O5_SYNTHETIC_USAGE_EVIDENCE.json');
const report = { evidenceVersion: 1, mode: 'synthetic-isolated-browser-contexts', baseUrl: base.href, expectedCommit, profiles: [], privacy: { realStudentData: false, telemetrySent: false } };
let browser;

try {
  const { chromium } = await import('playwright');
  const edge = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
  browser = await chromium.launch({ headless: true, ...(process.platform === 'win32' && existsSync(edge) ? { executablePath: edge } : {}) });
  const metadataResponse = await fetch(new URL('build-meta.json', base));
  assert(metadataResponse.ok, `build metadata HTTP ${metadataResponse.status}`);
  report.metadata = await metadataResponse.json();
  assert.equal(report.metadata.commitSha, expectedCommit, 'Remote page must serve the exact release commit');
  assert.equal(report.metadata.appVersion, '1.0.0');
  assert.equal(report.metadata.channel, 'production');
  assert.equal(report.metadata.examId, 'tce-go-ti-2026');
  assert.equal(report.metadata.storageVersion, 2);

  for (const [index, dailyMinutes] of [60, 90, 120].entries()) {
    const context = await browser.newContext({ viewport: { width: index === 1 ? 375 : 1280, height: index === 1 ? 812 : 900 } });
    const page = await context.newPage();
    const errors = [], externalRequests = [], httpErrors = [];
    context.on('request', request => { if (new URL(request.url()).origin !== base.origin) externalRequests.push(request.url()); });
    context.on('response', response => { if (response.status() >= 400) httpErrors.push({ url: response.url(), status: response.status() }); });
    page.on('pageerror', error => errors.push(String(error)));
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    try {
      const startedAt = new Date().toISOString();
      const response = await page.goto(base.href, { waitUntil: 'load', timeout: 30000 });
      assert(response?.ok(), `profile ${index + 1} initial page did not load`);
      await page.locator('#today-dashboard').getByRole('button', { name: 'COMEÇAR', exact: true }).waitFor();
      const initial = await page.evaluate(async () => {
        const { IndexedDbStore } = await import('./core/src/storage.js');
        const store = new IndexedDbStore({ name: 'studyos-tce-go-ti-2026-v2', version: 2 });
        return { scores: await store.query('tce-go-ti-2026', 'scores'), mastery: await store.query('__studyos_global__', 'mastery'), language: document.documentElement.lang,
          mainCount: document.querySelectorAll('main').length, duplicateIds: [...document.querySelectorAll('[id]')].map(e => e.id).filter((id, i, all) => all.indexOf(id) !== i),
          unnamedButtons: [...document.querySelectorAll('button')].filter(button => !(button.getAttribute('aria-label') || button.textContent.trim())).map(button => button.outerHTML),
          unnamedInputs: [...document.querySelectorAll('input,select,textarea')].filter(input => !(input.getAttribute('aria-label') || input.labels?.length)).map(input => input.outerHTML),
          overflow: document.documentElement.scrollWidth > innerWidth + 1,
          navigation: performance.getEntriesByType('navigation').map(entry => ({ domContentLoadedMs: entry.domContentLoadedEventEnd, loadMs: entry.loadEventEnd })),
          encodedBytes: performance.getEntriesByType('resource').reduce((sum, entry) => sum + (entry.encodedBodySize || 0), 0),
          decodedBytes: performance.getEntriesByType('resource').reduce((sum, entry) => sum + (entry.decodedBodySize || 0), 0) };
      });
      assert.equal(initial.language, 'pt-BR');
      assert.equal(initial.mainCount, 1);
      assert.deepEqual(initial.duplicateIds, []);
      assert.deepEqual(initial.unnamedButtons, []);
      assert.deepEqual(initial.unnamedInputs, []);
      assert.equal(initial.overflow, false);
      assert.deepEqual(initial.scores, [], 'A fresh synthetic profile must have no scores');
      assert.deepEqual(initial.mastery, [], 'A fresh synthetic profile must have no mastery');
      assert(initial.navigation[0]?.domContentLoadedMs > 0);

      if (index === 0) {
        await page.keyboard.press('Tab');
        assert.match(await page.evaluate(() => document.activeElement?.textContent.trim()), /Pular para o conteúdo/);
        await page.keyboard.press('Enter');
        assert.equal(await page.evaluate(() => document.activeElement?.id), 'main-content');
      }

      const goal = page.locator('#study-onboarding input[type="number"]');
      if (await goal.count()) {
        await goal.fill(String(dailyMinutes));
        await page.getByRole('button', { name: 'Salvar meta diária', exact: true }).click();
      }
      await page.waitForFunction(minutes => {
        try { return JSON.parse(localStorage.getItem('studyos-settings:tce-go-ti-2026')).dailyMinutes === minutes; } catch { return false; }
      }, dailyMinutes);
      await page.reload();
      await page.locator('#today-dashboard').getByRole('button', { name: 'COMEÇAR', exact: true }).waitFor();
      const persistedGoal = await page.evaluate(() => JSON.parse(localStorage.getItem('studyos-settings:tce-go-ti-2026')).dailyMinutes);
      assert.equal(persistedGoal, dailyMinutes, 'Daily goal must survive reload in the same isolated profile');

      await page.locator('#today-dashboard').getByRole('button', { name: 'COMEÇAR', exact: true }).click();
      await page.locator('.question-options button').first().waitFor();
      await page.locator('.question-options button').first().click();
      await page.locator('.study-feedback').waitFor();
      const afterFirst = await page.evaluate(async () => {
        const { IndexedDbStore } = await import('./core/src/storage.js');
        const store = new IndexedDbStore({ name: 'studyos-tce-go-ti-2026-v2', version: 2 });
        return { scores: await store.query('tce-go-ti-2026', 'scores'), retakes: await store.query('tce-go-ti-2026', 'retakes'), awards: await store.query('tce-go-ti-2026', 'xp-awards'), sessions: await store.query('tce-go-ti-2026', 'study-sessions') };
      });
      assert.equal(afterFirst.scores.length, 1);
      await page.getByRole('button', { name: 'Tentar novamente (preserva score e XP)', exact: true }).click();
      await page.locator('.question-options button').last().click();
      await page.locator('.study-feedback').waitFor();
      const afterRetake = await page.evaluate(async () => {
        const { IndexedDbStore } = await import('./core/src/storage.js');
        const store = new IndexedDbStore({ name: 'studyos-tce-go-ti-2026-v2', version: 2 });
        return { scores: await store.query('tce-go-ti-2026', 'scores'), retakes: await store.query('tce-go-ti-2026', 'retakes'), awards: await store.query('tce-go-ti-2026', 'xp-awards'), sessions: await store.query('tce-go-ti-2026', 'study-sessions') };
      });
      assert.deepEqual(afterRetake.scores, afterFirst.scores);
      assert.equal(afterRetake.retakes.length, afterFirst.retakes.length + 1);
      assert.deepEqual(afterRetake.awards, afterFirst.awards);

      await page.getByRole('button', { name: 'Pausar e continuar depois', exact: true }).click();
      await page.getByRole('heading', { name: 'Sessão pausada', exact: true }).waitFor();
      await page.reload();
      await page.getByRole('button', { name: /Retomar/ }).first().click();
      await page.locator('.study-feedback').waitFor();
      const persistedScore = await page.evaluate(async () => {
        const { IndexedDbStore } = await import('./core/src/storage.js');
        const store = new IndexedDbStore({ name: 'studyos-tce-go-ti-2026-v2', version: 2 });
        return { scores: await store.query('tce-go-ti-2026', 'scores'), retakes: await store.query('tce-go-ti-2026', 'retakes'), awards: await store.query('tce-go-ti-2026', 'xp-awards'), sessions: await store.query('tce-go-ti-2026', 'study-sessions') };
      });
      assert.deepEqual(persistedScore.scores, afterFirst.scores);
      assert.equal(persistedScore.retakes.length, afterFirst.retakes.length + 1);
      assert.deepEqual(persistedScore.awards, afterFirst.awards, 'Reload/resume must not award XP again');
      assert.deepEqual(persistedScore.sessions, afterRetake.sessions, 'Reload/resume must not duplicate or change persisted session responses');

      if (index === 2) {
        await page.evaluate(async () => { await navigator.serviceWorker.ready; });
        await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
        const offlineProjection = async () => page.evaluate(async () => {
          const { IndexedDbStore } = await import('./core/src/storage.js');
          const store = new IndexedDbStore({ name: 'studyos-tce-go-ti-2026-v2', version: 2 });
          const runs = await store.query('tce-go-ti-2026', 'study-sessions');
          const plan = (await store.query('tce-go-ti-2026', 'today-plans')).map(value => ({ planId: value.planId, date: value.date, availableMinutes: value.availableMinutes, completedMinutes: value.completedMinutes, activityIds: value.activities.map(activity => activity.activityId) }));
          return { dashboardTitle: document.querySelector('#today-dashboard h2')?.textContent,
            settings: await store.get('tce-go-ti-2026', 'user-settings', 'preferences'),
            scores: await store.query('tce-go-ti-2026', 'scores'), retakes: await store.query('tce-go-ti-2026', 'retakes'),
            awards: await store.query('tce-go-ti-2026', 'xp-awards'), mastery: await store.query('__studyos_global__', 'mastery'), plan,
            sessions: runs.map(value => ({ id: value.id, cursor: value.cursor, questionIds: value.questionIds, responses: value.responses, pending: value.pending })) };
        });
        const beforeOffline = await offlineProjection();
        await context.setOffline(true);
        const offlineResponse = await page.reload();
        assert(offlineResponse?.fromServiceWorker(), 'Offline reload must be served by the service worker');
        await page.locator('#today-dashboard').getByRole('button', { name: 'COMEÇAR', exact: true }).waitFor();
        const afterOffline = await offlineProjection();
        assert.equal(afterOffline.dashboardTitle, beforeOffline.dashboardTitle);
        assert.deepEqual(afterOffline, beforeOffline, 'Offline reload must preserve score, mastery, XP, settings, responses and plan');
        await context.setOffline(false);
        report.offline = { serviceWorkerNavigation: true, dashboardPreserved: true, persistentSnapshotPreserved: true };
      }

      assert.deepEqual(errors, [], `Profile ${index + 1} console/page errors`);
      assert.deepEqual(httpErrors, [], `Profile ${index + 1} HTTP errors`);
      assert.deepEqual(externalRequests, [], `Profile ${index + 1} made an unapproved third-party request`);
      report.profiles.push({ profile: `synthetic-${index + 1}`, startedAt, dailyMinutes, isolatedFreshStorage: true, immutableScore: true,
        retakeXpIdempotent: true, pauseReloadResume: true, noConsoleOrHttpErrors: true, noThirdPartyTelemetry: true,
        performance: { navigation: initial.navigation[0], encodedBytes: initial.encodedBytes, decodedBytes: initial.decodedBytes },
        viewport: index === 1 ? '375x812' : '1280x900' });
    } finally {
      await context.setOffline(false).catch(() => {});
      await context.close();
    }
  }
} catch (error) {
  report.error = String(error.stack ?? error);
  process.exitCode = 1;
} finally {
  if (browser) await browser.close();
  report.finishedAt = new Date().toISOString();
  report.passed = !report.error && report.profiles.length === 3 && report.profiles.every(profile => profile.isolatedFreshStorage && profile.immutableScore && profile.retakeXpIdempotent && profile.pauseReloadResume && profile.noConsoleOrHttpErrors && profile.noThirdPartyTelemetry);
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, `${JSON.stringify(report, null, 2)}\n`);
  console.log(`${report.passed ? 'PASS' : 'FAIL'} ${JSON.stringify({ profiles: report.profiles.length, error: report.error ?? null })}; evidence: ${output}`);
  if (!report.passed) process.exitCode = 1;
}
