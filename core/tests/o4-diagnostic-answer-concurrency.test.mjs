import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

let playwright;
try {
  playwright = await import(process.env.STUDYOS_PLAYWRIGHT_MODULE
    ? pathToFileURL(process.env.STUDYOS_PLAYWRIGHT_MODULE).href
    : 'playwright');
} catch { /* Browser-backed regression will be reported as skipped when unavailable. */ }

test('O4 concurrent diagnostic answers merge assessment responses and adaptive queue', { timeout: 20000, skip: !playwright && 'Playwright unavailable; set STUDYOS_PLAYWRIGHT_MODULE' }, async () => {
  const server = createServer(async (request, response) => {
    if (request.url === '/') { response.end('<!doctype html><title>O4 diagnostic answer concurrency</title>'); return; }
    if (!/^\/core\/src\/[a-z-]+\.js$/.test(request.url)) { response.writeHead(404); response.end(); return; }
    try {
      response.setHeader('Content-Type', 'text/javascript');
      response.end(await readFile(new URL(`../src/${request.url.split('/').at(-1)}`, import.meta.url)));
    } catch { response.writeHead(404); response.end(); }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  let browser;
  try {
    browser = await playwright.chromium.launch({ headless: true, ...(process.env.STUDYOS_CHROMIUM_EXECUTABLE ? { executablePath: process.env.STUDYOS_CHROMIUM_EXECUTABLE } : {}) });
    const page = await browser.newPage();
    await page.goto(`http://127.0.0.1:${server.address().port}/`);
    const result = await page.evaluate(async () => {
      const { IndexedDbStore } = await import('/core/src/storage.js');
      const { DiagnosticEngine } = await import('/core/src/diagnostics.js');
      const { exportProductionBackup, validateBackupPayload } = await import('/core/src/production.js');
      const dbName = `o4-diagnostic-answers-${crypto.randomUUID()}`;
      const examId = 'o4-diagnostic-answers';
      const storeA = new IndexedDbStore({ name: dbName, version: 1 });
      const storeB = new IndexedDbStore({ name: dbName, version: 1 });
      const options = { initialQuestionsPerConcept: 2, maxQuestionsPerConcept: 3, highAccuracy: .8 };
      const engineA = new DiagnosticEngine(storeA, options);
      const engineB = new DiagnosticEngine(storeB, options);
      const questions = ['q1', 'q2', 'q3'].map(id => ({ id, examId, stem: `Question ${id}`,
        options: [{ id: 'a', text: 'A' }, { id: 'b', text: 'B' }], correctOptionId: 'b',
        canonicalConceptIds: ['concept'], topicIds: ['topic'],
        provenance: { status: 'verified', source: 'synthetic concurrency fixture' } }));
      const run = await engineA.start({ examId, assessmentRunId: 'assessment', questions });
      const enteredQuery = (() => { let resolve; const promise = new Promise(done => { resolve = done; }); return { promise, resolve }; })();
      const releaseQuery = (() => { let resolve; const promise = new Promise(done => { resolve = done; }); return { promise, resolve }; })();
      const originalQuery = storeA.query.bind(storeA);
      let block = true;
      storeA.query = async (namespace, collection) => {
        const rows = await originalQuery(namespace, collection);
        if (block && collection === 'diagnostic-question-bank') {
          block = false; enteredQuery.resolve(); await releaseQuery.promise;
        }
        return rows;
      };
      const delayedAnswer = engineA.answer({ examId, assessmentRunId: run.assessmentRunId, questionId: 'q1',
        canonicalConceptIds: ['concept'], correct: false, answeredAt: '2026-10-04T12:00:00.000Z' });
      await enteredQuery.promise;
      let secondFinished = false;
      const secondAnswer = engineB.answer({ examId, assessmentRunId: run.assessmentRunId, questionId: 'q2',
        canonicalConceptIds: ['concept'], correct: true, answeredAt: '2026-10-04T12:00:01.000Z' }).then(value => { secondFinished = true; return value; });
      // B must queue behind A's command. Do not await B while holding A's
      // deterministic read barrier: that would deadlock the harness itself.
      const lockName = `studyos:${dbName}:mutation`;
      for (let attempt = 0; attempt < 100; attempt++) {
        const locks = await navigator.locks.query();
        if (locks.pending.some(lock => lock.name === lockName)) break;
        await new Promise(resolve => setTimeout(resolve, 5));
      }
      const pendingLocks = await navigator.locks.query();
      const secondQueued = pendingLocks.pending.some(lock => lock.name === lockName) && !secondFinished;
      releaseQuery.resolve();
      await Promise.all([delayedAnswer, secondAnswer]);
      const merged = await engineB.getRun(examId, run.assessmentRunId);
      await engineB.answer({ examId, assessmentRunId: run.assessmentRunId, questionId: 'q3',
        canonicalConceptIds: ['concept'], correct: true, answeredAt: '2026-10-04T12:00:02.000Z' });
      const completed = await engineB.complete({ examId, assessmentRunId: run.assessmentRunId, completedAt: '2026-10-04T12:00:03.000Z' });
      const backup = await exportProductionBackup(storeB, examId, { appVersion: '1.0.0', storageVersion: 2 }, { dailyMinutes: 30 });
      const target = new IndexedDbStore({ name: `${dbName}-restored`, version: 1 });
      await (await import('/core/src/production.js')).restoreProductionBackup(target, backup, {
        examId, metadata: { appVersion: '1.0.0', storageVersion: 2 }, currentSettings: {}
      });
      const restored = await new DiagnosticEngine(target, options).getRun(examId, run.assessmentRunId);
      const valid = validateBackupPayload(backup, { examId, metadata: { appVersion: '1.0.0', storageVersion: 2 }, requireComplete: true });
      storeA.close?.(); storeB.close?.(); target.close?.(); indexedDB.deleteDatabase(dbName); indexedDB.deleteDatabase(`${dbName}-restored`);
      return { secondQueued, sampleIds: run.questionIds, mergedIds: merged.responses.map(item => item.questionId), mergedQueue: merged.questionIds,
        completedStatus: completed.run.status, finalIds: completed.run.responses.map(item => item.questionId), restoredIds: restored.responses.map(item => item.questionId), valid };
    });
    assert.equal(result.secondQueued, true, 'second answer must wait for the entire first command');
    assert.deepEqual(result.sampleIds, ['q1', 'q2']);
    assert.deepEqual(result.mergedIds.sort(), ['q1', 'q2']);
    assert.ok(result.mergedQueue.includes('q3'));
    assert.equal(result.completedStatus, 'completed');
    assert.deepEqual(result.finalIds.sort(), ['q1', 'q2', 'q3']);
    assert.deepEqual(result.restoredIds.sort(), ['q1', 'q2', 'q3']);
    assert.equal(result.valid, true);
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
});
