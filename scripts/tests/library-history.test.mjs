import test from 'node:test';
import assert from 'node:assert/strict';
import { appendLibrarySnapshot } from '../../docs/content-review/expansion/archive-library-history.mjs';

const active = {
  examId: 'sample-exam', archivedAt: '2026-10-08T17:00:00.000Z', reason: 'Archive active catalog before promotion.',
  library: { units: [{ id: 'unit-current' }] },
  resources: [{ id: 'resource-current', status: 'active' }, { id: 'resource-removed', status: 'active' }]
};

test('library history migration preserves the prior snapshot and appends the full active inventory', () => {
  const legacy = { schemaVersion: 1, examId: 'sample-exam', library: { units: [{ id: 'unit-old' }] },
    resources: [{ id: 'resource-old' }] };
  const result = appendLibrarySnapshot(legacy, active);
  assert.equal(result.changed, true);
  assert.equal(result.history.snapshots.length, 2);
  assert.equal(result.history.snapshots[0].library.units[0].id, 'unit-old');
  assert.deepEqual(result.history.snapshots[1].library, active.library);
  assert.deepEqual(result.history.snapshots[1].resources.map(resource => resource.id), ['resource-current', 'resource-removed']);
  assert.ok(result.history.snapshots[1].resources.every(resource => resource.status === 'archived'));
});

test('archiving the same active state twice does not create duplicate history entries', () => {
  const once = appendLibrarySnapshot({ schemaVersion: 2, examId: 'sample-exam', snapshots: [] }, active);
  const twice = appendLibrarySnapshot(once.history, active);
  assert.equal(once.history.snapshots.length, 1);
  assert.equal(twice.changed, false);
  assert.equal(twice.history.snapshots.length, 1);
});
