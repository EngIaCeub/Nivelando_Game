import test from 'node:test';
import assert from 'node:assert/strict';
import { reconcileSourceMap, reconcileStudyPathResourceIds, sourceVerification } from './staging-metadata.mjs';

test('staging does not turn missing link evidence into GET/reachable', () => {
  assert.deepEqual(sourceVerification({ checkedAt: '2026-10-08' }), {
    result: 'unknown', checkedAt: '2026-10-08T00:00:00.000Z', finalUrl: null, method: 'unknown'
  });
  assert.deepEqual(sourceVerification({ verification: { result: 'unknown', checkedAt: null, finalUrl: null, method: 'unknown' } }), {
    result: 'unknown', checkedAt: null, finalUrl: null, method: 'unknown'
  });
});

test('staging preserves only complete, observed reachability metadata', () => {
  const previous = { verification: { result: 'reachable', checkedAt: '2026-10-08T10:00:00Z', finalUrl: 'https://example.org/final', method: 'GET' } };
  assert.deepEqual(sourceVerification({ url: 'https://example.org' }, previous), {
    result: 'reachable', checkedAt: '2026-10-08T10:00:00.000Z', finalUrl: 'https://example.org/final', method: 'GET'
  });
  assert.deepEqual(sourceVerification({ verification: { result: 'reachable', checkedAt: '2026-10-08', finalUrl: null, method: 'GET' } }), {
    result: 'unknown', checkedAt: '2026-10-08T00:00:00.000Z', finalUrl: null, method: 'unknown'
  });
});

test('source map refreshes staged URLs and locators while preserving unrelated records', () => {
  const actual = reconcileSourceMap({ examId: 'sample', sources: [
    { id: 'source-a', url: 'https://old.example', locator: 'stale', file: null },
    { id: 'unrelated', url: 'https://unrelated.example', locator: 'retain', file: null }
  ] }, [{ id: 'source-a', provenance: {
    sourceType: 'docs', title: 'Current title', url: 'https://new.example', retrievedAt: '2026-10-08', locator: '§2'
  } }]);
  assert.deepEqual(actual.sources, [
    { id: 'unrelated', url: 'https://unrelated.example', locator: 'retain', file: null },
    { id: 'source-a', sourceType: 'docs', title: 'Current title', url: 'https://new.example', retrievedAt: '2026-10-08', locator: '§2', file: null }
  ]);
});

test('study paths resolve source review IDs to canonical resource IDs', () => {
  const actual = reconcileStudyPathResourceIds([{
    id: 'path', unitId: 'unit', title: 'Sequence',
    steps: [
      { resourceId: 'review-source', objectiveIndices: [0], locator: '§1' },
      { resourceId: 'already-canonical', objectiveIndices: [0], locator: '§2' }
    ]
  }], new Map([['review-source', 'canonical-resource']]));
  assert.deepEqual(actual[0].steps.map(step => step.resourceId), ['canonical-resource', 'already-canonical']);
});
