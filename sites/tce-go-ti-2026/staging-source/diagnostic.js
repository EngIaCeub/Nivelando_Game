import { IndexedDbStore } from './core/src/storage.js';
import { DiagnosticEngine } from './core/src/diagnostics.js';
import { DiagnosticUI } from './core/src/diagnostic-ui.js';
import { MasteryStore } from './core/src/mastery.js';
import { createStudyPlan, explainPriority } from './core/src/curriculum.js';

const examId = 'tce-go-ti-2026';
const root = document.querySelector('#diagnostic-app');
const questions = await fetch('./exam-pack/questions.json').then((response) => response.json());
const curriculum = await fetch('./exam-pack/curriculum.json').then((response) => response.json());
const store = new IndexedDbStore({ name: 'studyos-staging-tce-go-ti-2026-v1', version: 1 });
const engine = new DiagnosticEngine(store);
const runKey = 'studyos-staging-assessment-run';
const existingRunId = localStorage.getItem(runKey);
const existingRun = existingRunId ? await engine.getRun(examId, existingRunId) : null;
const onComplete = async ({ mastery }) => {
  const masteryByConcept = Object.fromEntries((await new MasteryStore(store).list()).map((record) => [record.canonicalConceptId, record]));
  const plan = createStudyPlan({ curriculum, availableMinutes: 120, masteryByConcept, examDate: '2027-01-17' });
  const explanation = plan.activities[0] ? explainPriority({ topicId: plan.activities[0].topicId, curriculum, masteryByConcept, examDate: '2027-01-17' }) : null;
  const summary = document.createElement('p');
  summary.textContent = `Plano recalculado: ${plan.activities.length} atividade(s). ${explanation?.explanation ?? ''}`;
  root.append(summary);
};
const ui = new DiagnosticUI({ root, engine, examId, questions, onComplete });
if (existingRun?.status === 'in_progress') await ui.resume(existingRun.assessmentRunId);
else {
  const run = await engine.start({ examId, questions, assessmentRunId: existingRunId ?? undefined });
  localStorage.setItem(runKey, run.assessmentRunId);
  await ui.resume(run.assessmentRunId);
}
