import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import { MemoryStore } from '../src/storage.js';
import { exportProductionBackup, validateBackupPayload, validateRecoverySnapshot } from '../src/production.js';
import { MasteryStore } from '../src/mastery.js';
import { DiagnosticEngine } from '../src/diagnostics.js';

async function validator() {
  const ajv = new Ajv2020({ strict: false, allErrors: true }); addFormats(ajv);
  const directory = new URL('../../schemas/', import.meta.url);
  for (const file of await readdir(directory)) if (file.endsWith('.json')) ajv.addSchema(JSON.parse(await readFile(new URL(file, directory), 'utf8')), file);
  return ajv;
}

test('O4 actual production backup conforms to full JSON Schema with global mastery and physical storage version', async () => {
  const store = new MemoryStore();
  const masteryStore = new MasteryStore(store);
  await masteryStore.put({ canonicalConceptId: 'test.concept', masteryEstimate: .7, confidence: .5 });
  await masteryStore.applyStudyAnswer({ canonicalConceptId: 'test.concept', correct: true, firstAttempt: true, assessedAt: '2026-10-02T00:00:00.000Z', operationId: 'study-op-1' });
  await store.put('sample-exam', 'revisions', 'test.topic', { topicId: 'test.topic', interval: 1, mastery: .2, ease: 2.6, dueAt: '2026-10-03T00:00:00.000Z', history: [{ reviewedAt: '2026-10-02T00:00:00.000Z', quality: 4, operationId: 'study-op-1' }] });
  const metadata = { appVersion: '1.0.0', storageVersion: 2 };
  const backup = await exportProductionBackup(store, 'sample-exam', metadata, { dailyMinutes: 120 });
  const ajv = await validator(); const validate = ajv.getSchema('backup.schema.json');
  assert.equal(validate(backup), true, ajv.errorsText(validate.errors));
  assert.deepEqual(backup.globalData.collections.mastery[0].value.appliedStudyOperations, ['study-op-1']);
  assert.equal(validateBackupPayload(backup, { examId: 'sample-exam', metadata, requireComplete: true }), true);
  const restored = new MemoryStore();
  await (await import('../src/production.js')).restoreProductionBackup(restored, backup, { examId: 'sample-exam', metadata });
  const restoredMastery = new MasteryStore(restored);
  await restoredMastery.applyStudyAnswer({ canonicalConceptId: 'test.concept', correct: true, firstAttempt: true, assessedAt: '2026-10-02T00:00:00.000Z', operationId: 'study-op-1' });
  assert.equal((await restoredMastery.get('test.concept')).questionCount, 1);
  for (const mutation of [p => { p.backupVersion = 99; }, p => { p.storageVersion = 99; }, p => { delete p.globalData; }, p => { p.settings = []; }, p => { p.settings.dailyMinutes = -1; }, p => { p.settings.dailyMinutes = 1.5; }, p => { p.data.collections['user-settings'] = [{ id: 'preferences', value: { dailyMinutes: -1 } }]; }, p => { p.globalData.collections.mastery[0].value.schemaVersion = 99; }]) {
    const invalid = structuredClone(backup); mutation(invalid);
    assert.equal(validate(invalid), false);
    assert.throws(() => validateBackupPayload(invalid, { examId: 'sample-exam', metadata, requireComplete: true }));
  }
  for (const mutation of [p => { p.globalData.collections.mastery[0].value.appliedStudyOperations = ['duplicate', 'duplicate']; }, p => { p.globalData.collections.mastery[0].value.appliedStudyOperations = [4]; }]) {
    const invalid = structuredClone(backup); mutation(invalid);
    assert.equal(validate(invalid), false, JSON.stringify(validate.errors));
    assert.throws(() => validateBackupPayload(invalid, { examId: 'sample-exam', metadata, requireComplete: true }));
  }
  const invalidRevision = structuredClone(backup);
  invalidRevision.data.collections.revisions[0].value.history[0].operationId = '   ';
  assert.equal(validate(invalidRevision), false, JSON.stringify(validate.errors));
  assert.throws(() => validateBackupPayload(invalidRevision, { examId: 'sample-exam', metadata, requireComplete: true }));
});

test('O4 backup schema deeply validates plan activities, diagnostic answers, study sessions and operation receipts', async () => {
  const store = new MemoryStore();
  await store.put('sample-exam', 'scores', 'session-a::q1', { simulationRunId: 'session-a', questionId: 'q1', correct: true, answeredAt: '2026-10-02T00:00:00.000Z', attempts: 1 });
  await store.put('sample-exam', 'retake-operations', 'operation-a', { operationId: 'operation-a', simulationRunId: 'session-a', questionId: 'q1', correct: true, timestamp: '2026-10-02T00:00:00.000Z', scoreId: 'session-a::q1', attempts: 1, firstAttempt: true });
  await store.put('sample-exam', 'study-sessions', 'session-a', {
    id: 'session-a', examId: 'sample-exam', kind: 'quiz', status: 'paused', cursor: 0, questionIds: ['q1'], responses: [], revealedIds: [],
    pending: { operationId: 'operation-a', item: { id: 'q1' }, response: { itemId: 'q1', correct: true, retake: false, timestamp: '2026-10-02T00:00:00.000Z' }, targets: [], reviewTargets: [] }
  });
  const diagnostic = new DiagnosticEngine(store);
  const question = { id: 'q1', examId: 'sample-exam', stem: 'Which option is correct?', options: [{ id: 'a', text: 'First choice' }, { id: 'b', text: 'Second choice' }], correctOptionId: 'a', canonicalConceptIds: ['concept-a'], topicIds: ['topic-a'], provenance: { status: 'verified', source: 'synthetic test fixture', url: null, license: null } };
  const diagnosticRun = await diagnostic.start({ examId: 'sample-exam', assessmentRunId: 'diagnostic-a', questions: [question] });
  await diagnostic.answer({ examId: 'sample-exam', assessmentRunId: diagnosticRun.assessmentRunId, questionId: 'q1', canonicalConceptIds: ['concept-a'], correct: true, answeredAt: '2026-10-02T00:00:00.000Z' });
  await diagnostic.complete({ examId: 'sample-exam', assessmentRunId: diagnosticRun.assessmentRunId, completedAt: '2026-10-02T00:00:00.000Z' });
  await store.put('sample-exam', 'today-plans', '2026-10-02', {
    planId: 'plan-a', examId: 'sample-exam', date: '2026-10-02', availableMinutes: 20, generatedAt: '2026-10-02T00:00:00.000Z',
    algorithmVersion: 'v1', activities: [{ activityId: 'activity-a', type: 'questions', estimatedMinutes: 20, status: 'planned', questionIds: ['q1'] }],
    plannedMinutes: 20, completedMinutes: 0, status: 'ready', reasonSummary: 'plan'
  });
  const backup = await exportProductionBackup(store, 'sample-exam', { appVersion: '1.0.0', storageVersion: 1 }, { dailyMinutes: 90 });
  const validate = (await validator()).getSchema('backup.schema.json');
  assert.equal(validate(backup), true, validate.errorsText?.(validate.errors));
  for (const mutation of [
    p => { p.data.collections['today-plans'][0].value.activities[0] = null; },
    p => { p.data.collections['today-plans'][0].value.activities[0].questionIds = null; },
    p => { p.data.collections['diagnostic-runs'][0].value.responses[0] = null; },
    p => { p.data.collections['diagnostic-runs'][0].value.responses[0].correct = 'yes'; },
    p => { p.data.collections['study-sessions'][0].value.responses = [null]; },
    p => { p.data.collections['study-sessions'][0].value.pending.operationId = ''; },
    p => { p.data.collections['retake-operations'][0].value.attempts = 0; },
    p => { delete p.data.collections['retake-operations'][0].value.firstAttempt; }
  ]) {
    const invalid = structuredClone(backup); mutation(invalid);
    assert.equal(validate(invalid), false, JSON.stringify(validate.errors));
    assert.throws(() => validateBackupPayload(invalid, { examId: 'sample-exam', requireComplete: true }));
  }
});

test('O4 paused diagnostic backup rejects malformed executable question bank before restore mutation and round-trips valid questions', async () => {
  const store = new MemoryStore();
  const examId = 'sample-exam';
  const question = { id: 'q1', examId, stem: 'Which option is correct?', options: [{ id: 'a', text: 'First choice' }, { id: 'b', text: 'Second choice' }], correctOptionId: 'a', canonicalConceptIds: ['concept-a'], topicIds: ['topic-a'], provenance: { status: 'verified', source: 'synthetic test fixture', url: null, license: null } };
  const diagnostic = new DiagnosticEngine(store);
  await diagnostic.start({ examId, assessmentRunId: 'diagnostic-paused', questions: [question] });
  await store.put(examId, 'study-sessions', 'diagnostic-paused', { id: 'diagnostic-paused', examId, kind: 'diagnostic', status: 'paused', cursor: 0, questionIds: ['q1'], responses: [], revealedIds: [], startedAt: '2026-10-02T00:00:00.000Z' });
  const metadata = { appVersion: '1.0.0', storageVersion: 1 };
  const settings = { dailyMinutes: 90 };
  const backup = await exportProductionBackup(store, examId, metadata, settings);
  const ajv = await validator();
  const validateSchema = ajv.getSchema('backup.schema.json');
  assert.equal(validateSchema(backup), true, ajv.errorsText(validateSchema.errors));
  assert.equal(validateBackupPayload(backup, { examId, metadata, requireComplete: true }), true);
  const restored = new MemoryStore();
  await import('../src/production.js').then(({ restoreProductionBackup }) => restoreProductionBackup(restored, backup, { examId, metadata }));
  assert.deepEqual(await restored.get(examId, 'diagnostic-question-bank', 'q1'), question);
  const invalid = structuredClone(backup);
  invalid.data.collections['diagnostic-question-bank'][0].value.canonicalConceptIds = { bad: true };
  assert.equal(validateSchema(invalid), false, JSON.stringify(validateSchema.errors));
  assert.throws(() => validateBackupPayload(invalid, { examId, metadata, requireComplete: true }));
  const beforeData = await store.export(examId);
  const beforeSettings = { dailyMinutes: 45 };
  await assert.rejects(import('../src/production.js').then(({ restoreProductionBackup }) => restoreProductionBackup(store, invalid, { examId, metadata, currentSettings: beforeSettings })));
  assert.deepEqual(await store.export(examId), beforeData);
  assert.deepEqual(beforeSettings, { dailyMinutes: 45 });
});

test('O4 recovery snapshot has a distinct recovery-only schema and cannot validate as a backup', async () => {
  const ajv = await validator();
  const validateRecovery = ajv.getSchema('recovery-snapshot.schema.json');
  const store = new MemoryStore();
  await store.put('sample-exam', 'reading', 'one', { activity: null, notes: ['raw', null] });
  const envelope = await store.captureAndReplaceNamespaces({
    namespaceIds: ['sample-exam'], replacements: [{ version: 1, examId: 'sample-exam', collections: {} }],
    captureNamespace: '__studyos_backups__', captureCollection: 'corrupt-state', captureId: 'capture-a',
    metadata: { errorSummary: null, source: { layer: 'storage' } }, rawSettings: { dailyMinutes: 90 }
  });
  assert.equal(validateRecoverySnapshot(envelope, { examId: 'sample-exam' }), true);
  assert.equal(validateRecovery(envelope), true, JSON.stringify(validateRecovery.errors));
  for (const mutate of [value => { delete value.captureId; }, value => { value.recoveryOnly = false; }]) {
    const invalid = structuredClone(envelope); mutate(invalid);
    assert.equal(validateRecovery(invalid), false);
  }
  const foreign = structuredClone(envelope); foreign.rows[0].namespace = 'foreign';
  assert.equal(validateRecovery(foreign), true); // Cross-row references are semantic, not a 2020-12 schema extension.
  assert.throws(() => validateRecoverySnapshot(foreign, { examId: 'sample-exam' }));
  const unsafeKey = structuredClone(envelope); unsafeKey.rows[0].value = JSON.parse('{"__proto__":{"polluted":true}}');
  assert.equal(validateRecovery(unsafeKey), false);
  assert.equal(ajv.getSchema('backup.schema.json')(envelope), false);
});
