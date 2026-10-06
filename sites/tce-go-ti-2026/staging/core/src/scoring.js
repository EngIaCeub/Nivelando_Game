function key(simulationRunId, questionId) {
  if (!simulationRunId || !questionId) throw new TypeError('simulationRunId and questionId are required');
  return `${simulationRunId}::${questionId}`;
}

export class ScoringEngine {
  #store;
  constructor(store) { this.#store = store; }

  async submitAnswer({ examId, simulationRunId, questionId, correct, timestamp = new Date().toISOString(), operationId = null }) {
    if (typeof correct !== 'boolean') throw new TypeError('correct must be boolean');
    const recordKey = key(simulationRunId, questionId);
    const result = await this.#store.recordScoreAttempt(examId, simulationRunId, questionId, correct, timestamp, operationId);
    return { ...result, simulatedScore: await this.getScore(examId, simulationRunId) };
  }

  async getScore(examId, simulationRunId) {
    const firstAttempts = (await this.#store.query(examId, 'scores')).filter((record) => record.simulationRunId === simulationRunId);
    if (firstAttempts.length === 0) return null;
    const correct = firstAttempts.filter((record) => record.correct).length;
    return (correct / firstAttempts.length) * 100;
  }

  async getFirstAttempt(examId, simulationRunId, questionId) {
    return this.#store.get(examId, 'scores', key(simulationRunId, questionId));
  }
}
