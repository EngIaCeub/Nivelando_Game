import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
const ajv = new Ajv2020({ allErrors: true, strict: false }); addFormats(ajv);
const schema = JSON.parse(await readFile(new URL('../../schemas/resource.schema.json', import.meta.url), 'utf8'));
const validate = ajv.compile(schema);
function resource() {
  return { id: 'sample', examId: 'sample-exam', title: 'Book', type: 'book', topicIds: ['sample-topic'],
    url: 'https://example.org/book', verified: true, libraryVersion: 2, provider: 'University',
    authors: ['Author'], language: 'pt-BR', difficulty: 'beginner', estimatedMinutes: null, status: 'active',
    access: { mode: 'free', requiresRegistration: false, notes: '' },
    rights: { license: 'unknown', delivery: 'link', evidenceUrl: null },
    verification: { result: 'reachable', checkedAt: '2026-10-06T12:00:00Z', finalUrl: 'https://example.org/book', method: 'browser' },
    editorialReview: { status: 'pending', reviewer: null, reviewedAt: null, evidence: '' },
    coverage: [{ unitId: 'u', role: 'primary', extent: 'full', locator: 'Chapter 1' }],
    provenance: { sourceType: 'open-book', title: 'Book', url: 'https://example.org/book', retrievedAt: '2026-10-06', locator: 'Chapter 1' } };
}
test('resource schema preserves legacy and requires didactic metadata only for v2', () => {
  const legacy = { id: 'legacy', examId: 'sample-exam', title: 'Legacy', type: 'docs', topicIds: [], url: 'https://example.org', verified: true };
  assert.equal(validate(legacy), true);
  assert.equal(validate(resource()), true);
  const missing = resource(); delete missing.editorialReview;
  assert.equal(validate(missing), false);
});
test('resource schema rejects unsupported delivery, unsafe URL, bad date and missing locator', () => {
  const edits = [
    r => r.rights.delivery = 'bundle', r => r.url = 'javascript:alert(1)',
    r => r.verification.checkedAt = 'invalid', r => r.coverage[0].locator = ''
  ];
  for (const edit of edits) { const value = resource(); edit(value); assert.equal(validate(value), false); }
});
