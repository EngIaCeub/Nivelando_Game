import assert from 'node:assert/strict';
import { test } from 'node:test';
import { DiagnosticEngine } from '../src/diagnostics.js';
import { GLOBAL_NAMESPACE, MasteryStore } from '../src/mastery.js';
import { MemoryStore } from '../src/storage.js';

const examId = 'diagnostic-concurrency-exam';
const question = { id: 'diagnostic-q1', canonicalConceptIds: ['concept.concurrent'] };
const stamp = '2026-10-04T12:00:00.000Z';

class InterleavingStore extends MemoryStore {
  interleave;
  observedConcurrentMastery;

  async update(namespace, collection, id, updater) {
    if (this.interleave && namespace === GLOBAL_NAMESPACE && collection === 'mastery') {
      const interleave = this.interleave;
      this.interleave = null;
      await interleave();
      this.observedConcurrentMastery = await super.get(namespace, collection, id);
    }
    return super.update(namespace, collection, id, updater);
  }
}

test('diagnostic mastery update reads the latest state and retains a concurrent study answer', async () => {
  const store = new InterleavingStore();
  const mastery = new MasteryStore(store);
  const engine = new DiagnosticEngine(store, { initialQuestionsPerConcept: 1, maxQuestionsPerConcept: 3 });
  await mastery.put({ canonicalConceptId: question.canonicalConceptIds[0], masteryEstimate: .2, confidence: .6 });
  const run = await engine.start({ examId, assessmentRunId: 'assessment-race', questions: [question] });
  await engine.answer({ examId, assessmentRunId: run.assessmentRunId, questionId: question.id,
    canonicalConceptIds: question.canonicalConceptIds, correct: false, answeredAt: stamp });

  store.interleave = () => mastery.applyStudyAnswer({ canonicalConceptId: question.canonicalConceptIds[0],
    correct: true, firstAttempt: true, assessedAt: stamp, operationId: 'concurrent-study-answer' });
  const result = await engine.complete({ examId, assessmentRunId: run.assessmentRunId, completedAt: stamp });

  const concurrent = store.observedConcurrentMastery;
  assert.equal(concurrent.masteryEstimate, .6);
  assert.equal(concurrent.confidence, .7);
  const previousWeight = Math.min(.3, concurrent.confidence * .3);
  const questionWeight = .8 / 3;
  const expected = Number(((concurrent.masteryEstimate * previousWeight) / (questionWeight + previousWeight)).toFixed(3));
  const current = await mastery.get(question.canonicalConceptIds[0]);
  assert.equal(current.masteryEstimate, expected, 'diagnostic estimate must be based on the concurrent answer state');
  assert.equal(current.questionCount, 2, 'concurrent and diagnostic question counts must both survive');
  assert.equal(current.firstTryCorrect, 1);
  assert.equal(current.firstTryWrong, 1);
  assert.deepEqual(current.appliedStudyOperations.sort(), [
    'concurrent-study-answer', `diagnostic:${examId}:${run.assessmentRunId}:${question.canonicalConceptIds[0]}`
  ].sort());
  assert.deepEqual(result.mastery[0], current);
});

test('diagnostic completion replay after status-write failure is idempotent and returns current mastery', async () => {
  class FailCompletedRunWriteStore extends MemoryStore {
    failCompletedRunWrite = false;
    async put(namespace, collection, id, value) {
      if (this.failCompletedRunWrite && collection === 'diagnostic-runs' && value?.status === 'completed') {
        this.failCompletedRunWrite = false;
        throw new Error('injected diagnostic-runs write failure');
      }
      return super.put(namespace, collection, id, value);
    }
  }

  const store = new FailCompletedRunWriteStore();
  const mastery = new MasteryStore(store);
  const engine = new DiagnosticEngine(store, { initialQuestionsPerConcept: 1, maxQuestionsPerConcept: 1 });
  const run = await engine.start({ examId, assessmentRunId: 'assessment-replay', questions: [question] });
  await engine.answer({ examId, assessmentRunId: run.assessmentRunId, questionId: question.id,
    canonicalConceptIds: question.canonicalConceptIds, correct: false, answeredAt: stamp });

  store.failCompletedRunWrite = true;
  await assert.rejects(engine.complete({ examId, assessmentRunId: run.assessmentRunId, completedAt: stamp }),
    /injected diagnostic-runs write failure/);
  assert.equal((await engine.getRun(examId, run.assessmentRunId)).status, 'in_progress');
  const afterFirstApplication = await mastery.get(question.canonicalConceptIds[0]);
  const operationId = `diagnostic:${examId}:${run.assessmentRunId}:${question.canonicalConceptIds[0]}`;
  assert.ok(afterFirstApplication.appliedStudyOperations.includes(operationId), 'assessment operation receipt must be durable');

  const retried = await engine.complete({ examId, assessmentRunId: run.assessmentRunId, completedAt: stamp });
  assert.deepEqual(await mastery.get(question.canonicalConceptIds[0]), afterFirstApplication,
    'retry after the crash window must not apply diagnostic mastery twice');
  assert.deepEqual(retried.mastery[0], afterFirstApplication);
  assert.equal(retried.run.status, 'completed');

  await mastery.applyStudyAnswer({ canonicalConceptId: question.canonicalConceptIds[0], correct: true,
    firstAttempt: true, assessedAt: stamp, operationId: 'study-after-diagnostic' });
  const latest = await mastery.get(question.canonicalConceptIds[0]);
  const repeatedComplete = await engine.complete({ examId, assessmentRunId: run.assessmentRunId, completedAt: stamp });
  assert.deepEqual(repeatedComplete.mastery[0], latest, 'completed retries must return, not overwrite, the current record');
  assert.deepEqual(await mastery.get(question.canonicalConceptIds[0]), latest);
});

test('diagnostic idempotency keys are isolated by exam when assessmentRunId is reused', async () => {
  const store = new MemoryStore();
  for (const namespace of ['exam-a', 'exam-b']) {
    const engine = new DiagnosticEngine(store, { initialQuestionsPerConcept: 1, maxQuestionsPerConcept: 1 });
    const run = await engine.start({ examId: namespace, assessmentRunId: 'same-id', questions: [question] });
    await engine.answer({ examId: namespace, assessmentRunId: run.assessmentRunId, questionId: question.id,
      canonicalConceptIds: question.canonicalConceptIds, correct: true, answeredAt: stamp });
    await engine.complete({ examId: namespace, assessmentRunId: run.assessmentRunId, completedAt: stamp });
  }
  const record = await new MasteryStore(store).get(question.canonicalConceptIds[0]);
  assert.equal(record.questionCount, 2);
  assert.ok(record.appliedStudyOperations.includes(`diagnostic:exam-a:same-id:${question.canonicalConceptIds[0]}`));
  assert.ok(record.appliedStudyOperations.includes(`diagnostic:exam-b:same-id:${question.canonicalConceptIds[0]}`));
});

test('diagnostic completion retry repairs idempotent completion and mastery events', async () => {
  class FailCompletionEventOnce extends MemoryStore {
    fail = false;
    async put(namespace, collection, id, value) {
      if (this.fail && collection === 'events' && value?.type === 'diagnostic_completed') {
        this.fail = false;
        throw new Error('injected diagnostic event write failure');
      }
      return super.put(namespace, collection, id, value);
    }
  }
  const store = new FailCompletionEventOnce();
  const engine = new DiagnosticEngine(store, { initialQuestionsPerConcept: 1, maxQuestionsPerConcept: 1 });
  const run = await engine.start({ examId, assessmentRunId: 'assessment-events', questions: [question] });
  await engine.answer({ examId, assessmentRunId: run.assessmentRunId, questionId: question.id,
    canonicalConceptIds: question.canonicalConceptIds, correct: true, answeredAt: stamp });

  store.fail = true;
  await assert.rejects(engine.complete({ examId, assessmentRunId: run.assessmentRunId, completedAt: stamp }),
    /injected diagnostic event write failure/);
  assert.equal((await engine.getRun(examId, run.assessmentRunId)).status, 'completed');
  assert.equal((await store.query(examId, 'events')).some(event => event.type === 'diagnostic_completed'), false);

  await engine.complete({ examId, assessmentRunId: run.assessmentRunId, completedAt: stamp });
  await engine.complete({ examId, assessmentRunId: run.assessmentRunId, completedAt: stamp });
  const events = await store.query(examId, 'events');
  assert.equal(events.filter(event => event.type === 'diagnostic_completed').length, 1);
  assert.equal(events.filter(event => event.type === 'mastery_updated' && event.entityId === question.canonicalConceptIds[0]).length, 1);
});
