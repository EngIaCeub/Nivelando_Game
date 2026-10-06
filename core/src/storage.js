const EXPORT_VERSION = 1;
const STORAGE_META_NAMESPACE = '__studyos_meta__';
const STORAGE_META_COLLECTION = 'system';
const STORAGE_GENERATION_ID = 'generation';
const storageGenerationKey = () => `${STORAGE_META_NAMESPACE}::${STORAGE_META_COLLECTION}::${STORAGE_GENERATION_ID}`;
const staleStorageError = () => new Error('Armazenamento foi substituído em outra aba; recarregue a aplicação antes de continuar.');
function generationOf(record) {
  if (record === undefined) return 0;
  const value = record?.value?.generation;
  if (!Number.isSafeInteger(value) || value < 0) throw new Error('storage generation value is invalid');
  return value;
}

function requireExamId(examId) {
  if (typeof examId !== 'string' || examId.trim() === '') throw new TypeError('examId is required');
  return examId;
}

function clone(value) {
  return value === undefined ? undefined : structuredClone(value);
}
function text(value) { return typeof value === 'string' && value.trim().length > 0; }

function synchronousUpdate(updater, previous) {
  const value = updater(clone(previous));
  if (value && typeof value.then === 'function') {
    Promise.resolve(value).catch(() => {});
    throw new TypeError('update callback must be synchronous');
  }
  return value;
}

// Prepare every replacement before opening a transaction or touching live state.
function prepareNamespaces(payloads) {
  if (!Array.isArray(payloads) || !payloads.length) throw new TypeError('namespace exports are required');
  const namespaces = new Set();
  return payloads.map((payload) => {
    const namespace = requireExamId(payload?.examId);
    if (namespace.includes('::') || namespaces.has(namespace) || payload.version !== EXPORT_VERSION ||
        !payload.collections || typeof payload.collections !== 'object' || Array.isArray(payload.collections)) {
      throw new TypeError('invalid namespace export');
    }
    namespaces.add(namespace);
    const rows = [];
    for (const [collection, records] of Object.entries(payload.collections)) {
      if (!collection || collection.includes('::') || !Array.isArray(records)) throw new TypeError('invalid collection');
      const ids = new Set();
      for (const record of records) {
        if (typeof record?.id !== 'string' || !record.id.trim() || record.value === undefined || ids.has(record.id)) throw new TypeError('invalid or duplicate record');
        ids.add(record.id);
        rows.push({ key: `${namespace}::${collection}::${record.id}`, namespace, collection, value: clone(record.value) });
      }
    }
    return { namespace, rows };
  });
}

function prepareCapture({ namespaceIds, replacements, captureNamespace, captureCollection, captureId, metadata, rawSettings }) {
  const prepared = prepareNamespaces(replacements);
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) throw new TypeError('recovery metadata must be an object');
  if (!Array.isArray(namespaceIds) || namespaceIds.length !== prepared.length ||
      namespaceIds.some((id, index) => id !== prepared[index].namespace) || new Set(namespaceIds).size !== namespaceIds.length ||
      !text(captureNamespace) || captureNamespace.includes('::') || !text(captureCollection) || captureCollection.includes('::') ||
      !text(captureId) || prepared.some(item => item.namespace === captureNamespace)) {
    throw new TypeError('invalid recovery capture request');
  }
  const envelope = clone({
    kind: 'studyos-recovery', recoveryVersion: 1, recoveryOnly: true, captureId,
    capturedAt: new Date().toISOString(), namespaceIds: [...namespaceIds], metadata, rawSettings,
    rows: []
  });
  return { prepared, envelope, captureNamespace, captureCollection, captureId };
}

function captureRowKey(namespace, collection, id) { return `${namespace}::${collection}::${id}`; }

function exportRows(examId, rows) {
  const collections = Object.create(null);
  for (const row of rows) {
    const prefix = `${examId}::${row.collection}::`;
    (collections[row.collection] ??= []).push({ id: row.key.slice(prefix.length), value: clone(row.value) });
  }
  // Use one snapshot, including the compatibility projections.
  return { version: EXPORT_VERSION, examId, records: (collections.progress ?? []).map(r => clone(r.value)), events: (collections.events ?? []).map(r => clone(r.value)), collections: { ...collections } };
}

function validateNamespaceIds(namespaceIds) {
  if (!Array.isArray(namespaceIds) || namespaceIds.length === 0) throw new TypeError('namespaceIds are required');
  const seen = new Set();
  for (const namespace of namespaceIds) {
    requireExamId(namespace);
    if (namespace.includes('::') || seen.has(namespace)) throw new TypeError('namespaceIds must be unique valid namespaces');
    seen.add(namespace);
  }
  return [...namespaceIds];
}

export class MemoryStore {
  #records = new Map();
  #mutationTail = Promise.resolve();

  async withExclusiveMutation(work) {
    const previous = this.#mutationTail;
    let release;
    this.#mutationTail = new Promise(resolve => { release = resolve; });
    await previous;
    try { return await work(); } finally { release(); }
  }

  #key(examId, collection, id) {
    return `${requireExamId(examId)}::${collection}::${id}`;
  }

  async get(examId, collection, id) { return clone(this.#records.get(this.#key(examId, collection, id))); }
  async put(examId, collection, id, value) {
    this.#records.set(this.#key(examId, collection, id), clone(value));
    return clone(value);
  }
  async putIfAbsent(examId, collection, id, value) {
    const key = this.#key(examId, collection, id);
    if (this.#records.has(key)) return false;
    this.#records.set(key, clone(value));
    return true;
  }
  async update(examId, collection, id, updater) {
    const key = this.#key(examId, collection, id);
    const previous = clone(this.#records.get(key));
    const value = synchronousUpdate(updater, previous);
    const storedValue = value === undefined ? undefined : clone(value);
    const returnedValue = clone(value);
    const outcome = { previous, value: returnedValue, changed: value !== undefined };
    if (value !== undefined) this.#records.set(key, storedValue);
    return outcome;
  }
  async recordScoreAttempt(examId, simulationRunId, questionId, correct, timestamp, operationId = null) {
    const scoreId = `${simulationRunId}::${questionId}`;
    const scoreKey = this.#key(examId, 'scores', scoreId);
    const existing = this.#records.get(scoreKey);
    const priorOperation = operationId && this.#records.get(this.#key(examId, 'retake-operations', operationId));
    if (priorOperation && (priorOperation.scoreId !== scoreId || priorOperation.simulationRunId !== simulationRunId || priorOperation.questionId !== questionId || priorOperation.correct !== correct || priorOperation.timestamp !== timestamp)) throw new Error('operationId was already used for a different score attempt');
    if (priorOperation && existing) return { firstAttempt: priorOperation.firstAttempt === true, record: clone(existing), replayed: true };
    if (priorOperation) throw new Error('operationId exists without its score record');
    if (!existing) {
      const record = { simulationRunId, questionId, correct, answeredAt: timestamp, attempts: 1 };
      this.#records.set(scoreKey, clone(record));
      if (operationId) this.#records.set(this.#key(examId, 'retake-operations', operationId), { operationId, scoreId, simulationRunId, questionId, correct, timestamp, attempts: 1, firstAttempt: true });
      return { firstAttempt: true, record: clone(record), replayed: false };
    }
    const retakePrefix = `${requireExamId(examId)}::retakes::${scoreId}::`;
    const previousRetakes = [...this.#records].filter(([key]) => key.startsWith(retakePrefix)).map(([, value]) => value.attempts ?? 1);
    const attempts = Math.max(existing.attempts, ...previousRetakes) + 1;
    const record = { ...existing, attempts, lastAttemptCorrect: correct, lastAttemptAt: timestamp };
    this.#records.set(this.#key(examId, 'retakes', `${scoreId}::${attempts}`), clone(record));
    if (operationId) this.#records.set(this.#key(examId, 'retake-operations', operationId), { operationId, scoreId, simulationRunId, questionId, correct, timestamp, attempts, firstAttempt: false });
    return { firstAttempt: false, record: clone(existing) };
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
    const draft = new MemoryStore();
    draft.#records = new Map([...this.#records].map(([key, value]) => [key, clone(value)]));
    const result = await callback(draft);
    this.#records = draft.#records;
    return result;
  }
  async export(examId) {
    requireExamId(examId);
    const rows = [];
    for (const [key, value] of this.#records.entries()) {
      if (!key.startsWith(`${examId}::`)) continue;
      const collection = key.slice(`${examId}::`.length).split('::')[0];
      rows.push({ key, collection, value });
    }
    return exportRows(examId, rows);
  }
  async exportNamespaces(namespaceIds) {
    const namespaces = validateNamespaceIds(namespaceIds);
    return namespaces.map(namespace => {
      const rows = [];
      for (const [key, value] of this.#records.entries()) {
        if (!key.startsWith(`${namespace}::`) || key === storageGenerationKey()) continue;
        const collection = key.slice(`${namespace}::`.length).split('::')[0];
        rows.push({ key, collection, value });
      }
      return exportRows(namespace, rows);
    });
  }
  async replaceNamespaces(payloads) {
    const replacements = prepareNamespaces(payloads);
    const draft = new Map(this.#records);
    for (const { namespace, rows } of replacements) {
      for (const key of draft.keys()) if (key.startsWith(`${namespace}::`)) draft.delete(key);
      for (const row of rows) draft.set(row.key, row.value);
    }
    this.#records = draft;
    return true;
  }
  async captureAndReplaceNamespaces(options) {
    const { prepared, envelope, captureNamespace, captureCollection, captureId } = prepareCapture(options);
    const draft = new Map(this.#records);
    envelope.rows = [...draft.entries()]
      .filter(([key]) => prepared.some(({ namespace }) => key.startsWith(`${namespace}::`)))
      .map(([key, value]) => {
        const separator = key.indexOf('::');
        const namespace = key.slice(0, separator);
        const collection = key.slice(separator + 2).split('::')[0];
        return clone({ key, namespace, collection, value });
      });
    const captureKey = captureRowKey(captureNamespace, captureCollection, captureId);
    if (draft.has(captureKey)) throw new Error('recovery captureId already exists');
    for (const { namespace, rows } of prepared) {
      for (const key of draft.keys()) if (key.startsWith(`${namespace}::`)) draft.delete(key);
      for (const row of rows) draft.set(row.key, clone(row.value));
    }
    draft.set(captureKey, clone(envelope));
    this.#records = draft;
    return clone(envelope);
  }
  async import(examId, payload) {
    requireExamId(examId);
    if (!payload || payload.version !== EXPORT_VERSION || payload.examId !== examId) {
      throw new Error('unsupported or mismatched export');
    }
    for (const record of payload.records ?? []) await this.put(examId, 'progress', record.id, record);
    for (const event of payload.events ?? []) await this.put(examId, 'events', event.eventId, event);
    for (const [collection, records] of Object.entries(payload.collections ?? {})) {
      for (const record of records ?? []) await this.put(examId, collection, record.id, record.value);
    }
  }
  async migrate() { return EXPORT_VERSION; }
}

export class IndexedDbStore {
  #dbPromise;
  #generationPromise;
  #generation = 0;
  #lockName;
  constructor({ name = 'studyos', version = 1 } = {}) {
    if (typeof indexedDB === 'undefined') throw new Error('IndexedDB is unavailable');
    this.#lockName = `studyos:${name}:mutation`;
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
    this.#generationPromise = this.#dbPromise.then(db => this.#readGeneration(db)).then(generation => {
      this.#generation = generation;
      return generation;
    });
  }
  async #readGeneration(db) {
    return new Promise((resolve, reject) => {
      let transaction;
      let request;
      let generation;
      let hasResult = false;
      try {
        transaction = db.transaction('records', 'readonly');
        const store = transaction.objectStore('records');
        if (typeof store.get !== 'function') throw new Error('storage generation read is unavailable');
        request = store.get(storageGenerationKey());
        if (!request || typeof request !== 'object') throw new Error('storage generation request is invalid');
      } catch (error) {
        try { transaction?.abort(); } catch { /* transaction may not have started */ }
        reject(error);
        return;
      }
      request.onsuccess = () => {
        const record = request.result;
        if (record === undefined) {
          generation = 0;
        } else {
          const value = record?.value?.generation;
          if (!Number.isSafeInteger(value) || value < 0) {
            try { transaction.abort(); } catch { /* transaction may already be inactive */ }
            reject(new Error('storage generation value is invalid'));
            return;
          }
          generation = value;
        }
        hasResult = true;
      };
      request.onerror = () => reject(request.error ?? new Error('storage generation read failed'));
      transaction.oncomplete = () => {
        if (hasResult) resolve(generation);
        else reject(new Error('storage generation read completed without a result'));
      };
      transaction.onabort = () => reject(transaction.error ?? new Error('storage generation read aborted'));
      transaction.onerror = () => reject(transaction.error ?? new Error('storage generation read failed'));
    });
  }
  async #assertCurrentGeneration(expectedGeneration) {
    await this.#generationPromise;
    const db = await this.#dbPromise;
    const actual = await this.#readGeneration(db);
    if (actual !== expectedGeneration || this.#generation !== expectedGeneration) throw staleStorageError();
  }
  async withExclusiveMutation(work, { requireCrossContext = false } = {}) {
    if (typeof work !== 'function') throw new TypeError('exclusive mutation callback is required');
    const locks = globalThis.navigator?.locks;
    if (requireCrossContext && typeof locks?.request !== 'function') {
      throw new Error('Este navegador não oferece coordenação segura entre abas; feche outras abas ou use um navegador atualizado.');
    }
    await this.#generationPromise;
    const expectedGeneration = this.#generation;
    if (!locks?.request) {
      await this.#assertCurrentGeneration(expectedGeneration);
      return work();
    }
    return locks.request(this.#lockName, { mode: 'exclusive' }, async () => {
      await this.#assertCurrentGeneration(expectedGeneration);
      return work();
    });
  }
  #key(examId, collection, id) { return `${requireExamId(examId)}::${collection}::${id}`; }
  #guardWrite(transaction, expectedGeneration, work, reject) {
    const fail = error => { try { transaction.abort(); } catch {} reject(error); };
    try {
      const store = transaction.objectStore('records');
      const request = store.get(storageGenerationKey());
      if (!request || typeof request !== 'object') throw new Error('storage generation request is invalid');
      request.onerror = () => fail(request.error ?? new Error('storage generation read failed'));
      request.onsuccess = () => {
        try {
          if (generationOf(request.result) !== expectedGeneration) throw staleStorageError();
          work(store);
        } catch (error) { fail(error); }
      };
    } catch (error) { fail(error); }
  }
  async #request(mode, operation) {
    if (mode === 'readwrite') await this.#generationPromise;
    const expectedGeneration = this.#generation;
    const db = await this.#dbPromise;
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('records', mode);
      let result;
      transaction.oncomplete = () => resolve(result);
      transaction.onabort = () => reject(transaction.error ?? new Error('IndexedDB transaction aborted'));
      transaction.onerror = () => reject(transaction.error ?? new Error('IndexedDB transaction failed'));
      const perform = store => {
        const request = operation(store);
        request.onsuccess = () => { result = request.result; };
      };
      try {
        if (mode === 'readwrite') this.#guardWrite(transaction, expectedGeneration, perform, reject);
        else perform(transaction.objectStore('records'));
      } catch (error) {
        transaction.abort();
        reject(error);
      }
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
  async putIfAbsent(examId, collection, id, value) {
    await this.#generationPromise;
    const expectedGeneration = this.#generation;
    const db = await this.#dbPromise;
    const row = { key: this.#key(examId, collection, id), namespace: requireExamId(examId), collection, value: clone(value) };
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('records', 'readwrite');
      let inserted = false;
      transaction.oncomplete = () => resolve(inserted);
      transaction.onabort = () => reject(transaction.error ?? new Error('IndexedDB transaction aborted'));
      transaction.onerror = () => reject(transaction.error ?? new Error('IndexedDB transaction failed'));
      this.#guardWrite(transaction, expectedGeneration, store => {
      const request = store.add(row);
      request.onsuccess = () => { inserted = true; };
      request.onerror = (event) => {
        if (request.error?.name === 'ConstraintError') {
          // Duplicate primary key means another answer already won atomically.
          event.preventDefault();
          event.stopPropagation();
          inserted = false;
        }
      };
      }, reject);
    });
  }
  async update(examId, collection, id, updater) {
    const namespace = requireExamId(examId);
    const key = this.#key(namespace, collection, id);
    await this.#generationPromise;
    const expectedGeneration = this.#generation;
    const db = await this.#dbPromise;
    return new Promise((resolve, reject) => {
      const tx = db.transaction('records', 'readwrite');
      const store = tx.objectStore('records');
      let outcome;
      tx.oncomplete = () => resolve(outcome);
      tx.onabort = () => reject(tx.error ?? new Error('IndexedDB transaction aborted'));
      tx.onerror = () => reject(tx.error ?? new Error('IndexedDB transaction failed'));
      this.#guardWrite(tx, expectedGeneration, () => {
      const request = store.get(key);
      request.onsuccess = () => {
        try {
          const previous = request.result?.value;
          const value = synchronousUpdate(updater, previous);
          outcome = { previous: clone(previous), value: clone(value), changed: value !== undefined };
          if (value !== undefined) store.put({ key, namespace, collection, value: clone(value) });
        } catch (error) {
          tx.abort();
          reject(error);
        }
      };
      }, reject);
    });
  }
  async recordScoreAttempt(examId, simulationRunId, questionId, correct, timestamp, operationId = null) {
    const namespace = requireExamId(examId);
    const scoreId = `${simulationRunId}::${questionId}`;
    const scoreKey = this.#key(namespace, 'scores', scoreId);
    await this.#generationPromise;
    const expectedGeneration = this.#generation;
    const db = await this.#dbPromise;
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('records', 'readwrite');
      const store = transaction.objectStore('records');
      let outcome;
      transaction.oncomplete = () => resolve(outcome);
      transaction.onabort = () => reject(transaction.error ?? new Error('IndexedDB transaction aborted'));
      transaction.onerror = () => reject(transaction.error ?? new Error('IndexedDB transaction failed'));
      this.#guardWrite(transaction, expectedGeneration, () => {
      const request = store.get(scoreKey);
      request.onsuccess = () => {
        const process = (priorOperation) => {
          const existing = request.result?.value;
          if (priorOperation) {
            if (priorOperation.scoreId !== scoreId || !existing) { transaction.abort(); return; }
            if (priorOperation.simulationRunId !== simulationRunId || priorOperation.questionId !== questionId || priorOperation.correct !== correct || priorOperation.timestamp !== timestamp) { transaction.abort(); return; }
            outcome = { firstAttempt: priorOperation.firstAttempt === true, record: existing, replayed: true };
            return;
          }
          if (!existing) {
            const record = { simulationRunId, questionId, correct, answeredAt: timestamp, attempts: 1 };
            outcome = { firstAttempt: true, record, replayed: false };
            store.add({ key: scoreKey, namespace, collection: 'scores', value: record });
            if (operationId) store.add({ key: this.#key(namespace, 'retake-operations', operationId), namespace, collection: 'retake-operations', value: { operationId, scoreId, simulationRunId, questionId, correct, timestamp, attempts: 1, firstAttempt: true } });
            return;
          }
          this.#writeRetake(store, namespace, scoreId, existing, correct, timestamp, operationId, outcomeValue => { outcome = outcomeValue; });
        };
        if (!operationId) { process(null); return; }
        const opRequest = store.get(this.#key(namespace, 'retake-operations', operationId));
        opRequest.onsuccess = () => process(opRequest.result?.value);
      };
      }, reject);
    });
  }
  #writeRetake(store, namespace, scoreId, existing, correct, timestamp, operationId, setOutcome) {
        const retakesRequest = store.index('namespace').getAll(namespace);
        retakesRequest.onsuccess = () => {
          const previousRetakes = retakesRequest.result.filter(row => row.collection === 'retakes' && row.value.simulationRunId === existing.simulationRunId && row.value.questionId === existing.questionId).map(row => row.value.attempts ?? 1);
          const attempts = Math.max(existing.attempts, ...previousRetakes) + 1;
          const record = { ...existing, attempts, lastAttemptCorrect: correct, lastAttemptAt: timestamp };
          setOutcome({ firstAttempt: false, record: existing });
          store.put({ key: this.#key(namespace, 'retakes', `${scoreId}::${attempts}`), namespace, collection: 'retakes', value: record });
          if (operationId) store.add({ key: this.#key(namespace, 'retake-operations', operationId), namespace, collection: 'retake-operations', value: { operationId, scoreId, simulationRunId: existing.simulationRunId, questionId: existing.questionId, correct, timestamp, attempts, firstAttempt: false } });
        };
  }
  async delete(examId, collection, id) { await this.#request('readwrite', (store) => store.delete(this.#key(examId, collection, id))); }
  async query(examId, collection) {
    const records = await this.#request('readonly', (store) => store.index('namespace').getAll(requireExamId(examId)));
    return records.filter((record) => record.collection === collection).map((record) => clone(record.value));
  }
  async transaction(examId, callback) { requireExamId(examId); return callback(this); }
  async export(examId) {
    const namespace = requireExamId(examId);
    const records = await this.#request('readonly', store => store.index('namespace').getAll(namespace));
    return exportRows(examId, records);
  }
  async exportNamespaces(namespaceIds) {
    const namespaces = validateNamespaceIds(namespaceIds);
    const db = await this.#dbPromise;
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('records', 'readonly');
      const index = transaction.objectStore('records').index('namespace');
      const rowsByNamespace = new Map();
      let remaining = namespaces.length;
      let failed = false;
      const fail = error => {
        if (failed) return;
        failed = true;
        try { transaction.abort(); } catch { /* transaction may already be inactive */ }
        reject(error);
      };
      transaction.oncomplete = () => {
        if (failed) return;
        resolve(namespaces.map(namespace => exportRows(namespace, rowsByNamespace.get(namespace))));
      };
      transaction.onabort = () => { if (!failed) reject(transaction.error ?? new Error('snapshot transaction aborted')); };
      transaction.onerror = () => { if (!failed) reject(transaction.error ?? new Error('snapshot transaction failed')); };
      try {
        for (const namespace of namespaces) {
          const request = index.getAll(namespace);
          request.onsuccess = () => {
            try {
              rowsByNamespace.set(namespace, request.result.filter(row => row.key !== storageGenerationKey()).map(row => clone(row)));
              remaining--;
              if (remaining === 0 && rowsByNamespace.size !== namespaces.length) fail(new Error('snapshot namespace read incomplete'));
            } catch (error) { fail(error); }
          };
          request.onerror = () => fail(request.error ?? new Error('snapshot namespace read failed'));
        }
      } catch (error) { fail(error); }
    });
  }
  async replaceNamespaces(payloads) {
    const replacements = prepareNamespaces(payloads);
    await this.#generationPromise;
    const expectedGeneration = this.#generation;
    const nextGeneration = expectedGeneration + 1;
    const db = await this.#dbPromise;
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('records', 'readwrite');
      const store = transaction.objectStore('records');
      transaction.oncomplete = () => { this.#generation = nextGeneration; resolve(true); };
      transaction.onabort = () => reject(transaction.error ?? new Error('IndexedDB transaction aborted'));
      transaction.onerror = () => reject(transaction.error ?? new Error('IndexedDB transaction failed'));
      const generationRequest = store.get(storageGenerationKey());
      generationRequest.onsuccess = () => {
        try {
          if (generationOf(generationRequest.result) !== expectedGeneration) throw staleStorageError();
          if (!Number.isSafeInteger(nextGeneration)) throw new Error('storage generation exhausted');
          store.put({ key: storageGenerationKey(), namespace: STORAGE_META_NAMESPACE, collection: STORAGE_META_COLLECTION,
            value: { id: STORAGE_GENERATION_ID, generation: nextGeneration } });
          for (const { namespace, rows } of replacements) {
            const request = store.index('namespace').openCursor(namespace);
            request.onsuccess = () => {
              try {
                const cursor = request.result;
                if (cursor) { cursor.delete(); cursor.continue(); }
                else for (const row of rows) store.put(row);
              } catch (error) { transaction.abort(); reject(error); }
            };
          }
        } catch (error) { transaction.abort(); reject(error); }
      };
      generationRequest.onerror = () => { transaction.abort(); reject(generationRequest.error ?? new Error('storage generation check failed')); };
    });
  }
  async captureAndReplaceNamespaces(options) {
    const { prepared, envelope, captureNamespace, captureCollection, captureId } = prepareCapture(options);
    await this.#generationPromise;
    const expectedGeneration = this.#generation;
    const nextGeneration = expectedGeneration + 1;
    const db = await this.#dbPromise;
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('records', 'readwrite');
      const store = transaction.objectStore('records');
      let failed = false;
      let remainingReads = prepared.length;
      const fail = error => {
        if (failed) return;
        failed = true;
        try { transaction.abort(); } catch {}
        reject(error);
      };
      transaction.oncomplete = () => {
        if (!failed) { this.#generation = nextGeneration; resolve(clone(envelope)); }
      };
      transaction.onabort = () => { if (!failed) reject(transaction.error ?? new Error('IndexedDB transaction aborted')); };
      transaction.onerror = () => { if (!failed) reject(transaction.error ?? new Error('IndexedDB transaction failed')); };
      const finishReads = () => {
        if (--remainingReads !== 0 || failed) return;
        try {
          const captureKey = captureRowKey(captureNamespace, captureCollection, captureId);
          envelope.rows = prepared.flatMap(({ namespace }) => capturedRows.get(namespace));
          store.put({ key: storageGenerationKey(), namespace: STORAGE_META_NAMESPACE, collection: STORAGE_META_COLLECTION,
            value: { id: STORAGE_GENERATION_ID, generation: nextGeneration } });
          store.add({ key: captureKey, namespace: captureNamespace, collection: captureCollection, value: clone(envelope) });
          for (const { namespace, rows } of prepared) {
            const request = store.index('namespace').openCursor(namespace);
            request.onsuccess = () => {
              try {
                const cursor = request.result;
                if (cursor) { cursor.delete(); cursor.continue(); }
                else for (const row of rows) store.put(row);
              } catch (error) { fail(error); }
            };
            request.onerror = () => fail(request.error ?? new Error('recovery namespace scan failed'));
          }
        } catch (error) { fail(error); }
      };
      const capturedRows = new Map();
      try {
        const generationRequest = store.get(storageGenerationKey());
        generationRequest.onsuccess = () => {
          try {
            if (generationOf(generationRequest.result) !== expectedGeneration) throw staleStorageError();
            if (!Number.isSafeInteger(nextGeneration)) throw new Error('storage generation exhausted');
          } catch (error) { fail(error); return; }
          for (const { namespace } of prepared) {
            const request = store.index('namespace').getAll(namespace);
            request.onsuccess = () => {
              try { capturedRows.set(namespace, request.result.map(row => clone(row))); finishReads(); }
              catch (error) { fail(error); }
            };
            request.onerror = () => fail(request.error ?? new Error('recovery namespace read failed'));
          }
        };
        generationRequest.onerror = () => fail(generationRequest.error ?? new Error('storage generation check failed'));
      } catch (error) { fail(error); }
    });
  }
  async import(examId, payload) {
    if (!payload || payload.version !== EXPORT_VERSION || payload.examId !== requireExamId(examId)) throw new Error('unsupported or mismatched export');
    for (const record of payload.records ?? []) await this.put(examId, 'progress', record.id, record);
    for (const event of payload.events ?? []) await this.put(examId, 'events', event.eventId, event);
    for (const [collection, records] of Object.entries(payload.collections ?? {})) {
      for (const record of records ?? []) await this.put(examId, collection, record.id, record.value);
    }
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
