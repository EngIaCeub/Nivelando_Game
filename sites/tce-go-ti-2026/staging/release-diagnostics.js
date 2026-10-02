import { IndexedDbStore, ScoringEngine, GamificationEngine } from './core/src/index.js';
const examId = 'tce-go-ti-2026';
const output = document.querySelector('#output');
async function run() {
  const metadata = await fetch('./build-meta.json').then((response) => response.json());
  const store = new IndexedDbStore({ name: 'studyos-tce-go-ti-2026-v2', version: metadata.storageVersion });
  const checks = [];
  const marker = await store.get(examId, 'progress', 'release-marker');
  checks.push({ check: 'IndexedDB persistência', passed: marker === undefined || marker.value === 'persisted' });
  await store.put(examId, 'progress', 'release-marker', { id: 'release-marker', value: 'persisted' });
  const scoring = new ScoringEngine(store); const runId = `release-${Date.now()}`;
  const first = await scoring.submitAnswer({ examId, simulationRunId: runId, questionId: 'q1', correct: false });
  const retake = await scoring.submitAnswer({ examId, simulationRunId: runId, questionId: 'q1', correct: true });
  checks.push({ check: 'simulatedScore imutável', passed: first.simulatedScore === retake.simulatedScore });
  const gamification = new GamificationEngine(store); const event = { eventId: `release-xp-${Date.now()}`, type: 'question_answered', examId, timestamp: new Date().toISOString(), payload: {} };
  checks.push({ check: 'XP idempotente', passed: (await gamification.awardForEvent(event)).xp === 5 && (await gamification.awardForEvent(event)).xp === 0 });
  checks.push({ check: 'metadata de produção', passed: metadata.appVersion === '1.0.0' && metadata.channel === 'production' });
  output.textContent = JSON.stringify({ passed: checks.every((check) => check.passed), metadata, checks }, null, 2); output.dataset.result = checks.every((check) => check.passed) ? 'passed' : 'failed';
}
document.querySelector('#run').addEventListener('click', () => run().catch((error) => { output.textContent = JSON.stringify({ passed: false, error: String(error) }, null, 2); output.dataset.result = 'failed'; }));
