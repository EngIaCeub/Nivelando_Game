import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { IndexedDbStore } from '../src/storage.js';

// Deterministic lifecycle check, independent of an installed browser.
test('O4 IndexedDB request success is provisional until transaction oncomplete; abort rejects', async () => {
  const previous = globalThis.indexedDB;
  const transactions = [];
  const db = { transaction(_store, mode) {
    const request = {};
    const generationRequest = { result: undefined };
    const transaction = { objectStore: () => ({
      put: () => request,
      get: () => generationRequest
    }), request, generationRequest, mode };
    transactions.push(transaction);
    queueMicrotask(() => { generationRequest.onsuccess?.(); if (mode === 'readonly') transaction.oncomplete?.(); });
    return transaction;
  } };
  globalThis.indexedDB = { open() {
    const request = { result: db };
    queueMicrotask(() => request.onsuccess());
    return request;
  } };
  try {
    const store = new IndexedDbStore();
    let settled = false;
    const pending = store.put('exam-a', 'progress', 'p', { id: 'p' }).then(() => { settled = true; });
    await new Promise(resolve => setImmediate(resolve));
    const transaction = transactions.find(item => item.mode === 'readwrite');
    transaction.request.result = 'key';
    transaction.request.onsuccess();
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(settled, false);
    transaction.oncomplete();
    await pending;
    assert.equal(settled, true);
    const failure = store.put('exam-a', 'progress', 'p', { id: 'p' });
    const rejects = assert.rejects(failure, /commit failed/);
    await new Promise(resolve => setImmediate(resolve));
    const aborted = transactions.filter(item => item.mode === 'readwrite')[1];
    aborted.request.onsuccess();
    aborted.error = new Error('commit failed');
    aborted.onabort();
    await rejects;
  } finally { globalThis.indexedDB = previous; }
});

// Optional native coverage: install Playwright or set STUDYOS_PLAYWRIGHT_MODULE
// to its entry point. No dependency or browser is downloaded by these tests.
let playwright;
try {
  playwright = await import(process.env.STUDYOS_PLAYWRIGHT_MODULE ? pathToFileURL(process.env.STUDYOS_PLAYWRIGHT_MODULE).href : 'playwright');
} catch { /* The lifecycle test above still runs in the dependency-free suite. */ }

test('O4 native IndexedDB restores compound IDs, rolls back all namespaces and survives reopening V1', { skip: !playwright && 'Playwright unavailable; set STUDYOS_PLAYWRIGHT_MODULE' }, async () => {
  const server = createServer(async (request, response) => {
    if (request.url === '/') { response.end('<!doctype html><title>Isolated backup test</title>'); return; }
    if (!/^\/core\/src\/[a-z-]+\.js$/.test(request.url)) { response.writeHead(404); response.end(); return; }
    try {
      response.setHeader('Content-Type', 'text/javascript');
      response.end(await readFile(new URL(`../../${request.url.slice(1)}`, import.meta.url)));
    } catch { response.writeHead(404); response.end(); }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  let browser;
  try {
    browser = await playwright.chromium.launch({ headless: true, ...(process.env.STUDYOS_CHROMIUM_EXECUTABLE ? { executablePath: process.env.STUDYOS_CHROMIUM_EXECUTABLE } : {}) });
    const page = await browser.newPage();
    await page.goto(`http://127.0.0.1:${server.address().port}/`);
    const result = await page.evaluate(async () => {
      const { IndexedDbStore, EXPORT_VERSION } = await import('/core/src/storage.js');
      const { ScoringEngine } = await import('/core/src/scoring.js');
      const { MasteryStore, GLOBAL_NAMESPACE } = await import('/core/src/mastery.js');
      const { exportProductionBackup, restoreProductionBackup, BACKUP_NAMESPACE } = await import('/core/src/production.js');
      const metadata = { appVersion: '1.0.0', storageVersion: 2 };
      const settings = { dailyMinutes: 90, onboardingSkipped: true };
      const store = new IndexedDbStore({ name: 'o4-isolated-native', version: 2 });
      const scoring = new ScoringEngine(store);
      await scoring.submitAnswer({ examId: 'exam-a', simulationRunId: 'run', questionId: 'wrong', correct: false });
      await scoring.submitAnswer({ examId: 'exam-a', simulationRunId: 'run', questionId: 'right', correct: true });
      const concurrent = await Promise.all([
        scoring.submitAnswer({ examId: 'exam-a', simulationRunId: 'race', questionId: 'same', correct: false, timestamp: '2026-10-03T00:00:00.000Z' }),
        scoring.submitAnswer({ examId: 'exam-a', simulationRunId: 'race', questionId: 'same', correct: true, timestamp: '2026-10-03T00:00:01.000Z' })
      ]);
      const concurrentFirst = await scoring.getFirstAttempt('exam-a', 'race', 'same');
      const concurrentRetakes = await store.query('exam-a', 'retakes');
      await new MasteryStore(store).put({ canonicalConceptId: 'concept', masteryEstimate: .7 });
      await store.put('exam-b', 'progress', 'p', { id: 'p' });
      const snapshot = await exportProductionBackup(store, 'exam-a', metadata, settings);
      await store.put('exam-a', 'later', 'new', { id: 'new' });
      await new MasteryStore(store).put({ canonicalConceptId: 'later-concept' });
      const result = await restoreProductionBackup(store, JSON.stringify(snapshot), { examId: 'exam-a', metadata, currentSettings: { dailyMinutes: 120 } });
      for (const [key, value] of Object.entries(result.settings)) localStorage.setItem(key, value);
      const same = JSON.stringify(await store.export('exam-a')) === JSON.stringify(snapshot.data);
      const globalSame = JSON.stringify(await store.export(GLOBAL_NAMESPACE)) === JSON.stringify(snapshot.globalData);
      const firstAttempt = await scoring.getFirstAttempt('exam-a', 'run', 'wrong');
      const before = await store.export('exam-a');
      const globalBefore = await store.export(GLOBAL_NAMESPACE);
      const originalPut = IDBObjectStore.prototype.put;
      let writesBeforeFailure = 0;
      IDBObjectStore.prototype.put = function(row, ...args) {
        const request = originalPut.call(this, row, ...args);
        writesBeforeFailure++;
        if (row.namespace === GLOBAL_NAMESPACE) request.addEventListener('success', () => this.transaction.abort());
        return request;
      };
      let aborted = false;
      try {
        await store.replaceNamespaces([
          { version: EXPORT_VERSION, examId: 'exam-a', collections: { progress: [{ id: 'replacement', value: { id: 'replacement' } }] } },
          { version: EXPORT_VERSION, examId: GLOBAL_NAMESPACE, collections: { test: [{ id: 'replacement', value: { id: 'replacement' } }] } }
        ]);
      } catch { aborted = true; }
      finally { IDBObjectStore.prototype.put = originalPut; }
      const rolledBack = JSON.stringify(await store.export('exam-a')) === JSON.stringify(before) && JSON.stringify(await store.export(GLOBAL_NAMESPACE)) === JSON.stringify(globalBefore);
      // Request success followed by abort must reject even for a single put.
      IDBObjectStore.prototype.put = function(...args) {
        const request = originalPut.apply(this, args);
        request.addEventListener('success', () => this.transaction.abort());
        return request;
      };
      let provisionalRejected = false;
      try { await store.put('exam-a', 'progress', 'never-committed', { id: 'never-committed' }); }
      catch { provisionalRejected = true; }
      finally { IDBObjectStore.prototype.put = originalPut; }
      const rawReading = { id: 'theory:broken', status: 'paused', date: '2026-10-04', activity: null, completedAt: null, importedAt: new Date('2026-10-04T12:00:00Z') };
      await store.put('exam-a', 'study-reading', 'theory:broken', rawReading);
      const corruptRestore = await restoreProductionBackup(store, snapshot, { examId: 'exam-a', metadata, currentSettings: { dailyMinutes: 120 } });
      const capturedRecovery = await store.get(BACKUP_NAMESPACE, 'corrupt-state', corruptRestore.recoverySnapshot.captureId);
      const preservedReading = capturedRecovery.rows.find(row => row.key === 'exam-a::study-reading::theory:broken')?.value;
      const nativeRecoveryPreserved = preservedReading?.activity === null && preservedReading?.importedAt instanceof Date &&
        JSON.stringify(await store.export('exam-a')) === JSON.stringify(snapshot.data);
      const reopened = new IndexedDbStore({ name: 'o4-isolated-native', version: 2 });
      return {
        same, globalSame, aborted, rolledBack, writesBeforeFailure, provisionalRejected, nativeRecoveryPreserved, concurrent,
        concurrentFirst, concurrentScore: await scoring.getScore('exam-a', 'race'),
        concurrentRetakeCount: concurrentRetakes.filter(item => item.simulationRunId === 'race').length,
        storageVersion: snapshot.storageVersion, exportVersion: snapshot.data.version,
        missingAbortedWrite: await store.get('exam-a', 'progress', 'never-committed') === undefined,
        firstAttempt, score: await scoring.getScore('exam-a', 'run'),
        reopenedFirstAttempt: await new ScoringEngine(reopened).getFirstAttempt('exam-a', 'run', 'wrong'),
        otherExam: await store.get('exam-b', 'progress', 'p'),
        settings: result.settings,
        automaticSettings: (await store.get(BACKUP_NAMESPACE, 'automatic', 'exam-a')).settings
      };
    });
    for (const flag of ['same', 'globalSame', 'aborted', 'rolledBack', 'provisionalRejected', 'nativeRecoveryPreserved', 'missingAbortedWrite']) assert.equal(result[flag], true, flag);
    assert.ok(result.writesBeforeFailure > 0);
    assert.equal(result.firstAttempt.correct, false);
    assert.deepEqual(result.reopenedFirstAttempt, result.firstAttempt);
    assert.equal(result.score, 50);
    assert.equal(result.concurrent.filter(item => item.firstAttempt).length, 1);
    assert.equal(result.concurrent.filter(item => !item.firstAttempt).length, 1);
    assert.equal(result.concurrentScore, result.concurrentFirst.correct ? 100 : 0);
    assert.equal(result.concurrentRetakeCount, 1);
    assert.equal(result.storageVersion, 2);
    assert.equal(result.exportVersion, 1);
    assert.deepEqual(result.otherExam, { id: 'p' });
    assert.deepEqual(result.settings, { dailyMinutes: 90, onboardingSkipped: true });
    assert.deepEqual(result.automaticSettings, { dailyMinutes: 120 });
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
});
