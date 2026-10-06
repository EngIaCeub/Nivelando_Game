import assert from 'node:assert/strict';
import { test } from 'node:test';
import { IndexedDbStore } from '../src/storage.js';

const generationKey = '__studyos_meta__::system::generation';
const ABSENT_GET = Symbol('absent get');

async function withFakeIndexedDb({ get = () => ({ result: undefined, success: true }), locks = { request: async (_name, _options, callback) => callback() } } = {}, run) {
  const previousIndexedDb = globalThis.indexedDB;
  const previousNavigator = Object.getOwnPropertyDescriptor(globalThis, 'navigator');
  let writes = 0;
  const db = {
    transaction(_name, mode) {
      const transaction = {
        abort() { queueMicrotask(() => transaction.onabort?.()); },
        objectStore() {
          return {
            ...(get === ABSENT_GET ? {} : { get(key) { assert.equal(key, generationKey); return get(); } }),
            put() { writes++; return {}; },
            add() { writes++; return {}; },
            index() { return { getAll() { return { result: [], onsuccess: null }; } }; }
          };
        }
      };
      if (mode === 'readonly') {
        const request = get === ABSENT_GET ? undefined : get();
        queueMicrotask(() => {
          if (request && typeof request === 'object' && request.success !== false) {
            request.onsuccess?.();
            transaction.oncomplete?.();
          } else {
            request?.onerror?.();
            transaction.onerror?.();
          }
        });
        // The get() call inside objectStore must return the same request used for event delivery.
        transaction.objectStore = () => ({
          ...(get === ABSENT_GET ? {} : { get(key) { assert.equal(key, generationKey); return request; } }),
          put() { writes++; return {}; },
          add() { writes++; return {}; },
          index() { return { getAll() { return { result: [], onsuccess: null }; } }; }
        });
      }
      return transaction;
    }
  };
  globalThis.indexedDB = { open() {
    const request = { result: db };
    queueMicrotask(() => request.onsuccess());
    return request;
  } };
  Object.defineProperty(globalThis, 'navigator', { configurable: true, value: { locks } });
  try { await run(() => writes); }
  finally {
    globalThis.indexedDB = previousIndexedDb;
    if (previousNavigator) Object.defineProperty(globalThis, 'navigator', previousNavigator);
    else delete globalThis.navigator;
  }
}

for (const [name, faultyGet] of [
  ['missing get method', ABSENT_GET],
  ['synchronous get exception', () => { throw new Error('injected get failure'); }],
  ['invalid request', () => null],
  ['invalid generation value', () => ({ result: { value: { generation: 'zero' } } })]
]) {
  test(`O4 generation read fails closed on ${name}`, async () => {
    await withFakeIndexedDb({ get: faultyGet }, async writes => {
      const store = new IndexedDbStore({ name: `generation-${name}` });
      let callbackRan = false;
      await assert.rejects(store.withExclusiveMutation(() => { callbackRan = true; }), /generation|injected/i);
      assert.equal(callbackRan, false);
      assert.equal(writes(), 0);
    });
  });
}

test('O4 required cross-context lock fails closed when Web Locks is absent', async () => {
  await withFakeIndexedDb({ locks: null }, async writes => {
    const store = new IndexedDbStore({ name: 'generation-no-locks' });
    let callbackRan = false;
    await assert.rejects(store.withExclusiveMutation(() => { callbackRan = true; }, { requireCrossContext: true }), /coordenação segura/);
    assert.equal(callbackRan, false);
    assert.equal(writes(), 0);
  });
});
