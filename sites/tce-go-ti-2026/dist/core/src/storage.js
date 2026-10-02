const EXPORT_VERSION = 1;

function requireExamId(examId) {
  if (typeof examId !== 'string' || examId.trim() === '') throw new TypeError('examId is required');
  return examId;
}

function clone(value) {
  return value === undefined ? undefined : structuredClone(value);
}

export class MemoryStore {
  #records = new Map();

  #key(examId, collection, id) {
    return `${requireExamId(examId)}::${collection}::${id}`;
  }

  async get(examId, collection, id) { return clone(this.#records.get(this.#key(examId, collection, id))); }
  async put(examId, collection, id, value) {
    this.#records.set(this.#key(examId, collection, id), clone(value));
    return clone(value);
  }
  async delete(examId, collection, id) { this.#records.delete(this.#key(examId, collection, id)); }
  async query(examId, collection) {
    const prefix = `${requireExamId(examId)}::${collection}::`;
    return [...this.#records.entries()]
      .filter(([key]) => key.startsWith(prefix))
      .map(([, value]) => clone(value));
  }
  async transaction(examId, callback) {
    requireExamId(examId);
    return callback(this);
  }
  async export(examId) {
    requireExamId(examId);
    return {
      version: EXPORT_VERSION,
      examId,
      records: await this.query(examId, 'progress'),
      events: await this.query(examId, 'events')
    };
  }
  async import(examId, payload) {
    requireExamId(examId);
    if (!payload || payload.version !== EXPORT_VERSION || payload.examId !== examId) {
      throw new Error('unsupported or mismatched export');
    }
    for (const record of payload.records ?? []) await this.put(examId, 'progress', record.id, record);
    for (const event of payload.events ?? []) await this.put(examId, 'events', event.eventId, event);
  }
  async migrate() { return EXPORT_VERSION; }
}

export class IndexedDbStore {
  #dbPromise;
  constructor({ name = 'studyos', version = 1 } = {}) {
    if (typeof indexedDB === 'undefined') throw new Error('IndexedDB is unavailable');
    this.#dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(name, version);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('records')) {
          const store = db.createObjectStore('records', { keyPath: 'key' });
          store.createIndex('namespace', 'namespace', { unique: false });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  #key(examId, collection, id) { return `${requireExamId(examId)}::${collection}::${id}`; }
  async #request(mode, operation) {
    const db = await this.#dbPromise;
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('records', mode);
      const request = operation(transaction.objectStore('records'));
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  async get(examId, collection, id) {
    const record = await this.#request('readonly', (store) => store.get(this.#key(examId, collection, id)));
    return record ? clone(record.value) : undefined;
  }
  async put(examId, collection, id, value) {
    await this.#request('readwrite', (store) => store.put({ key: this.#key(examId, collection, id), namespace: requireExamId(examId), collection, value }));
    return clone(value);
  }
  async delete(examId, collection, id) { await this.#request('readwrite', (store) => store.delete(this.#key(examId, collection, id))); }
  async query(examId, collection) {
    const records = await this.#request('readonly', (store) => store.index('namespace').getAll(requireExamId(examId)));
    return records.filter((record) => record.collection === collection).map((record) => clone(record.value));
  }
  async transaction(examId, callback) { requireExamId(examId); return callback(this); }
  async export(examId) { return { version: EXPORT_VERSION, examId, records: await this.query(examId, 'progress'), events: await this.query(examId, 'events') }; }
  async import(examId, payload) {
    if (!payload || payload.version !== EXPORT_VERSION || payload.examId !== requireExamId(examId)) throw new Error('unsupported or mismatched export');
    for (const record of payload.records ?? []) await this.put(examId, 'progress', record.id, record);
    for (const event of payload.events ?? []) await this.put(examId, 'events', event.eventId, event);
  }
  async migrate() { return EXPORT_VERSION; }
}

export class EventLog {
  #store;
  constructor(store) { this.#store = store; }
  async append(event) {
    const required = ['eventId', 'type', 'timestamp', 'examId', 'entityId', 'payload', 'schemaVersion'];
    for (const field of required) if (event?.[field] === undefined || event[field] === null) throw new TypeError(`missing event field: ${field}`);
    const existing = await this.#store.get(event.examId, 'events', event.eventId);
    if (existing) return { event: clone(existing), appended: false };
    await this.#store.put(event.examId, 'events', event.eventId, Object.freeze(clone(event)));
    return { event: clone(event), appended: true };
  }
  async list(examId) { return this.#store.query(examId, 'events'); }
}

export { EXPORT_VERSION };
