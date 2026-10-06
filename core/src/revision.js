const DAY = 24 * 60 * 60 * 1000;

function revisionKey(topicId) {
  if (!topicId) throw new TypeError('topicId is required');
  return topicId;
}

export class RevisionEngine {
  #store;
  #config;
  constructor(store, config = {}) {
    this.#store = store;
    this.#config = { initialEase: 2.5, ...config };
  }

  async review({ examId, topicId, quality, reviewedAt = new Date().toISOString() }) {
    if (!Number.isInteger(quality) || quality < 0 || quality > 5) throw new RangeError('quality must be an integer from 0 to 5');
    const existing = await this.#store.get(examId, 'revisions', revisionKey(topicId));
    const previous = existing ?? { topicId, interval: 0, ease: this.#config.initialEase, mastery: 0, history: [] };
    const correct = quality >= 3;
    const interval = correct
      ? (previous.interval === 0 ? 1 : Math.max(1, Math.round(previous.interval * previous.ease)))
      : 1;
    const ease = Math.max(1.3, previous.ease + (quality >= 3 ? 0.1 : -0.2));
    const mastery = Math.min(1, Math.max(0, previous.mastery + (correct ? 0.2 : -0.15)));
    const next = {
      topicId,
      interval,
      ease: Number(ease.toFixed(2)),
      mastery: Number(mastery.toFixed(2)),
      dueAt: new Date(Date.parse(reviewedAt) + interval * DAY).toISOString(),
      history: [...previous.history, { reviewedAt, quality }]
    };
    await this.#store.put(examId, 'revisions', revisionKey(topicId), next);
    return next;
  }

  async reviewOnce({ examId, topicId, quality, reviewedAt = new Date().toISOString(), operationId }) {
    if (!Number.isInteger(quality) || quality < 0 || quality > 5) throw new RangeError('quality must be an integer from 0 to 5');
    if (typeof operationId !== 'string' || operationId.trim() === '') throw new TypeError('operationId is required');
    let result;
    await this.#store.update(examId, 'revisions', revisionKey(topicId), (previous) => {
      const history = Array.isArray(previous?.history) ? previous.history : [];
      if (history.some((entry) => entry.operationId === operationId)) { result = structuredClone(previous); return previous; }
      const current = previous ?? { topicId, interval: 0, ease: this.#config.initialEase, mastery: 0, history: [] };
      const correct = quality >= 3;
      const interval = correct
        ? (current.interval === 0 ? 1 : Math.max(1, Math.round(current.interval * current.ease)))
        : 1;
      const ease = Math.max(1.3, current.ease + (correct ? .1 : -.2));
      const mastery = Math.min(1, Math.max(0, current.mastery + (correct ? .2 : -.15)));
      result = {
        topicId,
        interval,
        ease: Number(ease.toFixed(2)),
        mastery: Number(mastery.toFixed(2)),
        dueAt: new Date(Date.parse(reviewedAt) + interval * DAY).toISOString(),
        history: [...history, { reviewedAt, quality, operationId }]
      };
      return result;
    });
    return result;
  }

  async get(examId, topicId) { return this.#store.get(examId, 'revisions', revisionKey(topicId)); }
  async due(examId, at = new Date().toISOString()) {
    const timestamp = Date.parse(at);
    return (await this.#store.query(examId, 'revisions')).filter((revision) => Date.parse(revision.dueAt) <= timestamp);
  }
}
