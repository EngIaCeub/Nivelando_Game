import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import Ajv from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import { MemoryStore } from '../src/storage.js';
import { StudySession } from '../src/study-ui.js';
import { TodayPlanEngine } from '../src/today-planner.js';
import { GLOBAL_NAMESPACE } from '../src/mastery.js';
import { exportProductionBackup, restoreProductionBackup, BACKUP_NAMESPACE } from '../src/production.js';
import { replayCorruptions } from './fixtures/invalid-backups.mjs';

const examId = 'replay-exam';
const metadata = { appVersion: '1.0.0', storageVersion: 1 };
const settings = { dailyMinutes: 30 };
const day = '2026-10-03';
const question = { id: 'q', stem: 'Q', options: [{ id: 'a', text: 'Wrong' }, { id: 'b', text: 'Correct' }], correctOptionId: 'b', canonicalConceptIds: ['concept'], topicIds: ['topic'] };

async function snapshot(retake = false) {
  const store = new MemoryStore();
  const planner = new TodayPlanEngine(store);
  const plan = await planner.generate({ examId, date: day, now: `${day}T10:00:00.000Z`, availableMinutes: 30,
    curriculum: { examId, disciplines: [{ id: 'd', weight: 1, modules: [{ id: 'm', topics: [{ id: 'topic', title: 'Topic', estimatedMinutes: 15, canonicalConceptIds: ['concept'] }] }] }] } });
  await planner.completeActivity({ examId, date: day, activityId: plan.activities[0].activityId, actualMinutes: 15 });
  const extended = await planner.addExtraActivity({ examId, date: day, topicId: 'topic' });
  const activity = extended.activities.at(-1);
  // Same record fields as showTheory in site-app; no browser-specific data added.
  const reading = { id: `theory:${activity.activityId}`, activity, date: day, status: 'paused', completedAt: null };
  await store.put(examId, 'study-reading', reading.id, reading);
  const session = new StudySession(store, examId);
  await session.start({ id: 'run', questions: [question] });
  await session.resume('run');
  if (retake) {
    await session.answer('run', question, 'a');
    await new Promise(resolve => setTimeout(resolve, 5)); // distinct deliberate operation timestamp
  }
  const put = store.put.bind(store);
  store.put = async (namespace, collection, ...args) => {
    if (!retake && collection === 'xp-awards') throw new Error('interrupted after score');
    return put(namespace, collection, ...args);
  };
  if (retake) {
    const update = store.update.bind(store);
    store.update = async (namespace, collection, id, updater) => update(namespace, collection, id, (previous) => {
      const wasPending = Boolean(previous?.pending);
      const next = updater(previous);
      if (collection === 'study-sessions' && wasPending && !next?.pending) throw new Error('interrupted after score');
      return next;
    });
  }
  await assert.rejects(session.answer('run', question, retake ? 'b' : 'a', { retake }), /interrupted/);
  return exportProductionBackup(store, examId, metadata, settings);
}

async function schema() {
  const ajv = new Ajv({ strict: false, allErrors: true }); addFormats(ajv);
  const directory = new URL('../../schemas/', import.meta.url);
  for (const file of await readdir(directory)) if (file.endsWith('.json')) ajv.addSchema(JSON.parse(await readFile(new URL(file, directory), 'utf8')), file);
  return ajv.getSchema('backup.schema.json');
}

test('O4 QA corruptions reject before restore writes, including pre-score replay and token ordering', async t => {
  const valid = await snapshot();
  const validate = await schema();
  assert.equal(validate(valid), true, JSON.stringify(validate.errors));
  for (const [name, mutate, invalidShape] of replayCorruptions()) await t.test(name, async () => {
    const target = new MemoryStore();
    for (const ns of [examId, GLOBAL_NAMESPACE, BACKUP_NAMESPACE, 'other-exam']) await target.put(ns, 'sentinel', 'saved', { untouched: true });
    const namespaces = [examId, GLOBAL_NAMESPACE, BACKUP_NAMESPACE, 'other-exam'];
    const before = await Promise.all(namespaces.map(ns => target.export(ns)));
    const corrupted = structuredClone(valid); mutate(corrupted);
    const original = structuredClone(corrupted);
    if (invalidShape) assert.equal(validate(corrupted), false, name);
    const currentSettings = { dailyMinutes: 60 };
    await assert.rejects(restoreProductionBackup(target, corrupted, { examId, metadata, currentSettings }), /backup/);
    assert.deepEqual(await Promise.all(namespaces.map(ns => target.export(ns))), before);
    assert.deepEqual(corrupted, original);
    assert.deepEqual(currentSettings, { dailyMinutes: 60 });
  });
});

test('O4 generated interrupted response survives restore then resume exactly once; reading and plan remain usable', async () => {
  const backup = await snapshot();
  const store = new MemoryStore();
  await restoreProductionBackup(store, backup, { examId, metadata, currentSettings: {} });
  const session = new StudySession(store, examId);
  const receiptBefore = await store.query(examId, 'retake-operations');
  const scoreBefore = await store.query(examId, 'scores');
  const resumed = await session.resume('run');
  assert.equal(resumed.pending, undefined);
  assert.equal(resumed.responses.length, 1);
  await session.resume('run');
  assert.deepEqual(await store.query(examId, 'scores'), scoreBefore);
  assert.deepEqual(await store.query(examId, 'retake-operations'), receiptBefore);
  assert.equal((await store.query(examId, 'retakes')).length, 0);
  assert.equal(await session.scoring.getScore(examId, 'run'), 0);
  const reading = (await store.query(examId, 'study-reading'))[0];
  assert.equal(reading.activity.topicId, 'topic'); // renderResume dereference
  const planner = new TodayPlanEngine(store);
  await planner.resumeActivity({ examId, date: reading.date, activityId: reading.activity.activityId });
  const result = await planner.completeActivity({ examId, date: reading.date, activityId: reading.activity.activityId });
  assert.equal(Number.isFinite(result.plan.completedMinutes), true);
  assert.equal(result.plan.completedMinutes, 30);
});

test('O4 valid pending before score and documented legacy without operationId restore and resume', async () => {
  for (const legacy of [false, true]) {
    const backup = await snapshot();
    delete backup.data.collections.scores;
    delete backup.data.collections['retake-operations'];
    if (legacy) delete backup.data.collections['study-sessions'][0].value.pending.operationId;
    const store = new MemoryStore();
    await restoreProductionBackup(store, backup, { examId, metadata, currentSettings: {} });
    const session = new StudySession(store, examId);
    await session.resume('run'); await session.resume('run');
    assert.equal((await store.query(examId, 'scores')).length, 1);
    assert.equal((await store.query(examId, 'retakes')).length, 0);
    assert.equal((await store.query(examId, 'retake-operations')).length, legacy ? 0 : 1);
  }
});

test('O4 interrupted retake receipt survives restore and resume without another attempt', async () => {
  const backup = await snapshot(true);
  const validate = await schema();
  assert.equal(validate(backup), true, JSON.stringify(validate.errors));
  const store = new MemoryStore();
  await restoreProductionBackup(store, backup, { examId, metadata, currentSettings: {} });
  const before = await store.query(examId, 'retakes');
  const session = new StudySession(store, examId);
  await session.resume('run'); await session.resume('run');
  assert.equal((await session.get('run')).responses.length, 2);
  assert.equal((await session.get('run')).pending, undefined);
  assert.deepEqual(await store.query(examId, 'retakes'), before);
  assert.equal(before.length, 1);
  assert.equal(await session.scoring.getScore(examId, 'run'), 0);
});
