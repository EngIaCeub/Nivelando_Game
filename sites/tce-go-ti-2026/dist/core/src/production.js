export const BACKUP_VERSION = 1;
export const BUILD_METADATA_VERSION = 1;

export function createBuildMetadata(input = {}) {
  const required = ['appVersion', 'buildId', 'commitSha', 'buildTimestamp', 'channel', 'examPackVersion', 'schemaVersion', 'storageVersion'];
  for (const field of required) if (input[field] === undefined || input[field] === null || input[field] === '') throw new TypeError(`missing build metadata field: ${field}`);
  return Object.freeze({ metadataVersion: BUILD_METADATA_VERSION, ...input });
}

export function createBackupPayload({ examId, exported, metadata, exportedAt = new Date().toISOString() } = {}) {
  if (!examId || !exported || exported.examId !== examId) throw new TypeError('backup requires a matching examId and export');
  return { backupVersion: BACKUP_VERSION, exportedAt, appVersion: metadata?.appVersion ?? 'unknown', storageVersion: metadata?.storageVersion ?? 'unknown', examId, data: structuredClone(exported) };
}

export function validateBackupPayload(payload, { examId } = {}) {
  if (!payload || payload.backupVersion !== BACKUP_VERSION || typeof payload.exportedAt !== 'string' || typeof payload.data !== 'object') throw new Error('backup inválido ou incompatível');
  if (examId && payload.examId !== examId) throw new Error('backup pertence a outro Exam Pack');
  const data = payload.data;
  if (data.version === undefined || data.examId !== payload.examId || !Array.isArray(data.records) || !Array.isArray(data.events) || typeof data.collections !== 'object') throw new Error('backup incompleto');
  const ids = new Set();
  for (const collection of Object.values(data.collections)) for (const record of collection ?? []) {
    if (!record || typeof record.id !== 'string' || record.value === undefined) throw new Error('backup contém registro inválido');
    const key = `${collection}:${record.id}`;
    if (ids.has(key)) throw new Error('backup contém IDs duplicados');
    ids.add(key);
  }
  const eventIds = new Set();
  for (const event of data.events) {
    if (!event?.eventId || eventIds.has(event.eventId)) throw new Error('backup contém eventos duplicados');
    eventIds.add(event.eventId);
  }
  return true;
}

export async function resetStore(store, examId) {
  const exported = await store.export(examId);
  for (const [collection, records] of Object.entries(exported.collections ?? {})) for (const record of records ?? []) await store.delete(examId, collection, record.id);
  return true;
}

export class MigrationRegistry {
  #migrations = new Map();
  register(from, to, migrate) {
    if (!Number.isInteger(from) || to !== from + 1 || typeof migrate !== 'function') throw new TypeError('migration must advance exactly one version');
    this.#migrations.set(from, migrate);
    return this;
  }
  async apply(value, from, to) {
    let current = structuredClone(value);
    for (let version = from; version < to; version += 1) {
      const migrate = this.#migrations.get(version);
      if (!migrate) throw new Error(`missing migration ${version} -> ${version + 1}`);
      current = await migrate(current);
    }
    return current;
  }
}
