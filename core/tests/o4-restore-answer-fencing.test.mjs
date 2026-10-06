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

test('O4 restore waits for in-flight answer, replaces its effects, and fences stale tabs', { skip: !playwright && 'Playwright unavailable; set STUDYOS_PLAYWRIGHT_MODULE' }, async () => {
  const server = createServer(async (request, response) => {
    if (request.url === '/') { response.end('<!doctype html><title>O4 restore fencing</title>'); return; }
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
      if (!navigator.locks?.request) return { supported: false };
      const { IndexedDbStore } = await import('/core/src/storage.js');
      const { StudySession } = await import('/core/src/study-ui.js');
      const { exportProductionBackup, restoreProductionBackup } = await import('/core/src/production.js');
      const examId = 'o4-restore-fence';
      const dbName = `o4-restore-fence-${crypto.randomUUID()}`;
      const metadata = { appVersion: '1.0.0', storageVersion: 2 };
      const settings = { dailyMinutes: 45 };
      const storeA = new IndexedDbStore({ name: dbName, version: 1 });
      const storeB = new IndexedDbStore({ name: dbName, version: 1 });
      const sessionA = new StudySession(storeA, examId);
      const question = { id: 'q', stem: 'Q', canonicalConceptIds: ['c'], topicIds: ['t'], options: [{ id: 'wrong' }, { id: 'right' }], correctOptionId: 'right' };
      await sessionA.start({ id: 'run', questions: [question] });
      await sessionA.resume('run');
      const backup = await exportProductionBackup(storeB, examId, metadata, settings);
      const internalGenerationExported = backup.data.records.some(record => record.id === 'generation') ||
        backup.globalData.records.some(record => record.id === 'generation');
      const enteredScore = (() => { let resolve; const promise = new Promise(done => { resolve = done; }); return { promise, resolve }; })();
      const releaseAnswer = (() => { let resolve; const promise = new Promise(done => { resolve = done; }); return { promise, resolve }; })();
      const originalSubmit = sessionA.scoring.submitAnswer.bind(sessionA.scoring);
      sessionA.scoring.submitAnswer = async args => {
        const result = await originalSubmit(args);
        enteredScore.resolve();
        await releaseAnswer.promise;
        return result;
      };
      const answerPromise = sessionA.answer('run', question, 'wrong');
      await enteredScore.promise;
      let restoreFinished = false;
      const restorePromise = restoreProductionBackup(storeB, backup, { examId, metadata, currentSettings: {} })
        .then(value => { restoreFinished = true; return value; });
      await new Promise(resolve => setTimeout(resolve, 20));
      const restoreWaitedForAnswer = !restoreFinished;
      releaseAnswer.resolve();
      await answerPromise;
      const restoreResult = await restorePromise;
      const restoredRun = await storeB.get(examId, 'study-sessions', 'run');
      const restoredScore = await storeB.get(examId, 'scores', 'run::q');
      const restoredMastery = await storeB.get('__studyos_global__', 'mastery', 'c');
      const restoredXp = await new StudySession(storeB, examId).xp.total(examId);
      let staleWriteRejected = false;
      try { await sessionA.answer('run', question, 'wrong'); }
      catch (error) { staleWriteRejected = /substituído em outra aba/.test(error.message); }
      const freshStore = new IndexedDbStore({ name: dbName, version: 1 });
      const freshRun = await new StudySession(freshStore, examId).get('run');
      const generation = await freshStore.withExclusiveMutation(() => freshStore.get('__studyos_meta__', 'system', 'generation'));
      const beforeStaleWrites = await freshStore.exportNamespaces([examId, '__studyos_global__']);
      let updaterCalled = false;
      const obsoleteWrites = [
        () => storeA.put(examId, 'probe', 'p', { value: 1 }),
        () => storeA.putIfAbsent(examId, 'probe', 'p', { value: 1 }),
        () => storeA.update(examId, 'study-sessions', 'run', row => { updaterCalled = true; return row; }),
        () => storeA.delete(examId, 'study-sessions', 'run'),
        () => storeA.recordScoreAttempt(examId, 'run', 'q', true, new Date().toISOString()),
        () => storeA.import(examId, { version: 1, examId, collections: { probe: [{ id: 'p', value: 1 }] } })
      ];
      const rejectedPrimitives = [];
      for (const write of obsoleteWrites) {
        try { await write(); rejectedPrimitives.push(false); }
        catch (error) { rejectedPrimitives.push(/substituído em outra aba/.test(error.message)); }
      }
      const staleWritesPreservedState = JSON.stringify(beforeStaleWrites) === JSON.stringify(await freshStore.exportNamespaces([examId, '__studyos_global__']));
      return {
        rejectedPrimitives, updaterCalled, staleWritesPreservedState,
        supported: true, internalGenerationExported, restoreWaitedForAnswer, restoreFinished, restored: restoreResult.restored,
        restoredResponses: restoredRun.responses.length, restoredPending: restoredRun.pending,
        restoredScore, restoredMastery, restoredXp, staleWriteRejected,
        freshRunResponses: freshRun.responses.length, generation: generation.generation
      };
    });
    assert.equal(result.supported, true, 'production restore requires Web Locks for cross-tab safety');
    assert.equal(result.restoreWaitedForAnswer, true);
    assert.equal(result.internalGenerationExported, false);
    assert.equal(result.restoreFinished, true);
    assert.equal(result.restored, true);
    assert.equal(result.restoredResponses, 0);
    assert.equal(result.restoredPending, undefined);
    assert.equal(result.restoredScore, undefined);
    assert.equal(result.restoredMastery, undefined);
    assert.equal(result.restoredXp, 0);
    assert.equal(result.staleWriteRejected, true);
    assert.equal(result.freshRunResponses, 0);
    assert.equal(result.generation, 1);
    assert.deepEqual(result.rejectedPrimitives, [true, true, true, true, true, true]);
    assert.equal(result.updaterCalled, false);
    assert.equal(result.staleWritesPreservedState, true);
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
});
