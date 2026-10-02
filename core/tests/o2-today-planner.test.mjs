import assert from 'node:assert/strict';
import { test } from 'node:test';
import { MemoryStore } from '../src/storage.js';
import { createTodayPlan, TodayPlanEngine, TODAY_PLAN_ALGORITHM_VERSION } from '../src/today-planner.js';
import { MasteryStore } from '../src/mastery.js';

function curriculum(examId = 'exam-a') {
  return { examId, disciplines: [
    { id: 'd-heavy', title: 'Heavy', weight: 2, modules: [{ id: 'm-1', title: 'M1', topics: [
      { id: 'topic-fragile', title: 'Fragile', canonicalConceptIds: ['concept.fragile'], estimatedMinutes: 30, priority: 2 },
      { id: 'topic-due', title: 'Due', canonicalConceptIds: ['concept.due'], estimatedMinutes: 25, priority: 1 }
    ] }] },
    { id: 'd-light', title: 'Light', weight: 1, modules: [{ id: 'm-2', title: 'M2', topics: [
      { id: 'topic-new', title: 'New', canonicalConceptIds: ['concept.new'], estimatedMinutes: 40, priority: 1, dependencies: ['topic-fragile'] },
      { id: 'topic-strong', title: 'Strong', canonicalConceptIds: ['concept.strong'], estimatedMinutes: 35, priority: 1 }
    ] }] }
  ] };
}

const questions = [
  { id: 'q-fragile', topicIds: ['topic-fragile'], canonicalConceptIds: ['concept.fragile'] },
  { id: 'q-new', topicIds: ['topic-new'], canonicalConceptIds: ['concept.new'] },
  { id: 'q-strong', topicIds: ['topic-strong'], canonicalConceptIds: ['concept.strong'] }
];

function input(overrides = {}) {
  return { examId: 'exam-a', date: '2026-10-02', availableMinutes: 120, curriculum: curriculum(), questions, examDate: '2027-01-17', now: '2026-10-02T08:00:00.000Z', ...overrides };
}

test('O2 creates a deterministic TodayPlan within the time budget', () => {
  const first = createTodayPlan(input());
  const second = createTodayPlan(input());
  assert.equal(first.algorithmVersion, TODAY_PLAN_ALGORITHM_VERSION);
  assert.equal(first.plannedMinutes <= 120, true);
  assert.equal(first.plannedMinutes, first.activities.reduce((sum, activity) => sum + activity.estimatedMinutes, 0));
  assert.deepEqual(first, second);
  assert.ok(first.activities.every((activity) => activity.reason && activity.source && Array.isArray(activity.dependencies)));
});

test('O2 respects 30-minute budgets and never creates an over-budget mandatory agenda', () => {
  const plan = createTodayPlan(input({ availableMinutes: 30 }));
  assert.ok(plan.plannedMinutes <= 30);
  assert.ok(plan.activities.length > 0);
  assert.ok(plan.activities.every((activity) => activity.estimatedMinutes <= 30));
});

test('O2 prioritizes overdue reviews, recent errors and real explanations', () => {
  const plan = createTodayPlan(input({
    masteryByConcept: { 'concept.fragile': { masteryEstimate: .2, confidence: .4 } },
    revisions: [{ topicId: 'topic-due', dueAt: '2026-10-01T00:00:00.000Z', interval: 1 }],
    firstAttempts: [{ questionId: 'q-fragile', topicIds: ['topic-fragile'], correct: false }, { questionId: 'q-fragile-2', topicIds: ['topic-fragile'], correct: false }]
  }));
  const due = plan.activities.find((activity) => activity.topicId === 'topic-due');
  const fragile = plan.activities.find((activity) => activity.topicId === 'topic-fragile');
  assert.equal(due.type, 'review');
  assert.equal(fragile.type, 'error_review');
  assert.match(due.reason, /1 revisão\(ões\) vencida/);
  assert.match(fragile.reason, /2 erro\(s\) na primeira tentativa/);
});

test('O2 diversifies disciplines when no single priority dominates', () => {
  const plan = createTodayPlan(input({ availableMinutes: 90 }));
  assert.ok(new Set(plan.activities.map((activity) => activity.topicId)).size >= 3);
  assert.ok(plan.activities.some((activity) => activity.topicId === 'topic-new'));
});

test('O2 exposes dependencies and stable question selection', () => {
  const plan = createTodayPlan(input({ availableMinutes: 90 }));
  const activity = plan.activities.find((item) => item.topicId === 'topic-new');
  assert.deepEqual(activity.dependencies, ['topic-fragile']);
  assert.deepEqual(activity.questionIds, ['q-new']);
});

test('O2 supports start, pause, resume and completion with idempotent events', async () => {
  const store = new MemoryStore();
  const engine = new TodayPlanEngine(store);
  const plan = await engine.generate(input({ availableMinutes: 30 }));
  const activity = plan.activities[0];
  await engine.startActivity({ examId: 'exam-a', date: plan.date, activityId: activity.activityId, timestamp: '2026-10-02T09:00:00.000Z' });
  await engine.pauseActivity({ examId: 'exam-a', date: plan.date, activityId: activity.activityId, timestamp: '2026-10-02T09:10:00.000Z', actualMinutes: 10 });
  await engine.resumeActivity({ examId: 'exam-a', date: plan.date, activityId: activity.activityId, timestamp: '2026-10-02T09:20:00.000Z' });
  await engine.completeActivity({ examId: 'exam-a', date: plan.date, activityId: activity.activityId, timestamp: '2026-10-02T09:30:00.000Z', actualMinutes: 30 });
  const saved = await engine.get('exam-a', plan.date);
  assert.equal(saved.activities[0].status, 'completed');
  assert.equal(saved.completedMinutes, activity.estimatedMinutes);
  assert.equal((await store.query('exam-a', 'activity-state')).length, 1);
  assert.ok((await store.query('exam-a', 'events')).some((event) => event.type === 'activity_completed'));
});

test('O2 replans only the remaining budget and absorbs completed work', async () => {
  const store = new MemoryStore();
  const engine = new TodayPlanEngine(store);
  const plan = await engine.generate(input({ availableMinutes: 60 }));
  const first = plan.activities[0];
  await engine.completeActivity({ examId: 'exam-a', date: plan.date, activityId: first.activityId, timestamp: '2026-10-02T09:30:00.000Z' });
  const replanned = await engine.replan(input({ availableMinutes: 60 }));
  assert.equal(replanned.completedMinutes, first.estimatedMinutes);
  assert.ok(replanned.plannedMinutes <= 60);
  assert.equal(replanned.activities.filter((activity) => activity.status === 'completed').length, 1);
});

test('O2 uses a configurable fair streak threshold, not page opens or idle time', async () => {
  const store = new MemoryStore();
  const engine = new TodayPlanEngine(store);
  const plan = await engine.generate(input({ availableMinutes: 60 }));
  await engine.completeActivity({ examId: 'exam-a', date: plan.date, activityId: plan.activities[0].activityId, timestamp: '2026-10-02T09:00:00.000Z', actualMinutes: 60 });
  assert.equal(await engine.streak('exam-a', 60, .6, '2026-10-02'), 1);
  assert.equal(await engine.streak('exam-a', 120, .6, '2026-10-02'), 0);
});

test('O2 export/import preserves plans and activity state without mixing exams', async () => {
  const source = new MemoryStore();
  const engine = new TodayPlanEngine(source);
  const plan = await engine.generate(input({ availableMinutes: 30 }));
  await engine.startActivity({ examId: 'exam-a', date: plan.date, activityId: plan.activities[0].activityId });
  const exported = await source.export('exam-a');
  const target = new MemoryStore();
  await target.import('exam-b', { ...exported, examId: 'exam-b' });
  assert.ok(await target.get('exam-b', 'today-plans', plan.date));
  assert.ok((await target.query('exam-b', 'activity-state')).length === 1);
  assert.equal(await target.get('exam-a', 'today-plans', plan.date), undefined);
});

test('O2 keeps mastery global while TodayPlan remains exam-specific', async () => {
  const store = new MemoryStore();
  await new MasteryStore(store).put({ canonicalConceptId: 'concept.shared', masteryEstimate: .8, confidence: .7, source: 'test' });
  const a = createTodayPlan(input({ examId: 'exam-a' }));
  const b = createTodayPlan(input({ examId: 'exam-b', curriculum: curriculum('exam-b'), masteryByConcept: { 'concept.shared': { masteryEstimate: .8, confidence: .7 } } }));
  assert.equal(a.examId, 'exam-a');
  assert.equal(b.examId, 'exam-b');
  assert.equal((await new MasteryStore(store).get('concept.shared')).masteryEstimate, .8);
});

test('O2 supports optional extra study without changing the daily goal', async () => {
  const store = new MemoryStore();
  const engine = new TodayPlanEngine(store);
  const plan = await engine.generate(input({ availableMinutes: 30 }));
  const originalGoal = plan.availableMinutes;
  const extended = await engine.addExtraActivity({ examId: 'exam-a', date: plan.date, topicId: 'topic-new', minutes: 15 });
  assert.equal(extended.availableMinutes, originalGoal);
  assert.equal(extended.activities.at(-1).source, 'extra-study');
  assert.ok((await store.query('exam-a', 'events')).some((event) => event.type === 'extra_study_started'));
});

