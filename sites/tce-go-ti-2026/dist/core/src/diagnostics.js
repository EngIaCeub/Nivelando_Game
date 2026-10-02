import { EventLog } from './storage.js';
import { MasteryStore } from './mastery.js';

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

  async start({ examId, questions, assessmentRunId = `assessment-${Date.now()}` }) {
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

  async answer({ examId, assessmentRunId, questionId, canonicalConceptIds, correct, selfAssessment = null, answeredAt = new Date().toISOString() }) {
    if (typeof correct !== 'boolean' || !questionId) throw new TypeError('questionId and boolean correct are required');
    const run = await this.getRun(examId, assessmentRunId);
    if (!run || run.status !== 'in_progress') throw new Error('assessment run is not active');
    if (!run.questionIds.includes(questionId)) throw new Error('question is not in assessment sample');
    if (run.responses.some((response) => response.questionId === questionId)) return clone(run);
    const response = { questionId, canonicalConceptIds: [...(canonicalConceptIds ?? [])].sort(), correct, selfAssessment, answeredAt };
    run.responses.push(response);
    const groups = new Map();
    for (const item of run.responses) for (const conceptId of item.canonicalConceptIds) {
      if (!groups.has(conceptId)) groups.set(conceptId, []);
      groups.get(conceptId).push(item);
    }
    const allQuestions = await this.#store.query(examId, 'diagnostic-question-bank');
    const questionGroups = groupedQuestions(allQuestions);
    for (const [conceptId, responses] of groups) {
      const list = questionGroups.get(conceptId) ?? [];
      const accuracy = responses.filter((item) => item.correct).length / responses.length;
      const inconsistent = responses.some((item) => item.correct) && responses.some((item) => !item.correct);
      const shouldExpand = responses.length >= this.#config.initialQuestionsPerConcept && (inconsistent || accuracy < this.#config.highAccuracy);
      if (shouldExpand) {
        const next = list.find((candidate) => !run.responses.some((item) => item.questionId === candidate.id) && !run.questionIds.includes(candidate.id));
        if (next && responses.length < this.#config.maxQuestionsPerConcept) run.questionIds.push(next.id);
      }
    }
    await this.#store.put(examId, 'diagnostic-runs', assessmentRunId, run);
    await this.#events.append({ eventId: `${assessmentRunId}:answered:${questionId}`, type: 'diagnostic_answered', timestamp: answeredAt, examId, entityId: assessmentRunId, payload: { questionId, correct }, schemaVersion: 1 });
    return clone(run);
  }

  async complete({ examId, assessmentRunId, selfAssessments = {}, completedAt = new Date().toISOString() }) {
    const run = await this.getRun(examId, assessmentRunId);
    if (!run || run.status !== 'in_progress') throw new Error('assessment run is not active');
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
      const previous = await this.#mastery.get(canonicalConceptId);
      const questionWeight = Math.min(0.8, 0.8 * (responses.length / this.#config.maxQuestionsPerConcept));
      const selfWeight = self == null ? 0 : 0.2;
      const previousWeight = previous ? Math.min(0.3, previous.confidence * 0.3) : 0;
      const totalWeight = questionWeight + selfWeight + previousWeight || 1;
      const estimate = (questionMastery * questionWeight + (self == null ? 0 : self * selfWeight) + (previous ? previous.masteryEstimate * previousWeight : 0)) / totalWeight;
      const consistency = Math.max(0, 1 - Math.abs(questionMastery - 0.5) * 2);
      const confidence = clamp(0.25 + 0.1 * responses.length + 0.2 * (1 - consistency) + (self == null ? 0 : 0.05));
      records.push(await this.#mastery.put({ canonicalConceptId, masteryEstimate: Number(estimate.toFixed(3)), confidence: Number(confidence.toFixed(3)), source: 'diagnostic', assessedAt: completedAt, questionCount: responses.length, firstTryCorrect: correct, firstTryWrong: responses.length - correct, selfAssessment: self, reviewStatus: estimate < 0.6 ? 'needs-review' : 'stable' }));
    }
    run.status = 'completed';
    run.completedAt = completedAt;
    run.result = { concepts: records.map((record) => record.canonicalConceptId), questionCount: run.responses.length };
    await this.#store.put(examId, 'diagnostic-runs', assessmentRunId, run);
    await this.#events.append({ eventId: `${assessmentRunId}:completed`, type: 'diagnostic_completed', timestamp: completedAt, examId, entityId: assessmentRunId, payload: run.result, schemaVersion: 1 });
    for (const record of records) await this.#events.append({ eventId: `${assessmentRunId}:mastery:${record.canonicalConceptId}`, type: 'mastery_updated', timestamp: completedAt, examId, entityId: record.canonicalConceptId, payload: { masteryEstimate: record.masteryEstimate }, schemaVersion: 1 });
    return { run: clone(run), mastery: records };
  }

  async restart({ examId, questions }) { return this.start({ examId, questions }); }
  async recordPlanRebalanced({ examId, planId, topicIds = [], reason = 'diagnostic_completed', timestamp = new Date().toISOString() }) {
    const event = { eventId: `plan-rebalanced:${examId}:${planId ?? timestamp}`, type: 'study_plan_rebalanced', timestamp, examId, entityId: planId ?? examId, payload: { topicIds, reason }, schemaVersion: 1 };
    return this.#events.append(event);
  }
  async exportExam(examId) { return { version: 1, examId, diagnosticRuns: await this.#store.query(examId, 'diagnostic-runs'), events: await this.#store.query(examId, 'events'), mastery: await this.#mastery.export() }; }
  async importExam(examId, payload) {
    if (!payload || payload.version !== 1 || payload.examId !== examId) throw new Error('unsupported diagnostic export');
    for (const run of payload.diagnosticRuns ?? []) await this.#store.put(examId, 'diagnostic-runs', run.assessmentRunId, run);
    for (const event of payload.events ?? []) await this.#store.put(examId, 'events', event.eventId, event);
    if (payload.mastery) await this.#mastery.import(payload.mastery);
  }
}

export { DEFAULTS as DIAGNOSTIC_DEFAULTS };
