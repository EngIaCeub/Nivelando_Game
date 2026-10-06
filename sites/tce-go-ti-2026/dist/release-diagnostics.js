export async function inspectIndexedDB(api, metadata) {
  if (!api) return { available: false, status: 'unavailable' };
  if (!api.databases) return { available: true, status: 'enumeration-unsupported' };
  const name = `studyos-${metadata.examId}-v${metadata.storageVersion}`;
  // Enumeration does not create or upgrade a database. Never open an absent DB.
  const database = (await api.databases()).find((item) => item.name === name);
  if (!database) return { available: true, status: 'not-created', name };
  return new Promise((resolve) => {
    const request = api.open(name); // No version supplied: no requested migration.
    let settled = false;
    const finish = (result) => { if (!settled) { settled = true; clearTimeout(timeout); resolve(result); } };
    const timeout = setTimeout(() => finish({ available: true, status: 'timeout', name }), 2000);
    request.onupgradeneeded = () => request.transaction.abort(); // Deletion race.
    request.onerror = () => finish({ available: true, status: 'unreadable', name });
    request.onblocked = () => finish({ available: true, status: 'blocked', name });
    request.onsuccess = () => {
      const db = request.result;
      const stores = [...db.objectStoreNames], version = db.version;
      db.close();
      finish({ available: true, status: 'readable', name, version, stores });
    };
  });
}

export async function inspectWorker(worker) {
  if (!worker || typeof MessageChannel === 'undefined') return null;
  return new Promise((resolve) => {
    const channel = new MessageChannel();
    const finish = (value) => { clearTimeout(timeout); channel.port1.close(); channel.port2.close(); resolve(value); };
    const timeout = setTimeout(() => finish(null), 2000);
    channel.port1.onmessage = (event) => finish(event.data);
    try { worker.postMessage({ type: 'STUDYOS_HEALTH' }, [channel.port2]); }
    catch { finish(null); }
  });
}

export async function collectHealth({ base = new URL('./', import.meta.url), fetcher = fetch, nav = navigator, cacheStorage = globalThis.caches, idb = globalThis.indexedDB } = {}) {
  const readJSON = async (name) => {
    const response = await fetcher(new URL(name, base));
    if (!response.ok) throw new Error(`Não foi possível consultar ${name}: HTTP ${response.status}`);
    return response.json();
  };
  const [metadata, pack] = await Promise.all([readJSON('build-meta.json'), readJSON('exam-pack/manifest.json')]);
  const registration = await nav.serviceWorker?.getRegistration(base.href);
  const controller = nav.serviceWorker?.controller;
  const worker = await inspectWorker(controller ?? registration?.active);
  const cachePrefix = `studyos-scope:${encodeURIComponent(base.href)}:`;
  const cacheNames = cacheStorage ? (await cacheStorage.keys()).filter((name) => name.startsWith(cachePrefix)) : [];
  const indexedDB = await inspectIndexedDB(idb, metadata);
  const checks = [
    { check: 'metadata corresponde ao Exam Pack', passed: metadata.examId === pack.examId && metadata.examPackVersion === pack.version && metadata.schemaVersion === pack.schemaVersion },
    { check: 'base path do service worker', passed: registration?.scope === base.href },
    { check: 'worker controla esta versão', passed: Boolean(controller && worker?.buildId === metadata.buildId && worker?.appVersion === metadata.appVersion) },
    { check: 'cache desta versão', passed: Boolean(worker && cacheNames.includes(worker.cacheName)) },
    { check: 'IndexedDB disponível', passed: indexedDB.available && !['unreadable', 'blocked', 'timeout'].includes(indexedDB.status) }
  ];
  return { passed: checks.every((check) => check.passed), metadata, basePath: base.pathname, indexedDB,
    serviceWorker: { supported: Boolean(nav.serviceWorker), scope: registration?.scope ?? null, controlled: Boolean(controller), active: registration?.active?.state ?? null, waiting: registration?.waiting?.state ?? null, worker },
    cache: { supported: Boolean(cacheStorage), names: cacheNames }, checks };
}

if (typeof document !== 'undefined') {
  const output = document.querySelector('#output'), button = document.querySelector('#run');
  button?.addEventListener('click', async () => {
    button.disabled = true;
    try {
      const health = await collectHealth();
      output.textContent = JSON.stringify(health, null, 2);
      output.dataset.result = health.passed ? 'passed' : 'failed';
    } catch (error) {
      output.textContent = JSON.stringify({ passed: false, error: error.message }, null, 2);
      output.dataset.result = 'failed';
    } finally { button.disabled = false; }
  });
}
