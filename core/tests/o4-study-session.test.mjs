import assert from 'node:assert/strict';
import { test } from 'node:test';
import { StudySession, lazyQuestions, selectSimulationQuestions } from '../src/study-ui.js';
import { MemoryStore } from '../src/storage.js';
import { MasteryStore } from '../src/mastery.js';
import { exportProductionBackup, restoreProductionBackup } from '../src/production.js';

const examId = 'exam-generic';
const questions = [1, 2].map(n => ({ id: 'q' + n, topicIds: ['topic'], canonicalConceptIds: ['concept'], stem: 'Question ' + n, options: [{ id: 'a', text: 'Wrong' }, { id: 'b', text: 'Correct' }], correctOptionId: 'b', explanation: 'Explanation', provenance: { status: 'derived', source: 'Original' } }));
const metadata = { appVersion: '1.0.0', storageVersion: 1 };

test('O4 study: wrong answer, reload, retake, mastery and immutable historical score/XP', async () => {
  const store = new MemoryStore(); let engine = new StudySession(store, examId);
  await engine.start({ id: 'run', kind: 'simulation', title: 'Pool', questions }); await engine.resume('run');
  await engine.answer('run', questions[0], 'a');
  const first = await engine.scoring.getFirstAttempt(examId, 'run', 'q1');
  await engine.pause('run'); engine = new StudySession(store, examId);
  const resumed = await engine.resume('run'); assert.equal(resumed.responses.length, 1); assert.equal(resumed.cursor, 0);
  const xp = await engine.xp.total(examId);
  await engine.answer('run', questions[0], 'b', { retake: true });
  assert.deepEqual(await engine.scoring.getFirstAttempt(examId, 'run', 'q1'), first);
  assert.equal(await engine.scoring.getScore(examId, 'run'), 0); assert.equal(await engine.xp.total(examId), xp);
  const mastery = await new MasteryStore(store).get('concept');
  assert.ok(mastery.masteryEstimate > 0); assert.equal(mastery.firstTryCorrect, 0); assert.equal(mastery.firstTryWrong, 1);
  await engine.next('run'); await engine.answer('run', questions[1], 'b'); await engine.next('run');
  await engine.finish('run'); const completedXp = await engine.xp.total(examId); await engine.finish('run');
  assert.equal(await engine.xp.total(examId), completedXp); assert.equal(await engine.scoring.getScore(examId, 'run'), 50);
  const payload = await exportProductionBackup(store, examId, metadata, { dailyMinutes: 90, onboardingSkipped: true });
  const restored = new MemoryStore(); const result = await restoreProductionBackup(restored, payload, { examId, metadata, currentSettings: {} });
  engine = new StudySession(restored, examId);
  assert.equal(await engine.scoring.getScore(examId, 'run'), 50); assert.equal(await engine.xp.total(examId), completedXp);
  assert.equal((await engine.resume('run')).status, 'completed'); assert.equal(result.settings.dailyMinutes, 90);
});

test('O4 study: diagnostic resumes and never writes scores or XP', async () => {
  const store = new MemoryStore(); let engine = new StudySession(store, examId);
  await engine.start({ id: 'diagnosis', kind: 'diagnostic', questions }); await engine.resume('diagnosis');
  await engine.answer('diagnosis', questions[0], 'b'); await engine.next('diagnosis'); await engine.pause('diagnosis');
  engine = new StudySession(store, examId); assert.equal((await engine.resume('diagnosis')).cursor, 1);
  await engine.answer('diagnosis', questions[1], 'b'); await engine.next('diagnosis'); await engine.finish('diagnosis'); await engine.finish('diagnosis');
  assert.equal((await store.query(examId, 'scores')).length, 0); assert.equal(await engine.xp.total(examId), 0);
  assert.equal((await engine.diagnostics.getRun(examId, 'diagnosis')).status, 'completed');
});

test('O4 study: flashcards require reveal and persist review without simulated score', async () => {
  const store = new MemoryStore(); const engine = new StudySession(store, examId);
  const card = { id: 'card', front: 'Front', back: 'Back', topicIds: ['topic'], canonicalConceptIds: ['concept'] };
  await engine.start({ id: 'cards', kind: 'flashcards', cards: [card] }); await engine.resume('cards');
  await assert.rejects(engine.answer('cards', card, null, { quality: 4 }), /Revele/);
  await engine.reveal('cards', card.id); await engine.pause('cards');
  const resumed = await new StudySession(store, examId).resume('cards'); assert.deepEqual(resumed.revealedIds, ['card']);
  await engine.answer('cards', card, null, { quality: 4 }); await engine.next('cards'); await engine.finish('cards');
  assert.equal((await store.query(examId, 'revisions')).length, 1); assert.equal((await store.query(examId, 'scores')).length, 0);
  assert.equal((await new MasteryStore(store).get('concept')).firstTryCorrect, 0);
});

test('O4 study: interrupted save retains durable pending intent and retries effects once', async () => {
  class FailingStore extends MemoryStore {
    fail = false;
    async put(namespace, collection, id, value) {
      if (this.fail && collection === 'xp-awards') { this.fail = false; throw new Error('disk full'); }
      return super.put(namespace, collection, id, value);
    }
  }
  const store = new FailingStore(); let engine = new StudySession(store, examId);
  await engine.start({ id: 'run', questions: [questions[0]] }); await engine.resume('run'); store.fail = true;
  await assert.rejects(engine.answer('run', questions[0], 'b'), /disk full/);
  assert.ok((await engine.get('run')).pending); const mastery = await engine.mastery.get('concept'); const review = await engine.revisions.get(examId, 'topic');
  engine = new StudySession(store, examId); const recovered = await engine.resume('run');
  assert.equal(recovered.pending, undefined); assert.equal(recovered.responses.length, 1);
  assert.deepEqual(await engine.mastery.get('concept'), mastery); assert.deepEqual(await engine.revisions.get(examId, 'topic'), review);
  assert.equal(await engine.xp.total(examId), 5); assert.equal((await store.query(examId, 'scores')).length, 1);
});

test('O4 study: replay merges a failed answer into mastery and revision written by another session', async () => {
  class FailBeforeMasteryStore extends MemoryStore {
    failMastery = false;
    async update(namespace, collection, id, updater) {
      if (this.failMastery && namespace === '__studyos_global__' && collection === 'mastery') {
        this.failMastery = false;
        throw new Error('injected failure after score');
      }
      return super.update(namespace, collection, id, updater);
    }
  }
  const store = new FailBeforeMasteryStore();
  const first = new StudySession(store, examId);
  await first.start({ id: 'session-a', questions: [questions[0]] }); await first.resume('session-a');
  store.failMastery = true;
  await assert.rejects(first.answer('session-a', questions[0], 'a'), /injected failure/);
  const durablePending = (await first.get('session-a')).pending;
  assert.equal(durablePending.response.correct, false);
  assert.equal((await first.scoring.getFirstAttempt(examId, 'session-a', 'q1')).correct, false);

  const second = new StudySession(store, examId);
  await second.start({ id: 'session-b', questions: [questions[0]] }); await second.resume('session-b');
  await second.answer('session-b', questions[0], 'b');
  const afterB = await second.mastery.get('concept');
  const reviewAfterB = await second.revisions.get(examId, 'topic');
  assert.equal(afterB.questionCount, 1);
  assert.equal(reviewAfterB.history.length, 1);

  const resumed = await new StudySession(store, examId).resume('session-a');
  assert.equal(resumed.pending, undefined);
  const mastery = await first.mastery.get('concept');
  const review = await first.revisions.get(examId, 'topic');
  assert.equal(mastery.questionCount, 2);
  assert.equal(mastery.firstTryCorrect, 1);
  assert.equal(mastery.firstTryWrong, 1);
  assert.equal(mastery.masteryEstimate, .25);
  assert.equal(review.history.length, 2);
  assert.deepEqual(review.history.map(({ quality }) => quality), [4, 2]);
  assert.equal(new Set(review.history.map(({ operationId }) => operationId)).size, 2);
  assert.equal((await first.scoring.getFirstAttempt(examId, 'session-a', 'q1')).correct, false);
  assert.equal(await first.scoring.getScore(examId, 'session-a'), 0);

  // Re-entering the replay path cannot increment either record a second time.
  await first.applyAnswerEffects({ item: durablePending.item, response: durablePending.response, operationId: durablePending.operationId, firstAttempt: true });
  assert.equal((await first.mastery.get('concept')).questionCount, 2);
  assert.equal((await first.revisions.get(examId, 'topic')).history.length, 2);
});

test('O4 study: repeat practice of the same item on the same day does not farm XP', async () => {
  const store = new MemoryStore(); const engine = new StudySession(store, examId);
  for (const id of ['one', 'two']) {
    await engine.start({ id, questions: [questions[0]] }); await engine.resume(id); await engine.answer(id, questions[0], 'b'); await engine.next(id); await engine.finish(id);
  }
  assert.equal(await engine.xp.total(examId), 5);
});

test('O4 study: legacy pending effects use the session id to avoid cross-session collisions', async () => {
  const store = new MemoryStore();
  const engine = new StudySession(store, examId);
  const response = { itemId: 'q1', correct: true, retake: false, timestamp: '2026-10-04T12:00:00.000Z' };
  for (const runId of ['legacy-a', 'legacy-b']) {
    await engine.applyAnswerEffects({ item: questions[0], response, runId, firstAttempt: true });
  }
  const mastery = await engine.mastery.get('concept');
  const review = await engine.revisions.get(examId, 'topic');
  assert.equal(mastery.questionCount, 2);
  assert.equal(mastery.firstTryCorrect, 2);
  assert.equal(review.history.length, 2);
  assert.equal(new Set(review.history.map(({ operationId }) => operationId)).size, 2);
});

test('O4 study: lazy bank caches concurrent loads and retries failed loads; pools are stable', async () => {
  let calls = 0;
  const ensure = lazyQuestions(async () => { calls++; if (calls === 1) throw new Error('offline'); return questions; });
  await assert.rejects(ensure(), /offline/); const [one, two] = await Promise.all([ensure(), ensure()]);
  assert.equal(calls, 2); assert.equal(one, two);
  assert.deepEqual(selectSimulationQuestions({ questionIds: ['q2', 'q1'] }, questions).map(q => q.id), ['q2', 'q1']);
  assert.throws(() => selectSimulationQuestions({ questionIds: ['missing'] }, questions), /Pool/);
});
