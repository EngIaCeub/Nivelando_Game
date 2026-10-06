import { EventLog } from './storage.js';
import { GamificationEngine } from './gamification.js';
import { explainPriority, flattenTopics } from './curriculum.js';
import { runMutation } from './mutation-context.js';

export const TODAY_PLAN_SCHEMA_VERSION = 1;
export const TODAY_PLAN_ALGORITHM_VERSION = 'today-v1';
export const ACTIVITY_TYPES = Object.freeze([
  'theory', 'questions', 'review', 'error_review', 'simulation', 'reading', 'diagnostic_check'
]);

const DAY = 86_400_000;
const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const clone = (value) => structuredClone(value);

function dateKey(value = new Date().toISOString()) { return String(value).slice(0, 10); }
function daysUntil(examDate, now) {
  if (!examDate) return null;
  return Math.max(0, Math.ceil((Date.parse(examDate) - Date.parse(now)) / DAY));
}
function masteryFor(topic, masteryByConcept) {
  const records = (topic.canonicalConceptIds ?? []).map((id) => masteryByConcept[id]).filter(Boolean);
  if (!records.length) return { mastery: 0, confidence: 0, studied: false };
  return {
    mastery: records.reduce((sum, record) => sum + Number(record.masteryEstimate ?? 0), 0) / records.length,
    confidence: records.reduce((sum, record) => sum + Number(record.confidence ?? 0), 0) / records.length,
    studied: true
  };
}
function matchesTopic(question, topic) {
  return (question.topicIds ?? []).includes(topic.id) || (question.canonicalConceptIds ?? []).some((id) => (topic.canonicalConceptIds ?? []).includes(id));
}
function activityQuestions(topic, questions, firstAttempts = []) {
  const attempts = new Map(firstAttempts.filter((attempt) => attempt.questionId).map((attempt) => [attempt.questionId, attempt]));
  return questions.filter((question) => matchesTopic(question, topic))
    .sort((a, b) => Number(attempts.get(a.id)?.correct ?? false) - Number(attempts.get(b.id)?.correct ?? false) || a.id.localeCompare(b.id))
    .slice(0, 8).map((question) => question.id);
}

function candidateFor(topic, input) {
  const { mastery, confidence, studied } = masteryFor(topic, input.masteryByConcept ?? {});
  const revisions = (input.revisions ?? []).filter((revision) => revision.topicId === topic.id);
  const overdue = revisions.filter((revision) => Date.parse(revision.dueAt) <= Date.parse(input.now)).length;
  const attempts = (input.firstAttempts ?? []).filter((attempt) => matchesTopic(attempt, topic) || (attempt.topicIds ?? []).includes(topic.id));
  const errors = attempts.filter((attempt) => attempt.correct === false).length;
  const completed = new Set(input.completedTopicIds ?? []);
  const priority = explainPriority({ topicId: topic.id, curriculum: input.curriculum, masteryByConcept: input.masteryByConcept, revisions: input.revisions, examDate: input.examDate, now: input.now, recentPerformance: input.recentPerformance });
  const days = daysUntil(input.examDate, input.now);
  const urgency = days == null ? 0 : clamp(1 - days / 365);
  const importance = Number(topic.weight ?? 1) * Number(topic.priority ?? 1);
  const difficulty = (1 - mastery) * 0.8 + (1 - confidence) * 0.2 + Math.min(errors, 5) * 0.08;
  const retention = overdue > 0 ? Math.min(1, overdue / 3) : (studied ? 0.05 : 0.35);
  const rhythm = completed.has(topic.id) ? 0 : 0.15;
  const dependencyIds = topic.dependencies ?? topic.prerequisiteTopicIds ?? [];
  const missingDependencies = dependencyIds.filter((id) => !completed.has(id));
  const dependency = missingDependencies.length ? 0.2 : 0;
  const score = Number((priority.score + urgency * 0.35 + importance * 0.15 + difficulty + retention * 0.3 + rhythm + dependency).toFixed(4));
  const type = overdue > 0 ? 'review' : errors > 0 ? 'error_review' : mastery < 0.6 || !studied ? 'questions' : 'theory';
  const factors = [...priority.factors];
  if (!studied) factors.push('conteúdo ainda não estudado');
  if (errors > 0) factors.push(`${errors} erro(s) na primeira tentativa`);
  if (missingDependencies.length) factors.push(`depende de ${missingDependencies.length} tópico(s) ainda pendente(s)`);
  factors.push(`importância curricular: ${importance.toFixed(2)}`);
  return { topic, score, type, mastery, confidence, overdue, errors, missingDependencies, questionIds: activityQuestions(topic, input.questions ?? [], input.firstAttempts), factors };
}

function reason(candidate) {
  const label = candidate.type === 'review' ? 'revisão vencida' : candidate.type === 'error_review' ? 'revisão de erros' : candidate.type === 'theory' ? 'manutenção de conteúdo' : 'questões de diagnóstico e prática';
  return `${candidate.topic.title} — ${label}. Prioridade ${candidate.score >= 2 ? 'alta' : candidate.score >= 1 ? 'média' : 'baixa'} porque: ${candidate.factors.join('; ')}.`;
}

function chooseDiverse(candidates, availableMinutes) {
  const selected = [];
  const usedDisciplines = new Set();
  let remaining = availableMinutes;
  const pending = [...candidates];
  while (pending.length && remaining > 0) {
    const index = pending.findIndex((candidate) => !usedDisciplines.has(candidate.topic.disciplineId));
    const candidate = pending.splice(index < 0 ? 0 : index, 1)[0];
    const minutes = Math.min(Math.max(1, Number(candidate.topic.estimatedMinutes ?? 25)), remaining, 30);
    selected.push({ candidate, minutes });
    usedDisciplines.add(candidate.topic.disciplineId);
    remaining -= minutes;
  }
  return selected;
}

export function createTodayPlan({
  examId, date = dateKey(), availableMinutes, curriculum, masteryByConcept = {}, revisions = [], recentPerformance = {}, firstAttempts = [], questions = [], resources = [], completedTopicIds = [], dependencies = {}, examDate = null, now = new Date().toISOString(), algorithmVersion = TODAY_PLAN_ALGORITHM_VERSION
}) {
  if (!examId || !curriculum) throw new TypeError('examId and curriculum are required');
  if (!Number.isFinite(availableMinutes) || availableMinutes < 0) throw new RangeError('availableMinutes must be non-negative');
  const candidates = flattenTopics(curriculum)
    .map((topic) => ({ ...topic, dependencies: dependencies[topic.id] ?? topic.dependencies ?? topic.prerequisiteTopicIds ?? [] }))
    .map((topic) => candidateFor(topic, { examId, curriculum, masteryByConcept, revisions, recentPerformance, firstAttempts, questions, completedTopicIds, examDate, now }));
  const selected = chooseDiverse(candidates.sort((a, b) => b.score - a.score || a.topic.id.localeCompare(b.topic.id)), availableMinutes);
  const planId = `today-${examId}-${date}`;
  const activities = selected.map(({ candidate, minutes }, index) => {
    const resource = resources.find((item) => (item.topicIds ?? []).includes(candidate.topic.id));
    return {
      activityId: `${planId}-activity-${index + 1}`,
      type: candidate.type,
      topicId: candidate.topic.id,
      canonicalConceptIds: [...(candidate.topic.canonicalConceptIds ?? [])],
      estimatedMinutes: minutes,
      priority: candidate.score,
      reason: reason(candidate),
      status: 'planned',
      source: 'today-planner',
      ...(resource ? { resourceId: resource.id } : {}),
      ...(candidate.questionIds.length ? { questionIds: candidate.questionIds } : {}),
      reviewIds: revisions.filter((revision) => revision.topicId === candidate.topic.id && Date.parse(revision.dueAt) <= Date.parse(now)).map((revision) => revision.topicId),
      dependencies: candidate.missingDependencies,
      createdAt: now,
      completedAt: null
    };
  });
  return {
    planId, examId, date, availableMinutes, generatedAt: now, algorithmVersion,
    activities, plannedMinutes: activities.reduce((sum, activity) => sum + activity.estimatedMinutes, 0),
    completedMinutes: 0, status: activities.length ? 'ready' : 'complete',
    reasonSummary: activities.length ? `Agenda determinística com ${activities.length} atividade(s), respeitando ${availableMinutes} minutos.` : 'Nenhuma atividade pendente para este orçamento.'
  };
}

export class TodayPlanEngine {
  #store;
  #events;
  #gamification;
  constructor(store) { this.#store = store; this.#events = new EventLog(store); this.#gamification = new GamificationEngine(store); }
  async get(examId, date = dateKey()) { return this.#store.get(examId, 'today-plans', date); }
  async save(plan, context) {
    return runMutation(this.#store, context, () => this.#store.put(plan.examId, 'today-plans', plan.date, plan));
  }
  async #updatePlan(examId, date, updater) {
    return this.#store.update(examId, 'today-plans', date, updater);
  }
  async generate(input, context) {
    return runMutation(this.#store, context, () => this.#generate(input));
  }
  async #generate(input) {
    const plan = createTodayPlan(input);
    const result = await this.#updatePlan(plan.examId, plan.date, current => current ?? plan);
    const saved = result.value;
    if (!result.previous) await this.#events.append({ eventId: `today-plan-generated:${saved.planId}`, type: 'today_plan_generated', timestamp: saved.generatedAt, examId: saved.examId, entityId: saved.planId, payload: { plannedMinutes: saved.plannedMinutes, activityCount: saved.activities.length }, schemaVersion: 1 });
    return clone(saved);
  }
  async #transition({ examId, date, activityId, status, eventType = null, timestamp = new Date().toISOString(), actualMinutes = null }) {
    if (actualMinutes != null && (!Number.isFinite(actualMinutes) || actualMinutes < 0)) throw new RangeError('actualMinutes must be non-negative');
    const result = await this.#updatePlan(examId, date, current => {
      if (!current) throw new Error('today plan not found');
      const plan = clone(current);
      const activity = plan.activities.find(item => item.activityId === activityId);
      if (!activity) throw new Error('activity not found');
      if (activity.status === 'completed' && status !== 'completed') return undefined;
      if (activity.status === 'completed') {
        timestamp = activity.completedAt;
        actualMinutes = activity.actualMinutes ?? activity.estimatedMinutes;
      } else {
        activity.status = status;
        if (status === 'completed') activity.completedAt = timestamp;
      }
      const minutes = actualMinutes ?? activity.estimatedMinutes;
      if (status === 'completed') activity.actualMinutes = minutes;
      plan.completedMinutes = plan.activities.filter(item => item.status === 'completed').reduce((sum, item) => sum + Number(item.actualMinutes ?? item.estimatedMinutes), 0);
      if (plan.completedMinutes >= plan.availableMinutes || plan.activities.every(item => item.status === 'completed')) plan.status = 'complete';
      else if (status === 'in_progress' || status === 'paused') plan.status = 'active';
      return plan;
    });
    const plan = result.value ?? result.previous;
    if (!plan) throw new Error('today plan not found');
    const activity = plan.activities.find(item => item.activityId === activityId);
    if (activity.status === 'completed' && status !== 'completed') return { plan: clone(plan), activity: clone(activity), state: await this.#store.get(examId, 'activity-state', activityId) };
    const state = { activityId, planId: plan.planId, status: activity.status, estimatedMinutes: activity.estimatedMinutes, actualMinutes: activity.actualMinutes ?? activity.estimatedMinutes, updatedAt: activity.completedAt ?? timestamp };
    await this.#store.put(examId, 'activity-state', activityId, state);
    const type = eventType ?? (status === 'in_progress' ? 'activity_started' : status === 'paused' ? 'activity_paused' : status === 'completed' ? 'activity_completed' : 'activity_resumed');
    const event = { eventId: status === 'completed' ? `${type}:${plan.planId}:${activityId}` : `${type}:${plan.planId}:${activityId}:${timestamp}`, type, timestamp, examId, entityId: activityId, payload: { planId: plan.planId, activityType: activity.type, estimatedMinutes: activity.estimatedMinutes, actualMinutes: state.actualMinutes }, schemaVersion: 1 };
    const appended = await this.#events.append(event);
    if (status === 'completed') {
      // Preserve historical timestamp-keyed awards from older builds too.
      const awards = await this.#store.query(examId, 'xp-awards');
      const legacyPrefix = `${type}:${plan.planId}:${activityId}:`;
      if (!awards.some((award) => award.eventId.startsWith(legacyPrefix))) await this.#gamification.awardForEvent(event);
      if (plan.completedMinutes >= plan.availableMinutes) {
        const goalEvent = { eventId: `daily-goal-completed:${plan.planId}`, type: 'daily_goal_completed', timestamp, examId, entityId: plan.planId, payload: { minutes: plan.completedMinutes }, schemaVersion: 1 };
        const goal = await this.#events.append(goalEvent);
        await this.#gamification.awardForEvent(goal.event);
      }
    }
    return { plan: clone(plan), activity: clone(activity), state, event: appended.event };
  }
  async startActivity(args, context) { return runMutation(this.#store, context, () => this.#transition({ ...args, status: 'in_progress' })); }
  async pauseActivity(args, context) { return runMutation(this.#store, context, () => this.#transition({ ...args, status: 'paused' })); }
  async resumeActivity(args, context) { return runMutation(this.#store, context, () => this.#transition({ ...args, status: 'in_progress', eventType: 'activity_resumed' })); }
  async completeActivity(args, context) { return runMutation(this.#store, context, () => this.#transition({ ...args, status: 'completed' })); }
  async addExtraActivity(args, context) {
    return runMutation(this.#store, context, () => this.#addExtraActivity(args));
  }
  async #addExtraActivity({ examId, date = dateKey(), topicId, minutes = 15, reason = 'Estudo extra solicitado pelo estudante.' }) {
    const createdAt = new Date().toISOString();
    let activity;
    const result = await this.#updatePlan(examId, date, current => {
      if (!current) throw new Error('today plan not found');
      const plan = clone(current);
      const next = plan.activities.filter(item => item.source === 'extra-study').length + 1;
      let activityId = `${plan.planId}-extra-${next}`;
      while (plan.activities.some(item => item.activityId === activityId)) activityId += '-next';
      activity = {
        activityId, type: 'reading', topicId, canonicalConceptIds: [], estimatedMinutes: Math.max(5, Math.round(minutes)),
        priority: 0, reason, status: 'planned', source: 'extra-study', resourceId: null, questionIds: [], reviewIds: [], dependencies: [], createdAt, completedAt: null
      };
      plan.activities.push(activity);
      plan.plannedMinutes += activity.estimatedMinutes;
      if (plan.status !== 'complete') plan.status = 'active';
      return plan;
    });
    if (!result.value) throw new Error('today plan not found');
    await this.#events.append({ eventId: `extra-study:${activity.activityId}`, type: 'extra_study_started', timestamp: activity.createdAt, examId, entityId: activity.activityId, payload: { minutes: activity.estimatedMinutes }, schemaVersion: 1 });
    return clone(result.value);
  }
  async replan(input, context) {
    return runMutation(this.#store, context, () => this.#replan(input));
  }
  async #replan({ ...input }) {
    let remaining = 0;
    const result = await this.#updatePlan(input.examId, input.date, current => {
      const completedMinutes = current?.completedMinutes ?? 0;
      const preserved = (current?.activities ?? []).filter(activity => ['completed', 'in_progress', 'paused'].includes(activity.status) || activity.source === 'extra-study');
      const reservedMinutes = preserved.filter(activity => activity.status !== 'completed').reduce((sum, activity) => sum + activity.estimatedMinutes, 0);
      remaining = Math.max(0, Number(input.availableMinutes) - completedMinutes - reservedMinutes);
      const completedTopicIds = [...new Set([
        ...(input.completedTopicIds ?? []),
        ...(current?.activities ?? []).filter(activity => activity.status === 'completed').map(activity => activity.topicId).filter(Boolean)
      ])];
      const replacement = createTodayPlan({ ...input, availableMinutes: remaining, completedTopicIds });
      replacement.availableMinutes = input.availableMinutes;
      replacement.remainingMinutes = remaining;
      const generation = (current?.replanGeneration ?? 0) + 1;
      replacement.replanGeneration = generation;
      const used = new Set((current?.activities ?? []).map(activity => activity.activityId));
      replacement.activities.forEach((activity, index) => {
        let id = `${replacement.planId}-replan-${generation}-${index + 1}`;
        while (used.has(id)) id += '-next';
        activity.activityId = id; used.add(id);
      });
      if (current) {
        replacement.activities = [...preserved, ...replacement.activities];
        replacement.plannedMinutes = replacement.activities.reduce((sum, activity) => sum + activity.estimatedMinutes, 0);
        replacement.completedMinutes = completedMinutes;
        replacement.status = replacement.activities.some(activity => activity.status !== 'completed') ? 'active' : 'complete';
      }
      return replacement;
    });
    const replacement = result.value;
    await this.#events.append({ eventId: `today-plan-rebalanced:${replacement.planId}:${replacement.generatedAt}`, type: 'today_plan_rebalanced', timestamp: replacement.generatedAt, examId: replacement.examId, entityId: replacement.planId, payload: { remainingMinutes: remaining, completedMinutes: replacement.completedMinutes }, schemaVersion: 1 });
    return clone(replacement);
  }
  async dailySummary(examId, date = dateKey(), dailyGoalMinutes = 120) {
    const plan = await this.get(examId, date);
    const completedMinutes = plan?.completedMinutes ?? 0;
    return { date, examId, plannedMinutes: plan?.plannedMinutes ?? 0, completedMinutes, dailyGoalMinutes, goalRate: dailyGoalMinutes ? completedMinutes / dailyGoalMinutes : 0, goalCompleted: completedMinutes >= dailyGoalMinutes, status: plan?.status ?? 'missing' };
  }
  async weeklySummary(examId, at = dateKey()) {
    const end = Date.parse(`${at}T00:00:00.000Z`);
    const start = end - 6 * DAY;
    const plans = (await this.#store.query(examId, 'today-plans')).filter((plan) => {
      const timestamp = Date.parse(`${plan.date}T00:00:00.000Z`);
      return timestamp >= start && timestamp <= end;
    });
    const activities = plans.flatMap((plan) => plan.activities ?? []);
    return {
      examId, start: new Date(start).toISOString().slice(0, 10), end: at,
      plannedMinutes: plans.reduce((sum, plan) => sum + plan.plannedMinutes, 0),
      completedMinutes: plans.reduce((sum, plan) => sum + plan.completedMinutes, 0),
      questionActivities: activities.filter((activity) => activity.type === 'questions' || activity.type === 'error_review').length,
      reviewActivities: activities.filter((activity) => activity.type === 'review').length,
      topics: [...new Set(activities.map((activity) => activity.topicId).filter(Boolean))]
    };
  }
  async streak(examId, dailyGoalMinutes = 120, threshold = 0.6, at = dateKey()) {
    const plans = await this.#store.query(examId, 'today-plans');
    const byDate = new Map(plans.map((plan) => [plan.date, plan.completedMinutes >= dailyGoalMinutes * threshold]));
    let cursor = new Date(`${at}T00:00:00.000Z`); let days = 0;
    while (byDate.get(cursor.toISOString().slice(0, 10))) { days += 1; cursor = new Date(cursor.getTime() - DAY); }
    return days;
  }
}

