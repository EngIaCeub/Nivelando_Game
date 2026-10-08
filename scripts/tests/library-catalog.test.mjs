import test from 'node:test';
import assert from 'node:assert/strict';
import { createLibraryCatalog } from '../../core/src/library-catalog.js';

const now = '2026-10-08T12:00:00Z';
function pack() {
  const resources = [
    { id: 'book', title: 'Open textbook', type: 'book', url: 'https://example.org/book', provider: 'University', language: 'en', access: { mode: 'free' }, topicIds: ['topic'], coverage: [{ unitId: 'unit', role: 'primary', extent: 'partial', locator: 'Chapter 1' }] },
    { id: 'docs', title: 'Official API docs', type: 'docs', url: 'https://example.org/docs', provider: 'Foundation', language: 'en', access: { mode: 'free' }, topicIds: ['topic'], coverage: [{ unitId: 'unit', role: 'primary', extent: 'partial', locator: 'Reference' }] }
  ];
  return {
    manifest: { examId: 'sample' }, sourceMap: { sources: [{ id: 'syllabus' }] },
    curriculum: { disciplines: [{ id: 'subject', title: 'Subject', modules: [{ title: 'Module', topics: [{ id: 'topic', title: 'Topic' }] }] }] },
    resources,
    library: {
      examId: 'sample', status: 'partial', scopeReview: { status: 'reviewed', reviewer: 'editor', reviewedAt: now, evidence: 'checked' },
      policy: { reviewIntervalDays: 90, freePrimaryRequired: true, allowRegistration: false },
      units: [{ id: 'unit', topicId: 'topic', title: 'Unit', learningObjectives: ['Read concepts', 'Apply parameters'], syllabusRefs: [{ source: 'syllabus', locator: 'Topic' }], prerequisiteUnitIds: [] }],
      studyPaths: [{ id: 'path', unitId: 'unit', title: 'Guided sequence', steps: [{ resourceId: 'book', objectiveIndices: [0], locator: 'Chapter 1' }, { resourceId: 'docs', objectiveIndices: [1], locator: 'API parameters' }], editorialReview: { status: 'approved', reviewer: 'editor', reviewedAt: now, evidence: 'Mapped' } }]
    }
  };
}

test('library catalog filters study paths by topic, search, format and language', () => {
  const catalog = createLibraryCatalog(pack(), { now });
  assert.deepEqual(catalog.filterPaths({ topicId: 'topic' }).map(path => path.id), ['path']);
  assert.deepEqual(catalog.filterPaths({ search: 'API parameters' }).map(path => path.id), ['path']);
  assert.deepEqual(catalog.filterPaths({ format: 'book' }).map(path => path.id), ['path']);
  assert.deepEqual(catalog.filterPaths({ language: 'pt-BR' }), []);
  assert.equal(catalog.resourceById.get('docs').title, 'Official API docs');
});
