import assert from 'node:assert/strict';
import { test } from 'node:test';
import { MemoryStore } from '../src/storage.js';

const exported = (examId, collections = {}) => ({ version: 1, examId, collections });

test('captureAndReplaceNamespaces atomically keeps full cloned rows and does not touch other namespaces', async () => {
  const store = new MemoryStore();
  const raw = { id: 'reading', activity: null, importedAt: new Date('2026-10-04T12:00:00Z') };
  await store.put('exam-a', 'study-reading', 'reading', raw);
  await store.put('__studyos_global__', 'mastery', 'concept', { canonicalConceptId: 'concept' });
  await store.put('exam-b', 'progress', 'other', { id: 'other' });
  await store.put('__studyos_backups__', 'automatic', 'exam-a', { backupVersion: 1, id: 'keep' });

  const envelope = await store.captureAndReplaceNamespaces({
    namespaceIds: ['exam-a', '__studyos_global__'],
    replacements: [exported('exam-a', { progress: [{ id: 'new', value: { id: 'new' } }] }), exported('__studyos_global__')],
    captureNamespace: '__studyos_backups__', captureCollection: 'corrupt-state', captureId: 'capture-1',
    metadata: { errorSummary: { name: 'Error', message: 'bad activity' } }, rawSettings: { dailyMinutes: 50 }
  });

  assert.equal(envelope.kind, 'studyos-recovery');
  assert.equal(envelope.recoveryOnly, true);
  assert.equal(envelope.recoveryVersion, 1);
  assert.equal(Object.hasOwn(envelope, 'backupVersion'), false);
  assert.deepEqual(envelope.rows.find(row => row.key === 'exam-a::study-reading::reading'), {
    key: 'exam-a::study-reading::reading', namespace: 'exam-a', collection: 'study-reading', value: raw
  });
  assert.notEqual(envelope.rows.find(row => row.key === 'exam-a::study-reading::reading').value, raw);
  assert.equal(envelope.rows.find(row => row.key === 'exam-a::study-reading::reading').value.importedAt instanceof Date, true);
  assert.deepEqual(await store.get('exam-a', 'progress', 'new'), { id: 'new' });
  assert.deepEqual(await store.query('exam-a', 'study-reading'), []);
  assert.deepEqual(await store.get('exam-b', 'progress', 'other'), { id: 'other' });
  assert.deepEqual(await store.get('__studyos_backups__', 'automatic', 'exam-a'), { backupVersion: 1, id: 'keep' });
  assert.deepEqual(await store.get('__studyos_backups__', 'corrupt-state', 'capture-1'), envelope);
});

test('captureAndReplaceNamespaces validates/clones before mutation and rejects capture ID collisions atomically', async () => {
  const store = new MemoryStore();
  await store.put('exam-a', 'progress', 'old', { id: 'old' });
  const args = {
    namespaceIds: ['exam-a'], replacements: [exported('exam-a', { progress: [{ id: 'new', value: { id: 'new' } }] })],
    captureNamespace: '__studyos_backups__', captureCollection: 'corrupt-state', captureId: 'same', metadata: {}, rawSettings: null
  };
  await store.captureAndReplaceNamespaces(args);
  await assert.rejects(store.captureAndReplaceNamespaces(args));
  assert.deepEqual(await store.get('exam-a', 'progress', 'new'), { id: 'new' });
  assert.equal(await store.get('exam-a', 'progress', 'old'), undefined);
  await assert.rejects(store.captureAndReplaceNamespaces({ ...args, captureId: 'bad', metadata: { invalid() {} } }));
  assert.deepEqual((await store.query('__studyos_backups__', 'corrupt-state')).map(({ captureId }) => captureId), ['same']);
});
