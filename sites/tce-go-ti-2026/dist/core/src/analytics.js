function ratio(numerator, denominator) { return denominator === 0 ? null : numerator / denominator; }

export function calculateAnalytics({ curriculum, events = [], firstAttempts = [], revisions = [], now = new Date().toISOString() }) {
  const topicIds = curriculum.disciplines.flatMap((discipline) => discipline.modules.flatMap((module) => module.topics.map((topic) => topic.id)));
  const completed = new Set(events.filter((event) => event.type === 'topic_completed').map((event) => event.entityId));
  const correct = firstAttempts.filter((attempt) => attempt.correct).length;
  const reviewed = revisions.flatMap((revision) => revision.history ?? []);
  const retained = reviewed.filter((review) => review.quality >= 3).length;
  const activeDays = new Set(events.filter((event) => event.type !== 'reload').map((event) => String(event.timestamp).slice(0, 10))).size;
  const due = revisions.filter((revision) => Date.parse(revision.dueAt) <= Date.parse(now)).length;
  const averageMastery = revisions.length === 0 ? null : revisions.reduce((sum, revision) => sum + revision.mastery, 0) / revisions.length;

  return {
    coverage: { completedTopics: completed.size, totalTopics: topicIds.length, rate: ratio(completed.size, topicIds.length) },
    firstTryAccuracy: { correct, answered: firstAttempts.length, rate: ratio(correct, firstAttempts.length) },
    mastery: { topics: revisions.length, average: averageMastery },
    retention: { successfulReviews: retained, reviews: reviewed.length, rate: ratio(retained, reviewed.length) },
    pace: { activeDays, completedTopics: completed.size, topicsPerActiveDay: ratio(completed.size, activeDays) },
    forecast: { dueReviews: due, projectedCoverage: ratio(completed.size, topicIds.length) }
  };
}
