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
    await this.#store.put(GLOBAL_NAMESPACE, 'mastery', normalized.canonicalConceptId, normalized);
    return structuredClone(normalized);
  }
  async list() { return this.#store.query(GLOBAL_NAMESPACE, 'mastery'); }
  async export() { return { version: MASTERY_VERSION, records: await this.list() }; }
  async import(payload) {
    if (!payload || payload.version !== MASTERY_VERSION || !Array.isArray(payload.records)) throw new Error('unsupported mastery export');
    for (const record of payload.records) await this.put(record);
  }
}

export { GLOBAL_NAMESPACE, MASTERY_VERSION };
