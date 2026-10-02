function assertCurriculum(curriculum) {
  if (!curriculum || typeof curriculum.examId !== 'string' || !Array.isArray(curriculum.disciplines)) {
    throw new TypeError('invalid curriculum');
  }
}

export function flattenTopics(curriculum) {
  assertCurriculum(curriculum);
  return curriculum.disciplines.flatMap((discipline) =>
    discipline.modules.flatMap((module) => module.topics.map((topic) => ({
      ...topic,
      disciplineId: discipline.id,
      disciplineTitle: discipline.title,
      moduleId: module.id,
      moduleTitle: module.title,
      weight: discipline.weight ?? 1,
      priority: topic.priority ?? 1,
      estimatedMinutes: topic.estimatedMinutes ?? 30
    })))
  );
}

function topicMastery(topic, masteryByConcept = {}) {
  const records = topic.canonicalConceptIds.map((id) => masteryByConcept[id]).filter(Boolean);
  if (records.length === 0) return { mastery: 0, confidence: 0 };
  return {
    mastery: records.reduce((sum, record) => sum + Number(record.masteryEstimate ?? 0), 0) / records.length,
    confidence: records.reduce((sum, record) => sum + Number(record.confidence ?? 0), 0) / records.length
  };
}

export function explainPriority({ topicId, curriculum, masteryByConcept = {}, revisions = [], examDate = null, now = new Date().toISOString(), recentPerformance = {} }) {
  const topic = flattenTopics(curriculum).find((candidate) => candidate.id === topicId);
  if (!topic) throw new Error(`unknown topic: ${topicId}`);
  const { mastery, confidence } = topicMastery(topic, masteryByConcept);
  const overdueReviews = revisions.filter((revision) => revision.topicId === topicId && Date.parse(revision.dueAt) <= Date.parse(now)).length;
  const daysToExam = examDate ? Math.max(0, Math.ceil((Date.parse(examDate) - Date.parse(now)) / 86400000)) : null;
  const recent = recentPerformance[topicId] == null ? null : Number(recentPerformance[topicId]);
  const factors = [`domínio estimado: ${Math.round(mastery * 100)}%`, `confiança: ${Math.round(confidence * 100)}%`];
  if (overdueReviews > 0) factors.push(`${overdueReviews} revisão(ões) vencida(s)`);
  if (daysToExam != null) factors.push(`prova em ${daysToExam} dias`);
  if (recent != null) factors.push(`desempenho recente: ${Math.round(recent * 100)}%`);
  const score = Math.max(0.25, topic.priority * topic.weight * (0.5 + (1 - mastery) * 0.8 + (1 - confidence) * 0.2) + overdueReviews * 0.2 + (recent == null ? 0 : 1 - recent));
  return { topicId, score: Number(score.toFixed(4)), mastery, confidence, overdueReviews, daysToExam, factors, explanation: `Prioridade ${score >= 2 ? 'alta' : score >= 1 ? 'média' : 'baixa'} porque: ${factors.join('; ')}.` };
}

export function createStudyPlan({ curriculum, availableMinutes, completedTopicIds = [], today = new Date().toISOString().slice(0, 10), masteryByConcept = {}, revisions = [], examDate = null, now = new Date().toISOString(), recentPerformance = {} }) {
  assertCurriculum(curriculum);
  if (!Number.isFinite(availableMinutes) || availableMinutes < 0) throw new RangeError('availableMinutes must be non-negative');
  const completed = new Set(completedTopicIds);
  const candidates = flattenTopics(curriculum)
    .filter((topic) => !completed.has(topic.id))
    .map((topic) => ({ ...topic, priorityExplanation: explainPriority({ topicId: topic.id, curriculum, masteryByConcept, revisions, examDate, now, recentPerformance }) }))
    .sort((a, b) => b.priorityExplanation.score - a.priorityExplanation.score || a.id.localeCompare(b.id));
  const activities = [];
  let remaining = availableMinutes;
  for (const topic of candidates) {
    if (remaining <= 0) break;
    const minutes = Math.min(topic.estimatedMinutes, remaining);
    activities.push({
      id: `study-${topic.id}`,
      type: 'study',
      date: today,
      topicId: topic.id,
      disciplineId: topic.disciplineId,
      minutes,
      reason: 'priority',
      priorityScore: topic.priorityExplanation.score,
      priorityExplanation: topic.priorityExplanation.explanation
    });
    remaining -= minutes;
  }
  return { examId: curriculum.examId, date: today, availableMinutes, activities };
}

export function navigationTree(curriculum) {
  assertCurriculum(curriculum);
  return curriculum.disciplines.map((discipline) => ({
    id: discipline.id,
    title: discipline.title,
    modules: discipline.modules.map((module) => ({
      id: module.id,
      title: module.title,
      topics: module.topics.map(({ id, title, canonicalConceptIds }) => ({ id, title, canonicalConceptIds }))
    }))
  }));
}
