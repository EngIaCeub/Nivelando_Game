import { IndexedDbStore } from './core/src/storage.js';
import { ScoringEngine } from './core/src/scoring.js';
import { GamificationEngine } from './core/src/gamification.js';

const examId = 'tce-go-ti-2026';
const otherExamId = 'release-isolation-check';
const database = 'studyos-tce-go-f10-diagnostics';
const output = document.querySelector('#output');

async function run() {
  const store = new IndexedDbStore({ name: database, version: 1 });
  const checks = [];
  const marker = await store.get(examId, 'progress', 'reload-marker');
  checks.push({ check: 'IndexedDB após reload', passed: marker?.value === 'persisted' });
  await store.put(examId, 'progress', 'reload-marker', { id: 'reload-marker', value: 'persisted' });

  const scoring = new ScoringEngine(store);
  const runId = `diagnostic-${Date.now()}`;
  const first = await scoring.submitAnswer({ examId, simulationRunId: runId, questionId: 'q1', correct: false });
  const retake = await scoring.submitAnswer({ examId, simulationRunId: runId, questionId: 'q1', correct: true });
  checks.push({ check: 'simulatedScore primeira tentativa', passed: first.firstAttempt && first.simulatedScore === 0 });
  checks.push({ check: 'retake não altera score histórico', passed: !retake.firstAttempt && retake.simulatedScore === 0 });

  const gamification = new GamificationEngine(store);
  const event = { eventId: `diagnostic-xp-${Date.now()}`, type: 'question_answered', examId, timestamp: new Date().toISOString(), payload: {} };
  const award = await gamification.awardForEvent(event);
  const duplicate = await gamification.awardForEvent(event);
  checks.push({ check: 'XP idempotente', passed: award.xp === 5 && duplicate.xp === 0 });

  const exported = await store.export(examId);
  await store.import(otherExamId, { ...exported, examId: otherExamId });
  const imported = await store.get(otherExamId, 'progress', 'reload-marker');
  const isolated = await store.get('unrelated-exam', 'progress', 'reload-marker');
  checks.push({ check: 'export/import e isolamento por examId', passed: imported?.value === 'persisted' && isolated === undefined });

  const passed = checks.every(({ passed: result }) => result);
  output.textContent = JSON.stringify({ passed, checks }, null, 2);
  output.dataset.result = passed ? 'passed' : 'failed';
}

document.querySelector('#run').addEventListener('click', () => run().catch((error) => {
  output.textContent = JSON.stringify({ passed: false, error: String(error) }, null, 2);
  output.dataset.result = 'failed';
}));
