import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MemoryStore } from '../src/storage.js';
import { TodayPlanEngine } from '../src/today-planner.js';
import { GamificationEngine } from '../src/gamification.js';

const examId = 'generic-exam';
const curriculum = { examId, disciplines: [{ id: 'd', title: 'Discipline', modules: [{ id: 'm', title: 'Module', topics: [1, 2, 3, 4].map(n => ({ id: 't' + n, title: 'Topic ' + n, canonicalConceptIds: ['c' + n], estimatedMinutes: 30 })) }] }] };
const input = { examId, date: '2030-01-01', availableMinutes: 90, curriculum, now: '2030-01-01T09:00:00.000Z' };

test('O4 Today: duplicate completion with different timestamps keeps XP, minutes and first timestamp', async () => {
  const store = new MemoryStore(); const plans = new TodayPlanEngine(store); const xp = new GamificationEngine(store);
  const plan = await plans.generate(input); const activityId = plan.activities[0].activityId;
  await plans.completeActivity({ examId, date: input.date, activityId, timestamp: '2030-01-01T10:00:00.000Z' });
  assert.equal(await xp.total(examId), 5);
  await plans.completeActivity({ examId, date: input.date, activityId, timestamp: '2030-01-01T11:00:00.000Z', actualMinutes: 300 });
  await plans.resumeActivity({ examId, date: input.date, activityId });
  assert.equal(await xp.total(examId), 5); const saved = await plans.get(examId, input.date);
  assert.equal(saved.completedMinutes, 30); assert.equal(saved.activities[0].status, 'completed'); assert.equal(saved.activities[0].completedAt, '2030-01-01T10:00:00.000Z');
});

test('O4 Today: replan preserves total goal, completed/paused sessions and unique IDs across reload', async () => {
  const store = new MemoryStore(); let plans = new TodayPlanEngine(store);
  const plan = await plans.generate(input);
  await plans.completeActivity({ examId, date: input.date, activityId: plan.activities[0].activityId });
  const first = await plans.replan(input); assert.equal(first.availableMinutes, 90); assert.equal(first.remainingMinutes, 60); assert.equal(first.completedMinutes, 30);
  const ids = first.activities.map(activity => activity.activityId); assert.equal(new Set(ids).size, ids.length);
  const pausedId = first.activities[1].activityId;
  await plans.pauseActivity({ examId, date: input.date, activityId: pausedId });
  const second = await plans.replan({ ...input, availableMinutes: 120 });
  assert.equal(second.availableMinutes, 120); assert.equal(second.activities.find(a => a.activityId === pausedId).status, 'paused');
  assert.equal(second.activities[0].activityId, plan.activities[0].activityId); assert.equal(new Set(second.activities.map(a => a.activityId)).size, second.activities.length);
  plans = new TodayPlanEngine(store); assert.deepEqual(await plans.get(examId, input.date), second);
  await plans.completeActivity({ examId, date: input.date, activityId: second.activities[2].activityId });
  assert.equal((await plans.get(examId, input.date)).completedMinutes, 60);
});
