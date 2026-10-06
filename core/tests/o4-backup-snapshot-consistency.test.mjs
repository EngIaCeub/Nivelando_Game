import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, readdir } from 'node:fs/promises';
import { test } from 'node:test';
import { pathToFileURL } from 'node:url';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import { MemoryStore } from '../src/storage.js';
import { exportProductionBackup, validateBackupPayload } from '../src/production.js';
import { GLOBAL_NAMESPACE } from '../src/mastery.js';

const metadata = { appVersion: '1.0.0', storageVersion: 2 };
const settings = { dailyMinutes: 120 };

test('O4 MemoryStore exports requested namespaces in one compatible snapshot and isolates other exams', async () => {
  const store = new MemoryStore();
  await store.put('exam-a', 'snapshot-marker', 'marker', { generation: 3 });
  await store.put(GLOBAL_NAMESPACE, 'snapshot-marker', 'marker', { generation: 3 });
  await store.put('exam-b', 'snapshot-marker', 'marker', { generation: 99 });

  const snapshots = await store.exportNamespaces(['exam-a', GLOBAL_NAMESPACE]);
  assert.deepEqual(snapshots.map(item => item.examId), ['exam-a', GLOBAL_NAMESPACE]);
  assert.equal(snapshots[0].collections['snapshot-marker'][0].value.generation, 3);
  assert.equal(snapshots[1].collections['snapshot-marker'][0].value.generation, 3);
  assert.deepEqual(await store.export('exam-b'), {
    version: 1, examId: 'exam-b', records: [], events: [],
    collections: { 'snapshot-marker': [{ id: 'marker', value: { generation: 99 } }] }
  });
  await assert.rejects(store.exportNamespaces(['exam-a', 'exam-a']), /unique/);
});

let playwright;
try {
  playwright = await import(process.env.STUDYOS_PLAYWRIGHT_MODULE ? pathToFileURL(process.env.STUDYOS_PLAYWRIGHT_MODULE).href : 'playwright');
} catch { /* Native IndexedDB coverage is optional when Playwright is unavailable. */ }

test('O4 IndexedDB backup captures exam and global namespaces in one readonly transaction across connections', { skip: !playwright && 'Playwright unavailable; set STUDYOS_PLAYWRIGHT_MODULE' }, async () => {
  const server = createServer(async (request, response) => {
    if (request.url === '/') { response.end('<!doctype html><title>Consistent backup test</title>'); return; }
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
    const result = await page.evaluate(async ({ metadata, settings }) => {
      const { IndexedDbStore } = await import('/core/src/storage.js');
      const { exportProductionBackup, createBackupPayload, validateBackupPayload } = await import('/core/src/production.js');
      const globalNamespace = '__studyos_global__';
      const dbName = `o4-consistent-backup-${crypto.randomUUID()}`;
      const store = new IndexedDbStore({ name: dbName, version: 1 });
      // A second connection writes the exam response/score and global mastery
      // marker as one atomic IndexedDB transaction.
      const other = await new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName, 1);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      const writeGeneration = generation => new Promise((resolve, reject) => {
        const transaction = other.transaction('records', 'readwrite');
        const records = transaction.objectStore('records');
        records.put({ key: 'exam-a::responses::response', namespace: 'exam-a', collection: 'responses', value: { generation } });
        records.put({ key: 'exam-a::scores::run::question', namespace: 'exam-a', collection: 'scores', value: { simulationRunId: 'run', questionId: 'question', correct: true, answeredAt: '2026-10-04T00:00:00.000Z', attempts: 1, generation } });
        records.put({ key: `${globalNamespace}::mastery::concept`, namespace: globalNamespace, collection: 'mastery', value: { canonicalConceptId: 'concept', schemaVersion: 1, masteryEstimate: 0.5, confidence: 0.5, source: 'diagnostic', assessedAt: '2026-10-04T00:00:00.000Z', questionCount: 0, firstTryCorrect: 0, firstTryWrong: 0, reviewStatus: 'new', generation } });
        if (generation === 1) records.put({ key: 'exam-b::snapshot-marker::marker', namespace: 'exam-b', collection: 'snapshot-marker', value: { generation: 99 } });
        transaction.oncomplete = resolve;
        transaction.onabort = () => reject(transaction.error ?? new Error('writer transaction aborted'));
        transaction.onerror = () => reject(transaction.error ?? new Error('writer transaction failed'));
      });
      await writeGeneration(1);

      // Reproduce the former two-export interleaving: one namespace from state
      // 1, an atomic update from connection two, then the other namespace from
      // state 2. The old backup validator accepted this temporal mismatch.
      const oldExamRead = await store.export('exam-a');
      await writeGeneration(2);
      const oldGlobalRead = await store.export(globalNamespace);
      const oldPayload = createBackupPayload({ examId: 'exam-a', exported: oldExamRead, globalExported: oldGlobalRead, metadata, settings });
      const oldAccepted = validateBackupPayload(oldPayload, { examId: 'exam-a', metadata, requireComplete: true });
      const oldExamGeneration = oldPayload.data.collections.responses[0].value.generation;
      const oldGlobalGeneration = oldPayload.globalData.collections.mastery[0].value.generation;

      // The production path must consume the new multi-namespace API, not fall
      // back to independent exports. A concurrent atomic writer may serialize
      // before or after the snapshot, but the backup must never mix generations.
      const originalExport = store.export.bind(store);
      store.export = () => { throw new Error('independent namespace export must not be used'); };
      const backupPromise = exportProductionBackup(store, 'exam-a', metadata, settings);
      const concurrentWrite = writeGeneration(3);
      const [backup] = await Promise.all([backupPromise, concurrentWrite]);
      store.export = originalExport;
      const examGeneration = backup.data.collections.responses[0].value.generation;
      const scoreGeneration = backup.data.collections.scores[0].value.generation;
      const masteryGeneration = backup.globalData.collections.mastery[0].value.generation;

      // API order is caller order; unrelated exam namespaces are absent.
      const namespaceSnapshots = await store.exportNamespaces(['exam-a', globalNamespace]);
      const otherExamPresent = namespaceSnapshots.some(snapshot => snapshot.examId === 'exam-b');
      const otherExamRecord = await store.get('exam-b', 'snapshot-marker', 'marker');
      other.close();
      store.close?.();
      indexedDB.deleteDatabase(dbName);
      return { oldAccepted, oldExamGeneration, oldGlobalGeneration, examGeneration, scoreGeneration, masteryGeneration, otherExamPresent, otherExamRecord, namespaceIds: namespaceSnapshots.map(item => item.examId) };
    }, { metadata, settings });
    assert.equal(result.oldAccepted, true);
    assert.equal(result.oldExamGeneration, 1);
    assert.equal(result.oldGlobalGeneration, 2);
    assert.notEqual(result.oldExamGeneration, result.oldGlobalGeneration);
    assert.equal(result.examGeneration, result.scoreGeneration);
    assert.equal(result.examGeneration, result.masteryGeneration);
    assert.equal(result.otherExamPresent, false);
    assert.deepEqual(result.otherExamRecord, { generation: 99 });
    assert.deepEqual(result.namespaceIds, ['exam-a', '__studyos_global__']);
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
});

test('diagnostic backup validates optional mastery projections and rejects duplicate IDs or estimates outside unit range', async () => {
  const ajv = new Ajv2020({ strict: false, allErrors: true });
  addFormats(ajv);
  const directory = new URL('../../schemas/', import.meta.url);
  for (const file of await readdir(directory)) if (file.endsWith('.json')) ajv.addSchema(JSON.parse(await readFile(new URL(file, directory), 'utf8')), file);
  const validate = ajv.getSchema('diagnostic-run.schema.json');
  const valid = {
    assessmentRunId: 'diag-a', examId: 'exam-a', status: 'completed', questionIds: ['q1'], responses: [], schemaVersion: 1,
    result: { concepts: ['concept-a'], questionCount: 1, mastery: [{ canonicalConceptId: 'concept-a', masteryEstimate: 0.75 }] }
  };
  assert.equal(validate(valid), true, JSON.stringify(validate.errors));
  const store = new MemoryStore();
  await store.put('exam-a', 'diagnostic-runs', 'diag-a', valid);
  const backup = await exportProductionBackup(store, 'exam-a', metadata, settings);
  const validateBackupSchema = ajv.getSchema('backup.schema.json');
  assert.equal(validateBackupSchema(backup), true, JSON.stringify(validateBackupSchema.errors));
  assert.equal(validateBackupPayload(backup, { examId: 'exam-a', metadata, requireComplete: true }), true);

  for (const invalidMastery of [
    [{ canonicalConceptId: 'concept-a', masteryEstimate: 0.2 }, { canonicalConceptId: 'concept-a', masteryEstimate: 0.8 }],
    [{ canonicalConceptId: 'concept-a', masteryEstimate: 1.01 }],
    [{ canonicalConceptId: 'concept-a', masteryEstimate: -0.01 }],
    [{ canonicalConceptId: '   ', masteryEstimate: 0.5 }]
  ]) {
    const invalid = structuredClone(backup);
    invalid.data.collections['diagnostic-runs'][0].value.result.mastery = invalidMastery;
    assert.throws(() => validateBackupPayload(invalid, { examId: 'exam-a', metadata, requireComplete: true }));
    const schemaAccepts = validateBackupSchema(invalid);
    if (new Set(invalidMastery.map(item => item.canonicalConceptId)).size !== invalidMastery.length) {
      // JSON Schema can validate each row and exact duplicate objects; equality
      // by one selected property is enforced by the runtime semantic validator.
      assert.equal(schemaAccepts, true, JSON.stringify(validateBackupSchema.errors));
    } else assert.equal(schemaAccepts, false, JSON.stringify(validateBackupSchema.errors));
  }
});
