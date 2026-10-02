import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { EventLog, MemoryStore } from '../src/storage.js';
import { createStudyPlan, flattenTopics, navigationTree } from '../src/curriculum.js';
import { ScoringEngine } from '../src/scoring.js';
import { RevisionEngine } from '../src/revision.js';
import { GamificationEngine } from '../src/gamification.js';
import { calculateAnalytics } from '../src/analytics.js';
import { createHubCatalog, createStandaloneConfig, validatePack } from '../src/factory.js';

const repoRoot = join(fileURLToPath(new URL('.', import.meta.url)), '..', '..');
const coreRoot = join(repoRoot, 'core');
const packsRoot = join(repoRoot, 'exam-packs');
const schemasRoot = join(repoRoot, 'schemas');

async function filesUnder(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await filesUnder(path));
    else files.push(path);
  }
  return files;
}

async function packSpecificStrings() {
  const packDirectories = (await readdir(packsRoot, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory() && entry.name !== '_template');
  const values = new Set();
  for (const directory of packDirectories) {
    const manifestPath = join(packsRoot, directory.name, 'manifest.json');
    const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
    for (const field of ['examId', 'title', 'organization', 'role', 'board']) {
      if (typeof manifest[field] === 'string' && manifest[field].trim()) {
        values.add(manifest[field].trim());
      }
    }
  }
  return [...values];
}

test('core does not contain strings identifying an Exam Pack', async () => {
  const forbidden = await packSpecificStrings();
  const sourceFiles = (await filesUnder(coreRoot))
    .filter((path) => /\.(m?js|c?js|ts|tsx|html|css|json|md)$/i.test(path));
  const leaks = [];

  for (const path of sourceFiles) {
    const content = await readFile(path, 'utf8');
    for (const value of forbidden) {
      if (content.includes(value)) {
        leaks.push(`${relative(repoRoot, path)} contains "${value}"`);
      }
    }
  }

  assert.deepEqual(leaks, [], `Exam Pack data leaked into core:\n${leaks.join('\n')}`);
});

test('schema files are valid JSON with a JSON Schema declaration', async () => {
  const schemaFiles = (await filesUnder(schemasRoot)).filter((path) => path.endsWith('.json'));
  assert.ok(schemaFiles.length > 0, 'at least one schema is required');
  for (const path of schemaFiles) {
    const schema = JSON.parse(await readFile(path, 'utf8'));
    assert.equal(typeof schema.$schema, 'string', `${relative(repoRoot, path)} lacks $schema`);
    assert.equal(typeof schema.title, 'string', `${relative(repoRoot, path)} lacks title`);
  }
});

test('F1 shell uses relative assets and exposes keyboard-friendly landmarks', async () => {
  const html = await readFile(join(coreRoot, 'index.html'), 'utf8');
  assert.match(html, /href="\.\/manifest\.webmanifest"/);
  assert.match(html, /src="\.\/app\.js"/);
  assert.match(html, /id="main-content"/);
  assert.match(html, /class="skip-link"/);
  assert.match(html, /aria-label="Navegação principal"/);
});

test('F2 event log is append-only and idempotent per eventId', async () => {
  const store = new MemoryStore();
  const log = new EventLog(store);
  const event = { eventId: 'event-1', type: 'topic_started', timestamp: '2026-01-01T00:00:00Z', examId: 'pack-a', entityId: 'topic-1', payload: {}, schemaVersion: 1 };
  assert.equal((await log.append(event)).appended, true);
  assert.equal((await log.append({ ...event, payload: { changed: true } })).appended, false);
  assert.deepEqual(await log.list('pack-a'), [event]);
  assert.deepEqual(await log.list('pack-b'), []);
});

test('F2 export/import preserves namespaced progress and events', async () => {
  const source = new MemoryStore();
  await source.put('pack-a', 'progress', 'p-1', { id: 'p-1', value: 3 });
  await new EventLog(source).append({ eventId: 'event-1', type: 'topic_completed', timestamp: '2026-01-01T00:00:00Z', examId: 'pack-a', entityId: 'topic-1', payload: {}, schemaVersion: 1 });
  const exported = await source.export('pack-a');
  const target = new MemoryStore();
  await target.import('pack-a', exported);
  assert.deepEqual(await target.get('pack-a', 'progress', 'p-1'), { id: 'p-1', value: 3 });
  assert.equal((await target.query('pack-a', 'events')).length, 1);
  assert.deepEqual(await target.query('pack-b', 'progress'), []);
});

test('F3 creates deterministic navigation and a priority-based plan', () => {
  const curriculum = {
    examId: 'pack-a',
    disciplines: [{ id: 'd-1', title: 'Discipline A', weight: 2, modules: [{
      id: 'm-1', title: 'Module A', topics: [
        { id: 't-low', title: 'Low', canonicalConceptIds: ['c-low'], estimatedMinutes: 20, priority: 1 },
        { id: 't-high', title: 'High', canonicalConceptIds: ['c-high'], estimatedMinutes: 30, priority: 3 }
      ]
    }]}]
  };
  assert.deepEqual(flattenTopics(curriculum).map((topic) => topic.id), ['t-low', 't-high']);
  assert.equal(navigationTree(curriculum)[0].modules[0].topics[1].id, 't-high');
  const plan = createStudyPlan({ curriculum, availableMinutes: 35, today: '2026-01-01' });
  assert.deepEqual(plan.activities.map((activity) => activity.topicId), ['t-high', 't-low']);
  assert.deepEqual(plan.activities.map((activity) => activity.minutes), [30, 5]);
});

test('F4 keeps first attempt immutable and excludes retakes from simulated score', async () => {
  const store = new MemoryStore();
  const scoring = new ScoringEngine(store);
  const base = { examId: 'pack-a', simulationRunId: 'run-1', questionId: 'q-1' };
  assert.equal((await scoring.submitAnswer({ ...base, correct: false, timestamp: '2026-01-01T00:00:00Z' })).simulatedScore, 0);
  assert.equal((await scoring.submitAnswer({ ...base, correct: true, timestamp: '2026-01-01T00:01:00Z' })).simulatedScore, 0);
  assert.deepEqual(await scoring.getFirstAttempt('pack-a', 'run-1', 'q-1'), {
    simulationRunId: 'run-1', questionId: 'q-1', correct: false, answeredAt: '2026-01-01T00:00:00Z', attempts: 1
  });
  assert.equal((await scoring.submitAnswer({ examId: 'pack-a', simulationRunId: 'run-1', questionId: 'q-2', correct: true })).simulatedScore, 50);
  assert.equal((await scoring.submitAnswer({ examId: 'pack-a', simulationRunId: 'run-2', questionId: 'q-1', correct: true })).simulatedScore, 100);
});

test('F5 schedules deterministic reviews and stores mastery separately', async () => {
  const store = new MemoryStore();
  const revisions = new RevisionEngine(store);
  const first = await revisions.review({ examId: 'pack-a', topicId: 'topic-1', quality: 4, reviewedAt: '2026-01-01T00:00:00.000Z' });
  assert.equal(first.mastery, 0.2);
  assert.equal(first.interval, 1);
  assert.equal(first.dueAt, '2026-01-02T00:00:00.000Z');
  const second = await revisions.review({ examId: 'pack-a', topicId: 'topic-1', quality: 0, reviewedAt: '2026-01-02T00:00:00.000Z' });
  assert.equal(second.mastery, 0.05);
  assert.equal(second.interval, 1);
  assert.equal(second.history.length, 2);
  assert.equal((await revisions.due('pack-a', '2026-01-03T00:00:00.000Z')).length, 1);
});

test('F6 awards XP only once per activity event and limits retake XP', async () => {
  const store = new MemoryStore();
  const gamification = new GamificationEngine(store);
  const event = { eventId: 'e-1', examId: 'pack-a', type: 'question_answered', timestamp: '2026-01-01T00:00:00Z', payload: {} };
  assert.equal((await gamification.awardForEvent(event)).xp, 5);
  assert.equal((await gamification.awardForEvent(event)).xp, 0);
  assert.equal((await gamification.awardForEvent({ ...event, eventId: 'e-2', payload: { isRetake: true } })).xp, 1);
  assert.equal((await gamification.awardForEvent({ ...event, eventId: 'e-3', type: 'reload' })).xp, 0);
  assert.equal(await gamification.total('pack-a'), 6);
  assert.equal((await gamification.snapshot('pack-a')).level, 1);
});

test('F7 calculates transparent analytics dimensions independently', () => {
  const curriculum = { examId: 'pack-a', disciplines: [{ id: 'd', title: 'D', modules: [{ id: 'm', title: 'M', topics: [{ id: 't-1', title: 'T1', canonicalConceptIds: [] }, { id: 't-2', title: 'T2', canonicalConceptIds: [] }] }]}] };
  const result = calculateAnalytics({
    curriculum,
    events: [
      { type: 'topic_completed', entityId: 't-1', timestamp: '2026-01-01T00:00:00Z' },
      { type: 'topic_completed', entityId: 't-1', timestamp: '2026-01-02T00:00:00Z' }
    ],
    firstAttempts: [{ correct: true }, { correct: false }],
    revisions: [{ mastery: 0.4, dueAt: '2025-12-31T00:00:00Z', history: [{ quality: 4 }, { quality: 2 }] }],
    now: '2026-01-03T00:00:00Z'
  });
  assert.equal(result.coverage.rate, 0.5);
  assert.equal(result.firstTryAccuracy.rate, 0.5);
  assert.equal(result.mastery.average, 0.4);
  assert.equal(result.retention.rate, 0.5);
  assert.equal(result.pace.activeDays, 2);
  assert.equal(result.forecast.dueReviews, 1);
});

test('F8 validates a generic pack and creates standalone/hub outputs', () => {
  const pack = {
    manifest: { examId: 'pack-a', title: 'Pack A', status: 'validated', sourceRefs: ['source-1'], buildModes: ['standalone', 'hub'] },
    curriculum: { examId: 'pack-a', disciplines: [{ id: 'd', title: 'D', modules: [{ id: 'm', title: 'M', topics: [{ id: 't', title: 'T', canonicalConceptIds: ['concept-1'] }] }]}] },
    resources: [{ id: 'r', examId: 'pack-a', title: 'Resource', type: 'docs', topicIds: ['t'], url: 'https://example.test/resource', verified: true }],
    questions: [{ id: 'q', examId: 'pack-a', stem: 'Question', options: [{ id: 'a', text: 'A' }, { id: 'b', text: 'B' }], correctOptionId: 'a', provenance: { status: 'verified', source: 'source-1' } }]
  };
  assert.deepEqual(validatePack(pack), { valid: true, errors: [] });
  assert.equal(createStandaloneConfig(pack).mode, 'standalone');
  assert.deepEqual(createHubCatalog([pack]), [{ examId: 'pack-a', title: 'Pack A', status: 'validated' }]);
  assert.equal(validatePack({ ...pack, questions: [{ ...pack.questions[0], provenance: { status: 'assumption', source: '' } }] }).valid, false);
});
