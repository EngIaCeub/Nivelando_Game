// Loaded in a routed blank page; all service imports come from the O3 git tag.
export async function seedO3({ base, dbVersion = 2 }) {
  const { IndexedDbStore, EventLog } = await import(`${base}storage.js`);
  const { ScoringEngine } = await import(`${base}scoring.js`);
  const { MasteryStore } = await import(`${base}mastery.js`);
  const { RevisionEngine } = await import(`${base}revision.js`);
  const { GamificationEngine } = await import(`${base}gamification.js`);
  const { TodayPlanEngine } = await import(`${base}today-planner.js`);
  const { DiagnosticEngine } = await import(`${base}diagnostics.js`);
  const [manifest, curriculum, questions, resources] = await Promise.all(['manifest', 'curriculum', 'questions', 'resources'].map(name => fetch(`${base}pack/${name}.json`).then(r => r.json())));
  const examId = manifest.examId;
  const store = new IndexedDbStore({ name: 'studyos-tce-go-ti-2026-v2', version: dbVersion });
  const timestamp = '2026-09-25T12:00:00.000Z';
  const scoring = new ScoringEngine(store);
  await scoring.submitAnswer({ examId, simulationRunId: 'o3::historical-run', questionId: questions[0].id, correct: false, timestamp });
  await scoring.submitAnswer({ examId, simulationRunId: 'o3::historical-run', questionId: questions[0].id, correct: true, timestamp });
  const diagnostic = new DiagnosticEngine(store);
  const run = await diagnostic.start({ examId, questions: questions.slice(0, 3), assessmentRunId: 'o3-diagnostic' });
  const first = questions.find(q => q.id === run.questionIds[0]);
  await diagnostic.answer({ examId, assessmentRunId: run.assessmentRunId, questionId: first.id, canonicalConceptIds: first.canonicalConceptIds, correct: false, answeredAt: timestamp });
  await new MasteryStore(store).put({ canonicalConceptId: first.canonicalConceptIds[0], masteryEstimate: .375, confidence: .55, source: 'o3-browser-fixture', assessedAt: timestamp, questionCount: 3, firstTryCorrect: 1, firstTryWrong: 2, reviewStatus: 'needs-review' });
  const topicId = first.topicIds[0];
  await new RevisionEngine(store).review({ examId, topicId, quality: 2, reviewedAt: timestamp });
  const planner = new TodayPlanEngine(store);
  const plan = await planner.generate({ examId, date: '2026-09-25', availableMinutes: 60, curriculum, questions, resources, now: timestamp, examDate: manifest.examDate });
  await planner.startActivity({ examId, date: plan.date, activityId: plan.activities[0].activityId, timestamp });
  await planner.completeActivity({ examId, date: plan.date, activityId: plan.activities[0].activityId, timestamp });
  const event = { eventId: 'o3-event::compound', type: 'question_answered', timestamp, examId, entityId: first.id, payload: { correct: false }, schemaVersion: 1 };
  await new EventLog(store).append(event);
  await new GamificationEngine(store).awardForEvent(event);
  await store.put(examId, 'progress', 'o3-progress', { id: 'o3-progress', topicId, mastery: .375 });
  localStorage.setItem(`studyos-daily-minutes:${examId}`, '60');
  return { examId, dbVersion, questionId: first.id, topicId };
}
