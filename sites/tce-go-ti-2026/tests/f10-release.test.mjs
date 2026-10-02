import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { test } from 'node:test';
import { MemoryStore } from '../../../core/src/storage.js';
import { ScoringEngine } from '../../../core/src/scoring.js';
import { GamificationEngine } from '../../../core/src/gamification.js';
import { validatePack } from '../../../core/src/factory.js';

const root = new URL('../../../', import.meta.url);
const packDir = new URL('../../../exam-packs/tce-go-ti-2026/', import.meta.url);
const distDir = new URL('../dist/', import.meta.url);
const readJson = async (base, file) => JSON.parse(await readFile(new URL(file, base), 'utf8'));
const readText = async (base, file) => readFile(new URL(file, base), 'utf8');

test('F10: build standalone mantém base path relativo e contrato PWA', async () => {
  const html = await readText(distDir, 'index.html');
  const manifest = await readJson(distDir, 'manifest.webmanifest');
  const sw = await readText(distDir, 'sw.js');
  assert.doesNotMatch(html, /(?:src|href)=["']\//, 'assets locais não podem usar raiz absoluta');
  assert.equal(manifest.start_url, './');
  assert.equal(manifest.scope, './');
  assert.equal(manifest.display, 'standalone');
  assert.equal(manifest.icons[0].src, './icon.svg');
  for (const asset of ['./site-app.js', './exam-pack/manifest.json', './exam-pack/curriculum.json']) assert.match(sw, new RegExp(asset.replaceAll('.', '\\.')));
});

test('F10: Exam Pack publicado é íntegro e igual ao pacote-fonte', async () => {
  const files = ['manifest.json', 'facts.json', 'source-map.json', 'curriculum.json', 'resources.json', 'questions.json', 'study-plan.json'];
  for (const file of files) assert.deepEqual(await readJson(distDir, `exam-pack/${file}`), await readJson(packDir, file), file);
  const manifest = await readJson(packDir, 'manifest.json');
  const curriculum = await readJson(packDir, 'curriculum.json');
  assert.doesNotThrow(() => validatePack(manifest, curriculum));
  const sourceMap = await readJson(packDir, 'source-map.json');
  const pdf = await readFile(new URL('../../../exam-packs/tce-go-ti-2026/edital-01-2026-oficial.pdf', import.meta.url));
  assert.equal(createHash('sha256').update(pdf).digest('hex').toUpperCase(), sourceMap.sources.find((item) => item.file?.endsWith('.pdf')).sha256);
});

test('F10: recursos externos verificados e questões têm proveniência', async () => {
  const resources = await readJson(packDir, 'resources.json');
  assert.ok(resources.length > 0);
  for (const resource of resources) {
    assert.match(resource.url, /^https:\/\//);
    assert.equal(resource.verified, true);
    assert.ok(resource.topicIds.length > 0);
    assert.ok(resource.source);
    assert.ok(resource.verifiedAt);
  }
  const questions = await readJson(packDir, 'questions.json');
  const fingerprints = questions.map((question) => question.fingerprint);
  assert.equal(new Set(fingerprints).size, fingerprints.length);
  for (const question of questions) {
    assert.equal(question.provenance.status, 'derived');
    assert.ok(question.provenance.source);
    assert.ok(question.year);
    assert.ok(question.board);
  }
});

test('F10: score histórico, retakes, XP idempotente e examId isolado', async () => {
  const store = new MemoryStore();
  const scoring = new ScoringEngine(store);
  const first = await scoring.submitAnswer({ examId: 'tce-go-ti-2026', simulationRunId: 'release', questionId: 'q1', correct: false });
  const retake = await scoring.submitAnswer({ examId: 'tce-go-ti-2026', simulationRunId: 'release', questionId: 'q1', correct: true });
  assert.equal(first.simulatedScore, 0);
  assert.equal(retake.simulatedScore, 0);
  assert.equal((await scoring.getFirstAttempt('tce-go-ti-2026', 'release', 'q1')).correct, false);
  assert.equal(await scoring.getScore('other-exam', 'release'), null);

  const gamification = new GamificationEngine(store);
  const event = { eventId: 'release-xp', type: 'question_answered', examId: 'tce-go-ti-2026', timestamp: '2026-10-02T00:00:00.000Z', payload: {} };
  assert.equal((await gamification.awardForEvent(event)).xp, 5);
  assert.equal((await gamification.awardForEvent(event)).xp, 0);
  assert.equal(await gamification.total('other-exam'), 0);

  await store.put('tce-go-ti-2026', 'progress', 'p1', { id: 'p1', mastery: 0.5 });
  const exported = await store.export('tce-go-ti-2026');
  await store.import('imported-exam', { ...exported, examId: 'imported-exam' });
  assert.deepEqual(await store.get('imported-exam', 'progress', 'p1'), { id: 'p1', mastery: 0.5 });
  assert.equal(await store.get('other-exam', 'progress', 'p1'), undefined);
});

test('F10: shell suporta refresh direto por hash, teclado e layout móvel', async () => {
  const html = await readText(distDir, 'index.html');
  const css = await readText(distDir, 'styles.css');
  for (const route of ['#today', '#plan', '#subjects', '#questions', '#reviews', '#progress']) assert.match(html, new RegExp(`href=["']${route}`));
  assert.match(html, /class="skip-link"/);
  assert.match(css, /:focus-visible/);
  assert.match(css, /@media\s*\(max-width:\s*42rem\)/);
  assert.match(css, /min-height:\s*2\.75rem/);
});

test('F10: não há vazamento de dados do edital dentro do Core', async () => {
  const coreFiles = ['core/index.html', 'core/app.js', 'core/styles.css', 'core/sw.js', 'core/manifest.webmanifest', 'core/src/storage.js', 'core/src/curriculum.js', 'core/src/scoring.js', 'core/src/revision.js', 'core/src/gamification.js', 'core/src/analytics.js', 'core/src/factory.js'];
  for (const file of coreFiles) {
    const content = await readText(root, file);
    assert.doesNotMatch(content, /tce-go|TCE-GO|FCC|Tecnologia da Informação|2026/, file);
  }
});
