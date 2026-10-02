function key(simulationRunId, questionId) {
  if (!simulationRunId || !questionId) throw new TypeError('simulationRunId and questionId are required');
  return `${simulationRunId}::${questionId}`;
}

export class ScoringEngine {
  #store;
  constructor(store) { this.#store = store; }

  async submitAnswer({ examId, simulationRunId, questionId, correct, timestamp = new Date().toISOString() }) {
    if (typeof correct !== 'boolean') throw new TypeError('correct must be boolean');
    const recordKey = key(simulationRunId, questionId);
    const existing = await this.#store.get(examId, 'scores', recordKey);
    if (!existing) {
      const firstAttempt = { simulationRunId, questionId, correct, answeredAt: timestamp, attempts: 1 };
      await this.#store.put(examId, 'scores', recordKey, firstAttempt);
      return { firstAttempt: true, simulatedScore: await this.getScore(examId, simulationRunId), record: firstAttempt };
    }
    const updated = { ...existing, attempts: existing.attempts + 1, lastAttemptCorrect: correct, lastAttemptAt: timestamp };
    await this.#store.put(examId, 'retakes', `${recordKey}::${updated.attempts}`, updated);
    return { firstAttempt: false, simulatedScore: await this.getScore(examId, simulationRunId), record: existing };
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
