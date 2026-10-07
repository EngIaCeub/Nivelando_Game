import test from 'node:test';
import assert from 'node:assert/strict';
import { auditLibrary } from '../library-audit.mjs';
const now = '2026-10-06T12:00:00Z';
function fixture() {
  return {
    manifest: { examId: 'sample-exam' }, sourceMap: { sources: [{ id: 'sample-syllabus' }] },
    curriculum: { disciplines: [{ id: 'd', title: 'Sample subject', modules: [{ topics: [{ id: 't', title: 'Topic' }] }] }] },
    library: { examId: 'sample-exam', status: 'partial', scopeReview: { status: 'reviewed', reviewer: 'editor', reviewedAt: now, evidence: 'All syllabus items checked' },
      policy: { reviewIntervalDays: 90, freePrimaryRequired: true, allowRegistration: true },
      units: [{ id: 'u', topicId: 't', syllabusRefs: [{ source: 'sample-syllabus', locator: 'Section 1' }], prerequisiteUnitIds: [] }] },
    resources: [{ id: 'r', libraryVersion: 2, examId: 'sample-exam', status: 'active', verified: true,
      url: 'https://example.org/book', topicIds: ['t'], access: { mode: 'free', requiresRegistration: false },
      rights: { delivery: 'link', license: 'unknown', evidenceUrl: null },
      verification: { result: 'reachable', checkedAt: now },
      editorialReview: { status: 'approved', reviewer: 'editor', reviewedAt: now, evidence: 'Chapter 1 read and matched' },
      coverage: [{ unitId: 'u', role: 'primary', extent: 'full', locator: 'Chapter 1' }] }]
  };
}
test('coverage requires reviewed free primary material, not legacy or a reachable URL alone', () => {
  const pack = fixture();
  assert.equal(auditLibrary(pack, { now }).isComplete, true);
  pack.resources[0].editorialReview.status = 'pending';
  assert.equal(auditLibrary(pack, { now }).totals.coveredUnits, 0);
  pack.resources[0].libraryVersion = undefined;
  const result = auditLibrary(pack, { now });
  assert.equal(result.legacyResources, 1); assert.equal(result.isComplete, false);
});
test('partial, paid-only, stale, future and inaccessible resources leave coverage gaps', () => {
  const edits = [
    r => r.coverage[0].extent = 'partial', r => r.access.mode = 'paid',
    r => r.verification.checkedAt = '2020-01-01T00:00:00Z',
    r => r.verification.checkedAt = '2030-01-01T00:00:00Z',
    r => r.verification.result = 'blocked', r => r.editorialReview.reviewedAt = '2020-01-01T00:00:00Z'
  ];
  for (const edit of edits) { const pack = fixture(); edit(pack.resources[0]); assert.equal(auditLibrary(pack, { now }).isComplete, false); }
});
test('cross references, cycles, reuse rights and unsafe URLs are validation errors', () => {
  const edits = [
    p => p.resources[0].coverage[0].unitId = 'missing',
    p => p.resources[0].topicIds = ['other'],
    p => p.library.units[0].prerequisiteUnitIds = ['u'],
    p => p.resources.push(structuredClone(p.resources[0])),
    p => p.resources[0].rights.delivery = 'bundle',
    p => p.resources[0].url = 'javascript:alert(1)'
  ];
  for (const edit of edits) { const pack = fixture(); edit(pack); assert.ok(auditLibrary(pack, { now }).errors.length); }
});
test('complete claim requires reviewed scope and every curriculum topic represented', () => {
  const pack = fixture(); pack.library.status = 'complete';
  pack.curriculum.disciplines[0].modules[0].topics.push({ id: 'other' });
  const report = auditLibrary(pack, { now });
  assert.equal(report.isComplete, false); assert.deepEqual(report.missingUnitTopics, ['other']);
  assert.ok(report.errors.length);
  pack.curriculum.disciplines[0].modules[0].topics.pop(); pack.library.scopeReview.status = 'pending';
  assert.ok(auditLibrary(pack, { now }).errors.length);
});
test('audit does not mutate input or study state and respects registration policy', () => {
  const pack = fixture(); const before = JSON.stringify(pack);
  auditLibrary(pack, { now }); assert.equal(JSON.stringify(pack), before);
  pack.resources[0].access = { mode: 'registration', requiresRegistration: true };
  pack.library.policy.allowRegistration = false;
  assert.equal(auditLibrary(pack, { now }).isComplete, false);
});
test('free requirement and pilot disciplines are enforced, embed/bundle are deferred', () => {
  const pack = fixture(); pack.library.status = 'complete';
  pack.library.policy.freePrimaryRequired = false; pack.resources[0].access.mode = 'paid';
  assert.equal(auditLibrary(pack, { now }).isComplete, false);
  assert.ok(auditLibrary(pack, { now }).errors.length);
  const other = fixture(); other.library.pilotDisciplineIds = ['missing'];
  assert.ok(auditLibrary(other, { now }).errors.length);
  for (const delivery of ['embed', 'bundle']) {
    const local = fixture(); local.resources[0].rights = { delivery, license: 'CC-BY', evidenceUrl: 'https://example.org/license' };
    assert.ok(auditLibrary(local, { now }).errors.some(error => error.includes('deferred')));
  }
});
