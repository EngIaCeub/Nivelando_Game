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
} catch { /* Native IndexedDB coverage is skipped when Playwright is unavailable. */ }

test('O4 native IndexedDB fails closed for generation read faults and stale primitive writes after reset', {
  skip: !playwright && 'Playwright unavailable; set STUDYOS_PLAYWRIGHT_MODULE'
}, async () => {
  const server = createServer(async (request, response) => {
    if (request.url === '/') { response.end('<!doctype html><title>O4 generation fencing</title>'); return; }
    if (!/^\/core\/src\/[a-z-]+\.js$/.test(request.url)) { response.writeHead(404).end(); return; }
    try {
      response.setHeader('Content-Type', 'text/javascript');
      response.end(await readFile(new URL(`../src/${request.url.split('/').at(-1)}`, import.meta.url)));
    } catch { response.writeHead(404).end(); }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  let browser;
  try {
    browser = await playwright.chromium.launch({
      headless: true,
      ...(process.env.STUDYOS_CHROMIUM_EXECUTABLE ? { executablePath: process.env.STUDYOS_CHROMIUM_EXECUTABLE } : {})
    });
    const page = await browser.newPage();
    await page.goto(`http://127.0.0.1:${server.address().port}/`);
    const result = await page.evaluate(async () => {
      if (!navigator.locks?.request) return { supported: false };
      const { IndexedDbStore } = await import('/core/src/storage.js');
      const { MasteryStore } = await import('/core/src/mastery.js');
      const { resetProductionStore } = await import('/core/src/production.js');
      const examId = 'generation-native-exam';
      const name = `generation-native-${crypto.randomUUID()}`;
      const metadata = { appVersion: '1.0.0', storageVersion: 2 };
      const settings = { dailyMinutes: 30 };
      const storeA = new IndexedDbStore({ name, version: 1 });
      const storeB = new IndexedDbStore({ name, version: 1 });
      await Promise.all([storeA.put(examId, 'progress', 'seed', { id: 'seed', value: 'before-reset' }),
        storeA.put(examId, 'study-sessions', 'run', { id: 'run', responses: [] })]);
      await new MasteryStore(storeA).put({ canonicalConceptId: 'reset-concept' });
      const beforeReset = await storeB.exportNamespaces([examId, '__studyos_global__']);
      const beforeGeneration = await storeA.get('__studyos_meta__', 'system', 'generation');
      const reset = await resetProductionStore(storeB, examId, { confirmation: 'RESETAR', metadata, currentSettings: settings });
      const afterReset = await storeB.exportNamespaces([examId, '__studyos_global__']);
      const afterGeneration = await storeB.get('__studyos_meta__', 'system', 'generation');

      let updaterCalled = false;
      const obsoleteWrites = [
        () => storeA.put(examId, 'probe', 'put', { value: 1 }),
        () => storeA.putIfAbsent(examId, 'probe', 'put-if-absent', { value: 1 }),
        () => storeA.update(examId, 'study-sessions', 'run', value => { updaterCalled = true; return value; }),
        () => storeA.delete(examId, 'progress', 'seed'),
        () => storeA.recordScoreAttempt(examId, 'run', 'question', true, '2026-10-05T12:00:00.000Z'),
        () => storeA.import(examId, { version: 1, examId, collections: { probe: [{ id: 'import', value: { value: 1 } }] } })
      ];
      const obsoleteRejected = [];
      for (const write of obsoleteWrites) {
        try { await write(); obsoleteRejected.push(false); }
        catch (error) { obsoleteRejected.push(/substituído em outra aba/.test(error.message)); }
      }
      const afterObsoleteWrites = await storeB.exportNamespaces([examId, '__studyos_global__']);

      // Inject a native IndexedDB get failure for the reserved generation key.
      const originalGet = IDBObjectStore.prototype.get;
      IDBObjectStore.prototype.get = function(key) {
        if (key === '__studyos_meta__::system::generation') throw new DOMException('injected generation read failure', 'InvalidStateError');
        return originalGet.call(this, key);
      };
      let readFailureRejected = false;
      try { await storeA.put(examId, 'probe', 'read-failure', { value: 1 }); }
      catch (error) { readFailureRejected = /generation|InvalidStateError|injected/i.test(error.message); }
      finally { IDBObjectStore.prototype.get = originalGet; }
      const afterReadFailure = await storeB.exportNamespaces([examId, '__studyos_global__']);

      // Seed an invalid generation through native IndexedDB, bypassing the adapter.
      const rawDb = await new Promise((resolve, reject) => {
        const request = indexedDB.open(name, 1);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      await new Promise((resolve, reject) => {
        const tx = rawDb.transaction('records', 'readwrite');
        tx.objectStore('records').put({ key: '__studyos_meta__::system::generation', namespace: '__studyos_meta__', collection: 'system', value: { id: 'generation', generation: 'invalid' } });
        tx.oncomplete = resolve;
        tx.onabort = () => reject(tx.error);
      });
      const malformedStore = new IndexedDbStore({ name, version: 1 });
      let malformedRejected = false;
      try { await malformedStore.put(examId, 'probe', 'malformed-generation', { value: 1 }); }
      catch (error) { malformedRejected = /generation/i.test(error.message); }
      const malformedState = await new Promise((resolve, reject) => {
        const tx = rawDb.transaction('records', 'readonly');
        const request = tx.objectStore('records').get(`${examId}::probe::malformed-generation`);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      rawDb.close();

      return {
        supported: true, reset: reset.reset === true,
        seededGlobal: beforeReset[1].collections.mastery.length === 1,
        resetEmptiedExam: Object.values(afterReset[0].collections).every(rows => rows.length === 0),
        resetEmptiedGlobal: Object.values(afterReset[1].collections).every(rows => rows.length === 0),
        obsoleteRejected, updaterCalled,
        obsoleteWritesPreservedState: JSON.stringify(afterObsoleteWrites) === JSON.stringify(afterReset),
        readFailureRejected,
        readFailurePreservedState: JSON.stringify(afterReadFailure) === JSON.stringify(afterReset),
        malformedRejected, malformedWriteAbsent: malformedState === undefined,
        resetAdvancedGeneration: afterGeneration.generation === (beforeGeneration?.generation ?? 0) + 1
      };
    });
    assert.equal(result.supported, true, 'reset requires native Web Locks support');
    assert.equal(result.reset, true);
    assert.equal(result.seededGlobal, true);
    assert.equal(result.resetAdvancedGeneration, true);
    assert.equal(result.resetEmptiedExam, true);
    assert.equal(result.resetEmptiedGlobal, true);
    assert.deepEqual(result.obsoleteRejected, [true, true, true, true, true, true]);
    assert.equal(result.updaterCalled, false);
    assert.equal(result.obsoleteWritesPreservedState, true);
    assert.equal(result.readFailureRejected, true);
    assert.equal(result.readFailurePreservedState, true);
    assert.equal(result.malformedRejected, true);
    assert.equal(result.malformedWriteAbsent, true);
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
});
