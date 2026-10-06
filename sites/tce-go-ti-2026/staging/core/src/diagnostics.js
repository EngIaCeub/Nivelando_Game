import { EventLog } from './storage.js';
import { MasteryStore } from './mastery.js';
import { runMutation } from './mutation-context.js';

const DEFAULTS = Object.freeze({ initialQuestionsPerConcept: 3, maxQuestionsPerConcept: 6, highAccuracy: 0.8, intermediateAccuracy: 0.6 });
const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const clone = (value) => structuredClone(value);

function groupedQuestions(questions) {
  const groups = new Map();
  for (const question of questions ?? []) {
    for (const conceptId of question.canonicalConceptIds ?? []) {
      if (!groups.has(conceptId)) groups.set(conceptId, []);
      groups.get(conceptId).push(question);
    }
  }
  for (const list of groups.values()) list.sort((a, b) => a.id.localeCompare(b.id));
  return groups;
}

async function persistCompletionEvents(events, examId, run, currentMastery = []) {
  const assessments = run.result?.mastery ?? currentMastery.map((record) => ({
    canonicalConceptId: record.canonicalConceptId, masteryEstimate: record.masteryEstimate
  }));
  await events.append({ eventId: `${run.assessmentRunId}:completed`, type: 'diagnostic_completed', timestamp: run.completedAt,
    examId, entityId: run.assessmentRunId, payload: run.result, schemaVersion: 1 });
  for (const assessment of assessments) await events.append({
    eventId: `${run.assessmentRunId}:mastery:${assessment.canonicalConceptId}`, type: 'mastery_updated',
    timestamp: run.completedAt, examId, entityId: assessment.canonicalConceptId,
    payload: { masteryEstimate: assessment.masteryEstimate }, schemaVersion: 1
  });
}

export class DiagnosticEngine {
  #store;
  #mastery;
  #events;
  #config;
  constructor(store, config = {}) {
    this.#store = store;
    this.#mastery = new MasteryStore(store);
    this.#events = new EventLog(store);
    this.#config = { ...DEFAULTS, ...config };
  }

  async start(args, context) {
    return runMutation(this.#store, context, () => this.#start(args));
  }
  async #start({ examId, questions, assessmentRunId = `assessment-${Date.now()}` }) {
    if (!examId || !Array.isArray(questions)) throw new TypeError('examId and questions are required');
    const groups = groupedQuestions(questions);
    const queue = [...groups.entries()].flatMap(([, list]) => list.slice(0, this.#config.initialQuestionsPerConcept).map((question) => question.id));
    const run = { assessmentRunId, examId, status: 'in_progress', questionIds: [...new Set(queue)], responses: [], groups: [...groups.keys()].sort(), startedAt: new Date().toISOString(), config: clone(this.#config), schemaVersion: 1 };
    for (const question of questions) await this.#store.put(examId, 'diagnostic-question-bank', question.id, question);
    await this.#store.put(examId, 'diagnostic-runs', assessmentRunId, run);
    await this.#events.append({ eventId: `${assessmentRunId}:started`, type: 'diagnostic_started', timestamp: run.startedAt, examId, entityId: assessmentRunId, payload: { questionCount: run.questionIds.length }, schemaVersion: 1 });
    return clone(run);
  }

  async getRun(examId, assessmentRunId) { return this.#store.get(examId, 'diagnostic-runs', assessmentRunId); }

  async answer(args, context) {
    return runMutation(this.#store, context, () => this.#answer(args));
  }
  async #answer({ examId, assessmentRunId, questionId, canonicalConceptIds, correct, selfAssessment = null, answeredAt = new Date().toISOString() }) {
    if (typeof correct !== 'boolean' || !questionId) throw new TypeError('questionId and boolean correct are required');
    const response = { questionId, canonicalConceptIds: [...(canonicalConceptIds ?? [])].sort(), correct, selfAssessment, answeredAt };
    const allQuestions = await this.#store.query(examId, 'diagnostic-question-bank');
    const questionGroups = groupedQuestions(allQuestions);
    let updated;
    await this.#store.update(examId, 'diagnostic-runs', assessmentRunId, (current) => {
      if (!current || current.status !== 'in_progress') throw new Error('assessment run is not active');
      if (!current.questionIds.includes(questionId)) throw new Error('question is not in assessment sample');
      if (current.responses.some((item) => item.questionId === questionId)) { updated = clone(current); return current; }
      current.responses.push(response);
      const groups = new Map();
      for (const item of current.responses) for (const conceptId of item.canonicalConceptIds) {
        if (!groups.has(conceptId)) groups.set(conceptId, []);
        groups.get(conceptId).push(item);
      }
      for (const [conceptId, responses] of groups) {
        const list = questionGroups.get(conceptId) ?? [];
        const accuracy = responses.filter((item) => item.correct).length / responses.length;
        const inconsistent = responses.some((item) => item.correct) && responses.some((item) => !item.correct);
        const shouldExpand = responses.length >= this.#config.initialQuestionsPerConcept && (inconsistent || accuracy < this.#config.highAccuracy);
        if (shouldExpand) {
          const next = list.find((candidate) => !current.responses.some((item) => item.questionId === candidate.id) && !current.questionIds.includes(candidate.id));
          if (next && responses.length < this.#config.maxQuestionsPerConcept) current.questionIds.push(next.id);
        }
      }
      updated = clone(current);
      return current;
    });
    const committedResponse = updated.responses.find((item) => item.questionId === questionId);
    await this.#events.append({ eventId: `${assessmentRunId}:answered:${questionId}`, type: 'diagnostic_answered', timestamp: committedResponse.answeredAt, examId, entityId: assessmentRunId, payload: { questionId, correct: committedResponse.correct }, schemaVersion: 1 });
    return updated;
  }

  async complete(args, context) {
    return runMutation(this.#store, context, () => this.#complete(args));
  }
  async #complete({ examId, assessmentRunId, selfAssessments = {}, completedAt = new Date().toISOString() }) {
    const run = await this.getRun(examId, assessmentRunId);
    if (!run || !['in_progress', 'completed'].includes(run.status)) throw new Error('assessment run is not active');
    if (run.status === 'completed') {
      const mastery = await Promise.all((run.result?.concepts ?? []).map((conceptId) => this.#mastery.get(conceptId)));
      await persistCompletionEvents(this.#events, examId, run, mastery.filter(Boolean));
      return { run: clone(run), mastery: mastery.filter(Boolean) };
    }
    const pending = run.questionIds.filter((questionId) => !run.responses.some((response) => response.questionId === questionId));
    if (pending.length > 0) throw new Error(`assessment has ${pending.length} unanswered sampled question(s)`);
    const byConcept = new Map();
    for (const response of run.responses) for (const conceptId of response.canonicalConceptIds) {
      if (!byConcept.has(conceptId)) byConcept.set(conceptId, []);
      byConcept.get(conceptId).push(response);
    }
    const records = [];
    for (const [canonicalConceptId, responses] of byConcept) {
      const correct = responses.filter((response) => response.correct).length;
      const questionMastery = correct / responses.length;
      const self = selfAssessments[canonicalConceptId] ?? responses.find((response) => response.selfAssessment != null)?.selfAssessment ?? null;
      const questionWeight = Math.min(0.8, 0.8 * (responses.length / this.#config.maxQuestionsPerConcept));
      const selfWeight = self == null ? 0 : 0.2;
      const consistency = Math.max(0, 1 - Math.abs(questionMastery - 0.5) * 2);
      const confidence = clamp(0.25 + 0.1 * responses.length + 0.2 * (1 - consistency) + (self == null ? 0 : 0.05));
      records.push(await this.#mastery.applyDiagnosticAssessment({
        examId, canonicalConceptId, assessmentRunId, assessedAt: completedAt, questionMastery,
        questionWeight, confidence: Number(confidence.toFixed(3)), questionCount: responses.length,
        firstTryCorrect: correct, firstTryWrong: responses.length - correct, selfAssessment: self
      }));
    }
    run.status = 'completed';
    run.completedAt = completedAt;
    run.result = {
      concepts: records.map((record) => record.canonicalConceptId), questionCount: run.responses.length,
      mastery: records.map(({ canonicalConceptId, masteryEstimate }) => ({ canonicalConceptId, masteryEstimate }))
    };
    await this.#store.put(examId, 'diagnostic-runs', assessmentRunId, run);
    await persistCompletionEvents(this.#events, examId, run, records);
    return { run: clone(run), mastery: records };
  }

  async restart({ examId, questions }, context) { return this.start({ examId, questions }, context); }
  async recordPlanRebalanced(args, context) {
    return runMutation(this.#store, context, () => this.#recordPlanRebalanced(args));
  }
  async #recordPlanRebalanced({ examId, planId, topicIds = [], reason = 'diagnostic_completed', timestamp = new Date().toISOString() }) {
    const event = { eventId: `plan-rebalanced:${examId}:${planId ?? timestamp}`, type: 'study_plan_rebalanced', timestamp, examId, entityId: planId ?? examId, payload: { topicIds, reason }, schemaVersion: 1 };
    return this.#events.append(event);
  }
  async exportExam(examId) { return { version: 1, examId, diagnosticRuns: await this.#store.query(examId, 'diagnostic-runs'), events: await this.#store.query(examId, 'events'), mastery: await this.#mastery.export() }; }
  async importExam(examId, payload, context) {
    return runMutation(this.#store, context, () => this.#importExam(examId, payload));
  }
  async #importExam(examId, payload) {
    if (!payload || payload.version !== 1 || payload.examId !== examId) throw new Error('unsupported diagnostic export');
    for (const run of payload.diagnosticRuns ?? []) await this.#store.put(examId, 'diagnostic-runs', run.assessmentRunId, run);
    for (const event of payload.events ?? []) await this.#store.put(examId, 'events', event.eventId, event);
    if (payload.mastery) await this.#mastery.import(payload.mastery);
  }
}

export { DEFAULTS as DIAGNOSTIC_DEFAULTS };
