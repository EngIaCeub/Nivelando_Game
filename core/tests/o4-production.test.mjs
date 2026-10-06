import assert from 'node:assert/strict';
import { test } from 'node:test';
import { MemoryStore } from '../src/storage.js';
import { createBackupPayload, validateBackupPayload, resetStore, MigrationRegistry, createBuildMetadata } from '../src/production.js';

test('O4 production metadata and migration registry are deterministic', async () => {
  const metadata = createBuildMetadata({ appVersion: '1.0.0', buildId: 'test-build', commitSha: 'local', buildTimestamp: '2026-10-02T00:00:00.000Z', channel: 'production', examPackVersion: '1.0.0', schemaVersion: 1, storageVersion: 2 });
  assert.equal(metadata.metadataVersion, 1);
  const migrations = new MigrationRegistry().register(1, 2, (value) => ({ ...value, migrated: true }));
  assert.deepEqual(await migrations.apply({ value: 1 }, 1, 2), { value: 1, migrated: true });
});

test('O4 backup round-trip validates and reset is explicit at the store layer', async () => {
  const store = new MemoryStore();
  await store.put('exam-a', 'progress', 'p1', { id: 'p1', mastery: .5 });
  await store.put('exam-a', 'events', 'e1', { eventId: 'e1', type: 'topic_started', examId: 'exam-a', timestamp: '2026-10-02T00:00:00.000Z', entityId: 'p1', payload: {}, schemaVersion: 1 });
  const payload = createBackupPayload({ examId: 'exam-a', exported: await store.export('exam-a'), metadata: { appVersion: '1.0.0', storageVersion: 2 }, exportedAt: '2026-10-02T00:00:00.000Z' });
  assert.equal(validateBackupPayload(payload, { examId: 'exam-a' }), true);
  await store.import('exam-b', { ...payload.data, examId: 'exam-b' });
  assert.deepEqual(await store.get('exam-b', 'progress', 'p1'), { id: 'p1', mastery: .5 });
  assert.throws(() => validateBackupPayload({ ...payload, examId: 'exam-b' }, { examId: 'exam-a' }), /outro Exam Pack/);
  await resetStore(store, 'exam-a');
  assert.equal((await store.export('exam-a')).collections?.progress?.length ?? 0, 0);
});

test('O4 rejects malformed and duplicate-event backups without mutation', async () => {
  assert.throws(() => validateBackupPayload({ backupVersion: 1, exportedAt: 'now', examId: 'exam-a', data: { version: 1, examId: 'exam-a', records: [], events: [{ eventId: 'e1' }, { eventId: 'e1' }], collections: {} } }, { examId: 'exam-a' }), /duplicados/);
  assert.throws(() => validateBackupPayload({ backupVersion: 99 }, { examId: 'exam-a' }), /inválido/);
});
