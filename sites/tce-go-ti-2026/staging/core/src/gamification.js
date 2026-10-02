const XP_BY_EVENT = Object.freeze({
  topic_started: 2,
  topic_completed: 10,
  resource_opened: 1,
  question_answered: 5,
  review_completed: 8,
  simulation_finished: 15
});

export class GamificationEngine {
  #store;
  constructor(store) { this.#store = store; }

  async awardForEvent(event) {
    if (!event?.eventId || !event.examId) throw new TypeError('eventId and examId are required');
    if (event.type === 'reload' || event.type === 'idle' || event.type === 'page_opened') return { xp: 0, awarded: false, reason: 'non-activity' };
    const amount = XP_BY_EVENT[event.type];
    if (!amount) return { xp: 0, awarded: false, reason: 'unsupported-event' };
    const id = `${event.eventId}`;
    if (await this.#store.get(event.examId, 'xp-awards', id)) return { xp: 0, awarded: false, reason: 'duplicate-event' };
    const xp = event.payload?.isRetake ? Math.min(1, amount) : amount;
    const award = { id, eventId: event.eventId, type: event.type, xp, awardedAt: event.timestamp };
    await this.#store.put(event.examId, 'xp-awards', id, award);
    return { xp, awarded: true, award };
  }

  async total(examId) {
    return (await this.#store.query(examId, 'xp-awards')).reduce((sum, award) => sum + award.xp, 0);
  }

  async snapshot(examId) {
    const xp = await this.total(examId);
    return { xp, level: Math.floor(xp / 100) + 1, awards: await this.#store.query(examId, 'xp-awards') };
  }
}
