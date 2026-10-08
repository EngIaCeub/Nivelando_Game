import test from 'node:test';
import assert from 'node:assert/strict';
import { ownerStorageName } from '../src/identity.js';

test('owner storage namespaces keep accounts separate and preserve the anonymous legacy database', () => {
  const first = ownerStorageName('pack-a', '2f0c5427-a58b-4cee-ae97-4bc9fdf2de31');
  const second = ownerStorageName('pack-a', 'f2c781b8-1f66-4f09-9614-511fbadd7045');
  assert.notEqual(first, second, 'different accounts never share local progress');
  assert.equal(first, ownerStorageName('pack-b', '2f0c5427-a58b-4cee-ae97-4bc9fdf2de31'), 'one account shares global mastery across Exam Packs');
  assert.equal(ownerStorageName('pack-a'), 'studyos-pack-a-v2');
  assert.notEqual(first, ownerStorageName('pack-a'));
  assert.throws(() => ownerStorageName('pack::a'), /examId inválido/);
  assert.throws(() => ownerStorageName('pack-a', 'user-name'), /ownerId inválido/);
});
