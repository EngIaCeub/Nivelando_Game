import assert from 'node:assert/strict';
import { test } from 'node:test';
import { MemoryStore, EventLog } from '../src/storage.js';
import { DiagnosticEngine } from '../src/diagnostics.js';
import { MasteryStore } from '../src/mastery.js';
import { createStudyPlan, explainPriority } from '../src/curriculum.js';
import { ScoringEngine } from '../src/scoring.js';

const TCE_ID = ['tce', 'go', 'ti', '2026'].join('-');
const TJTO_ID = ['tjto', 'tecnico', 'administrativo', '2022'].join('-');

function curriculum(examId = 'exam-a') {
  return { examId, disciplines: [{ id: 'd', title: 'D', weight: 2, modules: [{ id: 'm', title: 'M', topics: [{ id: 'topic-x', title: 'X', canonicalConceptIds: ['concept.x'], estimatedMinutes: 30, priority: 1 }, { id: 'topic-y', title: 'Y', canonicalConceptIds: ['concept.y'], estimatedMinutes: 30, priority: 1 }] }] }] };
}

function questions() {
  return [
    ...[true, true, true, false, false].map((correct, index) => ({ id: `x-${index + 1}`, canonicalConceptIds: ['concept.x'], correct })),
    ...[false, false, false, true, true].map((correct, index) => ({ id: `y-${index + 1}`, canonicalConceptIds: ['concept.y'], correct }))
  ];
}

async function answerInitial(engine, run, concept, questionList, answers) {
  for (const question of run.questionIds) {
    const q = questionList.find((item) => item.id === question);
    if (q.canonicalConceptIds.includes(concept)) await engine.answer({ examId: run.examId, assessmentRunId: run.assessmentRunId, questionId: q.id, canonicalConceptIds: q.canonicalConceptIds, correct: answers.shift() });
  }
}

test('O1: diagnóstico completo combina questões, mastery global e autoavaliação subordinada', async () => {
  const store = new MemoryStore();
  const engine = new DiagnosticEngine(store, { initialQuestionsPerConcept: 3, maxQuestionsPerConcept: 5 });
  const qs = questions();
  const run = await engine.start({ examId: 'exam-a', assessmentRunId: 'run-a', questions: qs });
  assert.equal(run.status, 'in_progress');
  await answerInitial(engine, run, 'concept.x', qs, [true, true, true]);
  const active = await engine.getRun('exam-a', 'run-a');
  for (const questionId of active.questionIds) {
    const q = qs.find((item) => item.id === questionId);
    if (q.canonicalConceptIds.includes('concept.y')) await engine.answer({ examId: 'exam-a', assessmentRunId: 'run-a', questionId, canonicalConceptIds: q.canonicalConceptIds, correct: false, selfAssessment: .9 });
  }
  let expanded = await engine.getRun('exam-a', 'run-a');
  while (expanded.questionIds.some((questionId) => !expanded.responses.some((response) => response.questionId === questionId))) {
    const questionId = expanded.questionIds.find((candidate) => !expanded.responses.some((response) => response.questionId === candidate));
    const q = qs.find((item) => item.id === questionId);
    await engine.answer({ examId: 'exam-a', assessmentRunId: 'run-a', questionId, canonicalConceptIds: q.canonicalConceptIds, correct: false, selfAssessment: .9 });
    expanded = await engine.getRun('exam-a', 'run-a');
  }
  const result = await engine.complete({ examId: 'exam-a', assessmentRunId: 'run-a' });
  const x = result.mastery.find((record) => record.canonicalConceptId === 'concept.x');
  const y = result.mastery.find((record) => record.canonicalConceptId === 'concept.y');
  assert.ok(x.masteryEstimate > y.masteryEstimate);
  assert.ok(y.masteryEstimate < .6, 'autoavaliação não pode superar a evidência negativa');
  assert.equal((await new MasteryStore(store).get('concept.x')).schemaVersion, 1);
  assert.equal((await store.query('exam-a', 'scores')).length, 0);
});

test('O1: amostragem progressiva é determinística, reduz alto desempenho e amplia baixo/inconsistente', async () => {
  const qs = questions();
  const highStore = new MemoryStore();
  const high = new DiagnosticEngine(highStore, { initialQuestionsPerConcept: 3, maxQuestionsPerConcept: 5 });
  const highRun = await high.start({ examId: 'high', assessmentRunId: 'same', questions: qs });
  const highInitial = [...highRun.questionIds];
  for (const id of highInitial.filter((value) => value.startsWith('x-'))) await high.answer({ examId:'high', assessmentRunId:'same', questionId:id, canonicalConceptIds:['concept.x'], correct:true });
  assert.equal((await high.getRun('high','same')).questionIds.filter((id) => id.startsWith('x-')).length, 3);
  const lowStore = new MemoryStore();
  const low = new DiagnosticEngine(lowStore, { initialQuestionsPerConcept: 3, maxQuestionsPerConcept: 5 });
  const lowRun = await low.start({ examId:'low', assessmentRunId:'same', questions:qs });
  for (const id of lowRun.questionIds.filter((value) => value.startsWith('y-'))) await low.answer({ examId:'low', assessmentRunId:'same', questionId:id, canonicalConceptIds:['concept.y'], correct:false });
  assert.ok((await low.getRun('low','same')).questionIds.filter((id) => id.startsWith('y-')).length > 3);
  assert.deepEqual(highInitial, (await new DiagnosticEngine(new MemoryStore(), { initialQuestionsPerConcept:3 }).start({ examId:'other', assessmentRunId:'same', questions:qs })).questionIds);
});

test('O1: diagnóstico interrompido retoma, reiniciar cria assessmentRun novo e eventos são idempotentes', async () => {
  const store = new MemoryStore();
  const first = new DiagnosticEngine(store, { initialQuestionsPerConcept: 3 });
  const run = await first.start({ examId:'exam-a', assessmentRunId:'run-1', questions:questions() });
  const id = run.questionIds[0];
  await first.answer({ examId:'exam-a', assessmentRunId:'run-1', questionId:id, canonicalConceptIds:['concept.x'], correct:true });
  const resumed = new DiagnosticEngine(store, { initialQuestionsPerConcept:3 });
  assert.equal((await resumed.getRun('exam-a','run-1')).responses.length, 1);
  const restarted = await resumed.restart({ examId:'exam-a', questions:questions() });
  assert.notEqual(restarted.assessmentRunId, 'run-1');
  const events = new EventLog(store);
  const event = { eventId:'diagnostic-event', type:'diagnostic_answered', timestamp:'2026-10-02', examId:'exam-a', entityId:'run-1', payload:{}, schemaVersion:1 };
  assert.equal((await events.append(event)).appended, true);
  assert.equal((await events.append(event)).appended, false);
  assert.equal((await resumed.recordPlanRebalanced({ examId:'exam-a', planId:'plan-1', topicIds:['topic-x'] })).appended, true);
});

test('O1: mastery compartilhado é global, mas score e progresso permanecem isolados', async () => {
  const store = new MemoryStore();
  const engine = new DiagnosticEngine(store, { initialQuestionsPerConcept: 3 });
  const qs = questions().filter((question) => question.canonicalConceptIds.includes('concept.x'));
  const run = await engine.start({ examId:TCE_ID, assessmentRunId:'run-a', questions:qs });
  for (const id of run.questionIds) await engine.answer({ examId:TCE_ID, assessmentRunId:'run-a', questionId:id, canonicalConceptIds:['concept.x'], correct:true });
  await engine.complete({ examId:TCE_ID, assessmentRunId:'run-a' });
  assert.ok((await new MasteryStore(store).get('concept.x')).masteryEstimate > 0);
  assert.equal(await store.get(TJTO_ID,'progress','topic-x'), undefined);
  const scoring = new ScoringEngine(store);
  assert.equal(await scoring.getScore(TJTO_ID,'run-a'), null);
  const exported = await engine.exportExam(TCE_ID);
  const imported = new MemoryStore();
  await new DiagnosticEngine(imported).importExam(TCE_ID, exported);
  assert.ok(await new MasteryStore(imported).get('concept.x'));
});

test('O1: planner adaptativo e explainPriority são explicáveis e não eliminam domínio alto', async () => {
  const c = curriculum();
  const mastery = { 'concept.x': { masteryEstimate:.95, confidence:.9 }, 'concept.y': { masteryEstimate:.1, confidence:.4 } };
  const explanation = explainPriority({ topicId:'topic-y', curriculum:c, masteryByConcept:mastery, examDate:'2026-12-31', now:'2026-10-02' });
  assert.match(explanation.explanation, /domínio estimado/);
  const plan = createStudyPlan({ curriculum:c, availableMinutes:60, masteryByConcept:mastery, examDate:'2026-12-31', now:'2026-10-02' });
  assert.ok(plan.activities.some((activity) => activity.topicId === 'topic-x'));
  assert.equal(plan.activities[0].topicId, 'topic-y');
  assert.equal(plan.activities[0].priorityExplanation, explainPriority({ topicId:'topic-y', curriculum:c, masteryByConcept:mastery, examDate:'2026-12-31', now:'2026-10-02' }).explanation);
});

test('O1: diagnóstico sem questões suficientes e import/export versionado não corrompem estado', async () => {
  const store = new MemoryStore();
  const engine = new DiagnosticEngine(store, { initialQuestionsPerConcept:3, maxQuestionsPerConcept:3 });
  const run = await engine.start({ examId:'sparse', assessmentRunId:'run', questions:[{id:'only',canonicalConceptIds:['only'],correct:true}] });
  await engine.answer({ examId:'sparse', assessmentRunId:'run', questionId:'only', canonicalConceptIds:['only'], correct:true });
  const result = await engine.complete({ examId:'sparse', assessmentRunId:'run' });
  assert.equal(result.mastery.length, 1);
  await assert.rejects(() => engine.importExam('sparse', { version:99, examId:'sparse' }));
});
