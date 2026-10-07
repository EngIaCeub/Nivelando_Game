import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, access, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { buildStandalone } from '../build-standalone.mjs';

test('standalone omits library candidates from payload and service worker cache', async () => {
  const dist = await mkdtemp(join(tmpdir(), 'studyos-library-package-'));
  try {
    // Reusing an output from an earlier build must not retain a draft payload.
    await mkdir(join(dist, 'exam-pack'), { recursive: true });
    await writeFile(join(dist, 'exam-pack', 'library-candidates.json'), '[{"draft":true}]');
    await buildStandalone({ dist, buildTimestamp: '2026-10-06T12:00:00Z', commitSha: 'library-audit-check' });
    await access(join(dist, 'exam-pack', 'resources.json'));
    await assert.rejects(access(join(dist, 'exam-pack', 'library-candidates.json')), { code: 'ENOENT' });
    assert.ok(!(await readFile(join(dist, 'sw.js'), 'utf8')).includes('library-candidates.json'));
  } finally {
    assert.ok(dist.startsWith(join(tmpdir(), 'studyos-library-package-')));
    await rm(dist, { recursive: true, force: true });
  }
});
