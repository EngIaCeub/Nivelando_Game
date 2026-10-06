import assert from 'node:assert/strict';
import { test } from 'node:test';
import { MemoryStore, EventLog } from '../src/storage.js';
import { ScoringEngine } from '../src/scoring.js';
import { GamificationEngine } from '../src/gamification.js';
import { MasteryStore, GLOBAL_NAMESPACE } from '../src/mastery.js';
import { RevisionEngine } from '../src/revision.js';
import { TodayPlanEngine } from '../src/today-planner.js';
import { exportProductionBackup, exportRecoverySnapshot, restoreProductionBackup, validateBackupPayload, resetProductionStore, BACKUP_NAMESPACE, RECOVERY_COLLECTION, createBackupPayload } from '../src/production.js';

const examId = 'exam-a';
const metadata = { appVersion: '1.0.0', storageVersion: 1 };
const timestamp = '2026-10-02T00:00:00.000Z';
const settings = { dailyMinutes: 90, onboardingSkipped: true };
const event = { eventId: 'event-1', type: 'topic_completed', examId, timestamp, entityId: 'topic-1', payload: {}, schemaVersion: 1 };

test('O4 backup envelope uses settings from the consistent storage snapshot over stale caller state', async () => {
  const store = await seed();
  const current = { dailyMinutes: 90, onboardingSkipped: true, diagnosticCompleted: false };
  await store.put(examId, 'user-settings', 'preferences', current);
  const staleUiSettings = { dailyMinutes: 120, onboardingSkipped: false, diagnosticCompleted: false };
  const payload = await exportProductionBackup(store, examId, metadata, staleUiSettings);
  assert.deepEqual(payload.settings, current);
  assert.deepEqual(payload.data.collections['user-settings'].find(row => row.id === 'preferences').value, current);

  const restored = new MemoryStore();
  const result = await restoreProductionBackup(restored, payload, { examId, metadata, currentSettings: staleUiSettings });
  await restored.put(examId, 'user-settings', 'preferences', result.settings);
  assert.deepEqual(await restored.get(examId, 'user-settings', 'preferences'), current);
});

async function seed(store = new MemoryStore()) {
  await store.put(examId, 'progress', 'same-id', { id: 'same-id', completed: true });
  await new EventLog(store).append(event);
  await new GamificationEngine(store).awardForEvent(event);
  await new ScoringEngine(store).submitAnswer({ examId, simulationRunId: 'run', questionId: 'question', correct: false, timestamp });
  await new ScoringEngine(store).submitAnswer({ examId, simulationRunId: 'run', questionId: 'question', correct: true, timestamp });
  await new RevisionEngine(store).review({ examId, topicId: 'topic-1', quality: 4, reviewedAt: timestamp });
  await new MasteryStore(store).put({ canonicalConceptId: 'concept-1', masteryEstimate: .6, confidence: .7, assessedAt: timestamp });
  await store.put(examId, 'content-metadata', 'same-id', { id: 'same-id', version: '1' });
  await store.put('exam-b', 'progress', 'other', { id: 'other' });
  return store;
}

test('O4 complete A → export → changes → restore = A, preserving compound score IDs, XP and global mastery', async () => {
  const store = await seed();
  const payload = JSON.parse(JSON.stringify(await exportProductionBackup(store, examId, metadata, settings)));
  assert.equal(payload.data.collections.scores[0].id, 'run::question');
  assert.equal(payload.data.collections.retakes[0].id, 'run::question::2');
  assert.equal(validateBackupPayload(payload, { examId, metadata, requireComplete: true }), true);
  const other = await store.export('exam-b');
  await store.put(examId, 'new-collection', 'later', { id: 'later' });
  await store.delete(examId, 'progress', 'same-id');
  await new MasteryStore(store).put({ canonicalConceptId: 'concept-2', masteryEstimate: .9, assessedAt: timestamp });
  const stateB = await store.export(examId);
  const globalB = await store.export(GLOBAL_NAMESPACE);
  const currentSettings = { dailyMinutes: 30 };
  const result = await restoreProductionBackup(store, payload, { examId, metadata, currentSettings });
  assert.deepEqual(JSON.parse(JSON.stringify(await store.export(examId))), payload.data);
  assert.deepEqual(JSON.parse(JSON.stringify(await store.export(GLOBAL_NAMESPACE))), payload.globalData);
  assert.deepEqual(await store.export('exam-b'), other);
  assert.deepEqual(result.settings, settings);
  assert.deepEqual(currentSettings, { dailyMinutes: 30 });
  assert.deepEqual(result.automaticBackup.data, stateB);
  assert.deepEqual(result.automaticBackup.globalData, globalB);
  assert.deepEqual(result.automaticBackup.settings, currentSettings);
  assert.deepEqual(await store.get(BACKUP_NAMESPACE, 'automatic', examId), result.automaticBackup);
  const scoring = new ScoringEngine(store);
  assert.equal((await scoring.getFirstAttempt(examId, 'run', 'question')).correct, false);
  assert.equal(await scoring.getScore(examId, 'run'), 0);
  assert.equal((await scoring.submitAnswer({ examId, simulationRunId: 'run', questionId: 'question', correct: true, timestamp })).firstAttempt, false);
  assert.equal(await new GamificationEngine(store).total(examId), 10);
  assert.equal((await new GamificationEngine(store).awardForEvent(event)).awarded, false);
  assert.equal((await new MasteryStore(store).get('concept-1')).masteryEstimate, .6);
});

test('O4 IDs are unique per named collection; duplicated records and events are rejected', async () => {
  const payload = await exportProductionBackup(await seed(), examId, metadata, settings);
  assert.equal(validateBackupPayload(payload), true); // same-id in two collections is legal
  payload.data.collections.progress.push(structuredClone(payload.data.collections.progress[0]));
  assert.throws(() => validateBackupPayload(payload), /IDs duplicados/);
  payload.data.collections.progress.pop();
  payload.data.events.push(structuredClone(event));
  assert.throws(() => validateBackupPayload(payload), /eventos duplicados/);
});

test('O4 concurrent answers atomically preserve one first attempt and record each retake', async () => {
  const store = new MemoryStore(); const scoring = new ScoringEngine(store);
  const results = await Promise.all(Array.from({ length: 32 }, (_, index) => scoring.submitAnswer({
    examId, simulationRunId: 'concurrent-run', questionId: 'same-question', correct: index !== 0,
    timestamp: new Date(Date.parse(timestamp) + index).toISOString()
  })));
  const first = await scoring.getFirstAttempt(examId, 'concurrent-run', 'same-question');
  const retakes = await store.query(examId, 'retakes');
  assert.equal(results.filter(result => result.firstAttempt).length, 1);
  assert.equal(results.filter(result => !result.firstAttempt).length, 31);
  assert.equal(first.correct, results.find(result => result.firstAttempt).record.correct);
  assert.equal(await scoring.getScore(examId, 'concurrent-run'), first.correct ? 100 : 0);
  assert.equal(retakes.filter(record => record.simulationRunId === 'concurrent-run').length, 31);
  assert.equal(Math.max(...retakes.filter(record => record.simulationRunId === 'concurrent-run').map(record => record.attempts)), 32);
});

const corruptions = {
  'unknown backup version': p => { p.backupVersion = 2; },
  'string export version': p => { p.data.version = '1'; },
  'unknown storage version': p => { p.storageVersion = 99; },
  'metadata mismatch': p => { p.storageVersion = 2; },
  'string storage version': p => { p.storageVersion = '1'; },
  'unknown literal storage version': p => { p.storageVersion = 'unknown'; },
  'duplicated progress projection IDs': p => { p.data.records.push(structuredClone(p.data.records[0])); },
  'missing global namespace': p => { delete p.globalData; },
  'missing preferences': p => { delete p.settings; },
  'array preferences': p => { p.settings = []; },
  'invalid daily goal': p => { p.settings.dailyMinutes = -1; },
  'fractional daily goal': p => { p.settings.dailyMinutes = 1.5; },
  'unknown preference': p => { p.settings.injected = true; },
  'invalid stored preference': p => { p.data.collections['user-settings'] = [{ id: 'preferences', value: { dailyMinutes: -1 } }]; },
  'null collections': p => { p.data.collections = null; },
  'object collection': p => { p.data.collections.progress = {}; },
  'null record': p => { p.data.collections.progress.push(null); },
  'blank record ID': p => { p.data.collections.progress[0].id = ' '; },
  'unknown exam': p => { p.examId = 'unknown'; },
  'wrong global namespace': p => { p.globalData.examId = examId; },
  'foreign event namespace': p => { p.data.events[0].examId = 'exam-b'; },
  'unknown event type': p => { p.data.events[0].type = 'idle'; },
  'unknown event schema': p => { p.data.events[0].schemaVersion = 2; },
  'null event payload': p => { p.data.events[0].payload = null; },
  'corrupt first attempt': p => { p.data.collections.scores[0].value.correct = 'false'; },
  'truncated score ID': p => { p.data.collections.scores[0].id = 'question'; },
  'invalid mastery type': p => { p.globalData.collections.mastery[0].value.confidence = 'high'; },
  'unknown mastery schema': p => { p.globalData.collections.mastery[0].value.schemaVersion = 2; },
  'inconsistent projection': p => { p.data.records = []; },
  'prototype pollution': p => { p.settings = JSON.parse('{"__proto__":{"polluted":true}}'); },
  'invalid export timestamp': p => { p.exportedAt = '2026-02-30T00:00:00Z'; }
};

const deepCorruptions = {
  'null today-plan activity': p => { p.data.collections['today-plans'] = [{ id: '2026-10-02', value: { planId: 'plan', examId, date: '2026-10-02', availableMinutes: 30, generatedAt: timestamp, algorithmVersion: 'v1', activities: [null], plannedMinutes: 0, completedMinutes: 0, status: 'ready', reasonSummary: '' } }]; },
  'malformed diagnostic response': p => { p.data.collections['diagnostic-runs'] = [{ id: 'run-d', value: { assessmentRunId: 'run-d', examId, schemaVersion: 1, status: 'in_progress', questionIds: ['q1'], responses: [null] } }]; },
  'diagnostic response outside sample': p => { p.data.collections['diagnostic-runs'] = [{ id: 'run-d', value: { assessmentRunId: 'run-d', examId, schemaVersion: 1, status: 'in_progress', questionIds: ['q1'], responses: [{ questionId: 'q2', correct: true, answeredAt: timestamp }] } }]; },
  'malformed study response': p => { p.data.collections['study-sessions'] = [{ id: 'run', value: { id: 'run', kind: 'quiz', status: 'paused', questionIds: ['q1'], responses: [null] } }]; },
  'pending operation ID without score reference': p => { p.data.collections['study-sessions'] = [{ id: 'run', value: { id: 'run', kind: 'quiz', status: 'paused', questionIds: ['q1'], responses: [], pending: { operationId: '', item: { id: 'q1' }, response: { itemId: 'q1', correct: true }, targets: [], reviewTargets: [] } } }]; },
  'orphaned operation receipt': p => { p.data.collections['retake-operations'] = [{ id: 'operation-1', value: { scoreId: 'missing::question', attempts: 1, firstAttempt: true } }]; }
};

test('O4 corrupt backups and malformed JSON leave all data and supplied settings intact', async () => {
  const store = await seed();
  const valid = await exportProductionBackup(store, examId, metadata, settings);
  for (const [name, mutate] of Object.entries(corruptions)) {
    const payload = structuredClone(valid);
    mutate(payload);
    await assert.rejects(restoreProductionBackup(store, payload, { examId, metadata, currentSettings: settings }), Error, name);
    assert.deepEqual(await store.export(examId), valid.data, name);
    assert.deepEqual(await store.export(GLOBAL_NAMESPACE), valid.globalData, name);
    assert.equal(await store.get(BACKUP_NAMESPACE, 'automatic', examId), undefined, name);
  }
  for (const [name, mutate] of Object.entries(deepCorruptions)) {
    const payload = structuredClone(valid);
    mutate(payload);
    await assert.rejects(restoreProductionBackup(store, payload, { examId, metadata, currentSettings: settings }), Error, name);
    assert.deepEqual(await store.export(examId), valid.data, name);
    assert.deepEqual(await store.export(GLOBAL_NAMESPACE), valid.globalData, name);
    assert.equal(await store.get(BACKUP_NAMESPACE, 'automatic', examId), undefined, name);
  }
  await assert.rejects(restoreProductionBackup(store, '{invalid', { examId, metadata }), /JSON inválido/);
  assert.equal({}.polluted, undefined);
});

test('O4 restore preserves valid pending sessions and operation receipts; old snapshots do not invent receipts', async () => {
  const store = await seed();
  const session = { id: 'run', examId, kind: 'simulation', title: 'Pool', status: 'paused', cursor: 0, questionIds: ['question'], responses: [], revealedIds: [], startedAt: timestamp, schemaVersion: 1,
    pending: { operationId: 'study-op', item: { id: 'question' }, response: { itemId: 'question', optionId: 'a', correct: false, retake: false, timestamp }, targets: [], reviewTargets: [] } };
  await store.put(examId, 'study-sessions', session.id, session);
  const receipt = { operationId: 'study-op', simulationRunId: 'run', questionId: 'question', correct: false, timestamp, scoreId: 'run::question', attempts: 1, firstAttempt: true };
  await store.put(examId, 'retake-operations', 'study-op', receipt);
  await store.put(examId, 'future-generic-state', 'feature-a', { enabled: true, settings: { mode: 'safe' } });
  const payload = await exportProductionBackup(store, examId, metadata, settings);
  assert.equal(validateBackupPayload(payload, { examId, metadata, requireComplete: true }), true);
  const ajv = await import('ajv/dist/2020.js');
  const addFormats = (await import('ajv-formats')).default;
  const { readFile, readdir } = await import('node:fs/promises');
  const validator = new ajv.default({ strict: false, allErrors: true }); addFormats(validator);
  const schemaDirectory = new URL('../../schemas/', import.meta.url);
  for (const file of await readdir(schemaDirectory)) if (file.endsWith('.json')) validator.addSchema(JSON.parse(await readFile(new URL(file, schemaDirectory), 'utf8')), file);
  const validateSchema = validator.getSchema('backup.schema.json');
  assert.equal(validateSchema(payload), true, JSON.stringify(validateSchema.errors));
  const restored = new MemoryStore();
  await restoreProductionBackup(restored, payload, { examId, metadata, currentSettings: settings });
  assert.deepEqual(await restored.get(examId, 'study-sessions', session.id), session);
  assert.deepEqual(await restored.get(examId, 'retake-operations', 'study-op'), receipt);
  assert.deepEqual(await restored.get(examId, 'future-generic-state', 'feature-a'), { enabled: true, settings: { mode: 'safe' } });

  const legacy = await exportProductionBackup(await seed(), examId, metadata, settings);
  assert.equal(legacy.data.collections['retake-operations'], undefined);
  const legacyRestored = new MemoryStore();
  await restoreProductionBackup(legacyRestored, legacy, { examId, metadata, currentSettings: settings });
  assert.equal((await legacyRestored.query(examId, 'retake-operations')).length, 0);
});

test('O4 round-trip preserves a generated extra-study activity with its nullable resource reference', async () => {
  const store = new MemoryStore();
  const plans = new TodayPlanEngine(store);
  await plans.generate({
    examId, date: '2026-10-02', availableMinutes: 30, now: timestamp,
    curriculum: { examId, disciplines: [{ id: 'd', title: 'Discipline', weight: 1, modules: [{ id: 'm', title: 'Module', topics: [{ id: 'topic-a', title: 'Topic', canonicalConceptIds: ['concept-a'], estimatedMinutes: 20, priority: 1 }] }] }] }
  });
  const generated = await plans.addExtraActivity({ examId, date: '2026-10-02', topicId: 'topic-a', minutes: 15 });
  assert.equal(generated.activities.at(-1).resourceId, null);
  const payload = await exportProductionBackup(store, examId, metadata, settings);
  assert.equal(validateBackupPayload(payload, { examId, metadata, requireComplete: true }), true);
  const restored = new MemoryStore();
  await restoreProductionBackup(restored, payload, { examId, metadata, currentSettings: settings });
  assert.deepEqual(await restored.get(examId, 'today-plans', '2026-10-02'), generated);
});

test('O4 replacement prepares all namespaces before writes and MemoryStore transaction rolls back', async () => {
  const store = await seed();
  const before = await store.export(examId);
  const globalBefore = await store.export(GLOBAL_NAMESPACE);
  await assert.rejects(store.replaceNamespaces([
    { ...before, collections: {} },
    { ...globalBefore, collections: { mastery: [{ id: 'bad', value: { uncloneable: () => {} } }] } }
  ]));
  assert.deepEqual(await store.export(examId), before);
  assert.deepEqual(await store.export(GLOBAL_NAMESPACE), globalBefore);
  await assert.rejects(store.transaction(examId, async draft => {
    await draft.delete(examId, 'scores', 'run::question');
    await draft.put(GLOBAL_NAMESPACE, 'test', 'bad', { id: 'bad' });
    throw new Error('failure');
  }), /failure/);
  assert.deepEqual(await store.export(examId), before);
  assert.deepEqual(await store.export(GLOBAL_NAMESPACE), globalBefore);
});

test('O4 failure saving automatic recovery copy prevents replacement', async () => {
  class FailingBackupStore extends MemoryStore {
    async put(namespace, ...args) {
      if (namespace === BACKUP_NAMESPACE) throw new Error('quota exceeded');
      return super.put(namespace, ...args);
    }
  }
  const store = await seed(new FailingBackupStore());
  const payload = await exportProductionBackup(store, examId, metadata, settings);
  await assert.rejects(restoreProductionBackup(store, payload, { examId, metadata, currentSettings: settings }), /quota/);
  assert.deepEqual(await store.export(examId), payload.data);
});

test('O4 corrupt local state is raw-captured at UI key atomically before valid import; old automatic copy survives', async () => {
  const target = await seed();
  const incoming = await exportProductionBackup(await seed(), examId, metadata, settings);
  const previousAutomatic = { backupVersion: 1, examId, marker: 'prior-copy' };
  await target.put(BACKUP_NAMESPACE, 'automatic', examId, previousAutomatic);
  const rawReading = { id: 'theory:broken', status: 'paused', date: '2026-10-02', activity: null, completedAt: null };
  await target.put(examId, 'study-reading', 'theory:broken', rawReading);
  await target.put(examId, 'opaque-native', 'date', { value: new Date('2026-10-04T12:00:00.000Z') });

  const result = await restoreProductionBackup(target, incoming, { examId, metadata, currentSettings: settings });
  const recovery = await target.get(BACKUP_NAMESPACE, 'corrupt-state', result.recoverySnapshot.captureId);
  assert.equal(result.recoveryOnly, true);
  assert.equal(recovery.kind, 'studyos-recovery');
  assert.equal(recovery.recoveryOnly, true);
  assert.equal(Object.hasOwn(recovery, 'backupVersion'), false);
  assert.deepEqual(recovery.rawSettings, settings);
  assert.deepEqual(recovery.rows.find(row => row.key === `${examId}::study-reading::theory:broken`).value, rawReading);
  const capturedDate = recovery.rows.find(row => row.key === `${examId}::opaque-native::date`).value.value;
  assert.equal(capturedDate instanceof Date, true);
  assert.deepEqual(await exportRecoverySnapshot(target, examId), recovery);
  assert.deepEqual(await target.get(BACKUP_NAMESPACE, 'automatic', examId), previousAutomatic);
  assert.deepEqual(await target.export(examId), incoming.data);
  await assert.rejects(Promise.resolve().then(() => validateBackupPayload(recovery, { examId, requireComplete: true })));
  await assert.rejects(restoreProductionBackup(target, recovery, { examId, metadata, currentSettings: settings }));
});

test('O4 reset also captures corrupt rows atomically and fails closed when capture fails', async () => {
  const store = await seed();
  await store.put(examId, 'study-reading', 'theory:broken', { id: 'theory:broken', status: 'paused', date: '2026-10-02', activity: null, completedAt: null });
  const result = await resetProductionStore(store, examId, { confirmation: 'RESETAR', metadata, currentSettings: settings });
  assert.equal(result.recoveryOnly, true);
  assert.ok((await exportRecoverySnapshot(store, examId)).rows.some(row => row.key === `${examId}::study-reading::theory:broken`));
  assert.deepEqual(Object.keys((await store.export(examId)).collections), []);

  class FailingCaptureStore extends MemoryStore {
    async captureAndReplaceNamespaces() { throw new Error('capture write failed'); }
  }
  const blocked = await seed(new FailingCaptureStore());
  const before = await blocked.export(examId);
  await assert.rejects(restoreProductionBackup(blocked, await exportProductionBackup(await seed(), examId, metadata, settings), { examId, metadata, currentSettings: settings }), /capture write failed/);
  assert.deepEqual(await blocked.export(examId), before);
});

test('O4 strong reset requires exact confirmation, backs up and clears selected exam plus global state', async () => {
  const store = await seed();
  const other = await store.export('exam-b');
  const before = await exportProductionBackup(store, examId, metadata, settings);
  for (const confirmation of [undefined, true, 'resetar', ' RESETAR']) {
    await assert.rejects(resetProductionStore(store, examId, { confirmation, metadata }), /RESETAR/);
    assert.deepEqual(await store.export(examId), before.data);
  }
  const result = await resetProductionStore(store, examId, { confirmation: 'RESETAR', metadata, currentSettings: settings });
  assert.deepEqual(Object.keys((await store.export(examId)).collections), []);
  assert.deepEqual(Object.keys((await store.export(GLOBAL_NAMESPACE)).collections), []);
  assert.deepEqual(result.settings, {});
  assert.deepEqual(result.automaticBackup.data, before.data);
  assert.deepEqual(await store.export('exam-b'), other);
  await restoreProductionBackup(store, result.automaticBackup, { examId, metadata, currentSettings: {} });
  assert.deepEqual(await store.export(examId), before.data);
});

test('O4 legacy createBackupPayload remains usable but incomplete backups cannot silently omit global/preferences', async () => {
  const store = await seed();
  const payload = createBackupPayload({ examId, exported: await store.export(examId), metadata });
  assert.equal(validateBackupPayload(payload), true);
  await assert.rejects(restoreProductionBackup(store, payload, { examId, metadata }), /incompleto/);
});

test('O4 production storageVersion 2 is independent of exportVersion 1 and unknown physical versions fail', async () => {
  const store = await seed();
  const metadata2 = { ...metadata, storageVersion: 2 };
  const payload = await exportProductionBackup(store, examId, metadata2, settings);
  assert.equal(payload.storageVersion, 2);
  assert.equal(payload.data.version, 1);
  assert.equal(payload.globalData.version, 1);
  assert.equal(validateBackupPayload(payload, { examId, metadata: metadata2 }), true);
  await restoreProductionBackup(store, payload, { examId, metadata: metadata2, currentSettings: settings });
  assert.deepEqual(await store.export(examId), payload.data);
  assert.throws(() => validateBackupPayload({ ...payload, storageVersion: 99 }), /inválido/);
  assert.throws(() => validateBackupPayload(payload, { metadata }), /storageVersion incompatível/);
});

test('O4 missing current settings blocks valid export but import still preserves a recovery-only capture', async () => {
  const store = await seed();
  await assert.rejects(exportProductionBackup(store, examId, metadata), /incompleto/);
  const payload = await exportProductionBackup(store, examId, metadata, settings);
  const result = await restoreProductionBackup(store, payload, { examId, metadata });
  assert.equal(result.recoveryOnly, true);
  assert.equal(result.recoverySnapshot.rawSettings, null);
  assert.deepEqual(await store.export(examId), payload.data);
  assert.equal(await store.get(BACKUP_NAMESPACE, 'automatic', examId), undefined);
});

test('O4 recovery export selects the latest snapshot belonging to the requested exam', async () => {
  const store = new MemoryStore();
  for (const id of ['exam-a', 'exam-b']) {
    await store.put(id, 'state', `row-${id}`, { id });
    await store.captureAndReplaceNamespaces({
      namespaceIds: [id], replacements: [{ version: 1, examId: id, collections: {} }],
      captureNamespace: BACKUP_NAMESPACE, captureCollection: RECOVERY_COLLECTION,
      captureId: `capture-${id}`, metadata: { appVersion: '1.0.0' }
    });
  }
  const forA = await exportRecoverySnapshot(store, 'exam-a');
  const forB = await exportRecoverySnapshot(store, 'exam-b');
  assert.equal(forA.captureId, 'capture-exam-a');
  assert.equal(forB.captureId, 'capture-exam-b');
  assert.equal(await exportRecoverySnapshot(store, 'exam-b', 'capture-exam-a'), undefined);
});
