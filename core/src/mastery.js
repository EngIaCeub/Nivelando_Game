const GLOBAL_NAMESPACE = '__studyos_global__';
const MASTERY_VERSION = 1;

function requireConceptId(canonicalConceptId) {
  if (typeof canonicalConceptId !== 'string' || canonicalConceptId.trim() === '') throw new TypeError('canonicalConceptId is required');
  return canonicalConceptId;
}

function clamp(value, min = 0, max = 1) { return Math.min(max, Math.max(min, value)); }

export class MasteryStore {
  #store;
  constructor(store) { this.#store = store; }

  async get(canonicalConceptId) { return this.#store.get(GLOBAL_NAMESPACE, 'mastery', requireConceptId(canonicalConceptId)); }
  async put(record) {
    requireConceptId(record?.canonicalConceptId);
    const normalized = {
      canonicalConceptId: record.canonicalConceptId,
      masteryEstimate: clamp(Number(record.masteryEstimate ?? 0)),
      confidence: clamp(Number(record.confidence ?? 0)),
      source: record.source ?? 'unknown',
      assessedAt: record.assessedAt ?? new Date().toISOString(),
      questionCount: Math.floor(Math.max(0, Number(record.questionCount ?? 0))),
      firstTryCorrect: Math.floor(Math.max(0, Number(record.firstTryCorrect ?? 0))),
      firstTryWrong: Math.floor(Math.max(0, Number(record.firstTryWrong ?? 0))),
      selfAssessment: record.selfAssessment == null ? null : clamp(Number(record.selfAssessment)),
      reviewStatus: record.reviewStatus ?? 'new',
      schemaVersion: MASTERY_VERSION
    };
    let persisted;
    await this.#store.update(GLOBAL_NAMESPACE, 'mastery', normalized.canonicalConceptId, (previous) => {
      const operations = [...new Set([
        ...(Array.isArray(previous?.appliedStudyOperations) ? previous.appliedStudyOperations : []),
        ...(Array.isArray(record.appliedStudyOperations) ? record.appliedStudyOperations : [])
      ].filter((operationId) => typeof operationId === 'string' && operationId.trim() !== ''))];
      persisted = { ...normalized, ...(operations.length ? { appliedStudyOperations: operations } : {}) };
      return persisted;
    });
    return structuredClone(persisted);
  }
  async applyStudyAnswer({ canonicalConceptId, correct, firstAttempt, assessedAt, operationId }) {
    requireConceptId(canonicalConceptId);
    if (typeof correct !== 'boolean' || typeof firstAttempt !== 'boolean' || typeof assessedAt !== 'string' ||
        typeof operationId !== 'string' || operationId.trim() === '') throw new TypeError('invalid study answer effect');
    let result;
    await this.#store.update(GLOBAL_NAMESPACE, 'mastery', canonicalConceptId, (previous) => {
      const applied = Array.isArray(previous?.appliedStudyOperations) ? previous.appliedStudyOperations : [];
      if (applied.includes(operationId)) { result = structuredClone(previous); return previous; }
      result = {
        canonicalConceptId,
        masteryEstimate: clamp((previous?.masteryEstimate ?? 0) * .5 + Number(correct) * .5),
        confidence: clamp((previous?.confidence ?? 0) + .1),
        source: firstAttempt ? 'study-first-attempt' : 'study-retake',
        assessedAt,
        questionCount: (previous?.questionCount ?? 0) + 1,
        firstTryCorrect: (previous?.firstTryCorrect ?? 0) + Number(firstAttempt && correct),
        firstTryWrong: (previous?.firstTryWrong ?? 0) + Number(firstAttempt && !correct),
        selfAssessment: previous?.selfAssessment ?? null,
        reviewStatus: correct ? 'stable' : 'needs-review',
        appliedStudyOperations: [...applied, operationId],
        schemaVersion: MASTERY_VERSION
      };
      return result;
    });
    return result;
  }
  async applyDiagnosticAssessment({ examId, canonicalConceptId, assessmentRunId, assessedAt, questionMastery, questionWeight,
    confidence, questionCount, firstTryCorrect, firstTryWrong, selfAssessment }) {
    requireConceptId(canonicalConceptId);
    if (typeof examId !== 'string' || examId.trim() === '' || typeof assessmentRunId !== 'string' || assessmentRunId.trim() === '' || typeof assessedAt !== 'string' ||
        !Number.isFinite(questionMastery) || !Number.isFinite(questionWeight) || questionWeight < 0 ||
        !Number.isFinite(confidence) || !Number.isInteger(questionCount) || questionCount < 0 ||
        !Number.isInteger(firstTryCorrect) || firstTryCorrect < 0 || !Number.isInteger(firstTryWrong) || firstTryWrong < 0 ||
        (selfAssessment != null && !Number.isFinite(selfAssessment))) throw new TypeError('invalid diagnostic mastery effect');
    const operationId = `diagnostic:${examId}:${assessmentRunId}:${canonicalConceptId}`;
    let result;
    await this.#store.update(GLOBAL_NAMESPACE, 'mastery', canonicalConceptId, (previous) => {
      const applied = Array.isArray(previous?.appliedStudyOperations) ? previous.appliedStudyOperations : [];
      if (applied.includes(operationId)) { result = structuredClone(previous); return previous; }

      // Read and combine with the latest record inside the atomic update. This prevents
      // a diagnostic that started earlier from overwriting concurrent study mastery.
      const previousWeight = previous ? Math.min(0.3, previous.confidence * 0.3) : 0;
      const selfWeight = selfAssessment == null ? 0 : 0.2;
      const totalWeight = questionWeight + selfWeight + previousWeight || 1;
      const estimate = (questionMastery * questionWeight +
        (selfAssessment == null ? 0 : selfAssessment * selfWeight) +
        (previous ? previous.masteryEstimate * previousWeight : 0)) / totalWeight;
      const normalized = {
        canonicalConceptId,
        masteryEstimate: clamp(Number(estimate.toFixed(3))),
        confidence: clamp(Number(Math.max(previous?.confidence ?? 0, confidence).toFixed(3))),
        source: 'diagnostic',
        assessedAt,
        questionCount: (previous?.questionCount ?? 0) + questionCount,
        firstTryCorrect: (previous?.firstTryCorrect ?? 0) + firstTryCorrect,
        firstTryWrong: (previous?.firstTryWrong ?? 0) + firstTryWrong,
        selfAssessment: selfAssessment ?? previous?.selfAssessment ?? null,
        reviewStatus: estimate < 0.6 ? 'needs-review' : 'stable',
        appliedStudyOperations: [...applied, operationId],
        schemaVersion: MASTERY_VERSION
      };
      result = normalized;
      return normalized;
    });
    return structuredClone(result);
  }
  async list() { return this.#store.query(GLOBAL_NAMESPACE, 'mastery'); }
  async export() { return { version: MASTERY_VERSION, records: await this.list() }; }
  async import(payload) {
    if (!payload || payload.version !== MASTERY_VERSION || !Array.isArray(payload.records)) throw new Error('unsupported mastery export');
    for (const record of payload.records) await this.put(record);
  }
}

export { GLOBAL_NAMESPACE, MASTERY_VERSION };
