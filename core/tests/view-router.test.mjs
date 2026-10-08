import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveViewRoute, showActiveView } from '../src/view-router.js';

test('hash routes preserve curriculum/library deep links and fall back safely', () => {
  const ids = ['today', 'subjects', 'library', 'questions'];
  assert.equal(resolveViewRoute('#today', ids), 'today');
  assert.equal(resolveViewRoute('#region-networking', ids), 'subjects');
  assert.equal(resolveViewRoute('#curriculum', ids), 'subjects');
  assert.equal(resolveViewRoute('#library?topic=networks', ids), 'library');
  assert.equal(resolveViewRoute('#unknown', ids), 'today');
});

test('only one section is exposed to navigation and assistive technology', () => {
  const sections = [{ id: 'today', hidden: false }, { id: 'library', hidden: false }, { id: 'progress', hidden: false }];
  assert.equal(showActiveView(sections, 'library'), 'library');
  assert.deepEqual(sections.map(section => !section.hidden), [false, true, false]);
  assert.equal(showActiveView(sections, 'missing'), null);
  assert.deepEqual(sections.map(section => section.hidden), [true, true, true]);
});
