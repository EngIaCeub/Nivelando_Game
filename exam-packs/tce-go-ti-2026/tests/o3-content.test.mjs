import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

const root = new URL('../', import.meta.url);
const load = async (name) => JSON.parse(await readFile(new URL(name, root), 'utf8'));
const curriculum = await load('curriculum.json');
const coverage = await load('content-coverage.json');
const resources = await load('resources.json');
const questions = await load('questions.json');
const flashcards = await load('flashcards.json');
const simulationsPack = await load('simulations.json');
const history = await load('content-history.json');

const topics = curriculum.disciplines.flatMap((discipline) => discipline.modules.flatMap((module) => module.topics.map((topic) => ({ ...topic, disciplineId: discipline.id }))));

test('Curadoria: 45 tópicos expõem contagens reais e lacunas', () => {
  assert.equal(topics.length, 45);
  assert.equal(coverage.topics.length, topics.length);
  for (const row of coverage.topics) {
    assert.ok(['P1', 'P2', 'P3', 'P4'].includes(row.priority));
    assert.ok(['EMPTY', 'LOW', 'MEDIUM', 'GOOD', 'STRONG'].includes(row.coverageStatus));
    assert.equal(row.resourceCount, resources.filter(r => r.topicIds.includes(row.topicId)).length);
    assert.equal(row.questionCount, questions.filter(q => q.topicIds.includes(row.topicId)).length);
    assert.equal(row.flashcardCount, flashcards.cards.filter(c => c.topicIds.includes(row.topicId)).length);
    assert.equal(row.coverageStatus, row.resourceCount + row.questionCount + row.flashcardCount ? 'LOW' : 'EMPTY');
    assert.match(row.exception, /parcial/i);
    if (!row.questionCount) assert.match(row.exception, /Sem questões/);
    assert.ok(row.canonicalConceptIds.length > 0);
  }
});

test('O3: recursos têm URL, proveniência, verificação e status de operação', () => {
  const ids = new Set();
  for (const resource of resources) {
    assert.equal(resource.examId, 'tce-go-ti-2026');
    assert.ok(!ids.has(resource.id), `resource duplicado: ${resource.id}`);
    ids.add(resource.id);
    assert.match(resource.url, /^https?:\/\//);
    assert.equal(resource.verified, true);
    assert.ok(resource.verifiedAt);
    assert.ok(['active', 'broken', 'removed', 'outdated', 'replaced'].includes(resource.status));
    assert.ok(resource.provenance?.sourceType);
    assert.ok(resource.provider);
    assert.ok(Array.isArray(resource.topicIds) && resource.topicIds.length > 0);
    assert.equal(resource.libraryVersion, 2);
    assert.equal(resource.editorialReview.status, 'approved');
    assert.ok(resource.editorialReview.reviewer && resource.editorialReview.reviewedAt);
    assert.ok(resource.coverage.every(c => ['partial', 'full'].includes(c.extent) && c.locator));
    assert.equal(resource.rights.delivery, 'link');
  }
});

test('O3: vídeos verificados têm metadados de curadoria', () => {
  const videos = resources.filter((resource) => resource.type === 'video');
  // No verified video was viewed in this review. Candidate metadata is not approval.
  assert.equal(videos.length, 0);
  for (const video of videos) {
    assert.equal(video.verified, true);
    assert.ok(video.videoChannel);
    assert.ok(video.videoPurpose);
    assert.ok(video.verifiedVideoAt);
  }
});

test('O3: questões passam os gates de unicidade, resposta, explicação e proveniência', () => {
  const ids = new Set();
  const fingerprints = new Set();
  const validDifficulty = new Set(['easy', 'medium', 'hard']);
  const validCognitive = new Set(['recall', 'understanding', 'application', 'analysis']);
  for (const question of questions) {
    assert.equal(question.examId, 'tce-go-ti-2026');
    assert.ok(!ids.has(question.id), `questionId duplicado: ${question.id}`);
    assert.ok(!fingerprints.has(question.fingerprint), `fingerprint duplicado: ${question.id}`);
    ids.add(question.id);
    fingerprints.add(question.fingerprint);
    assert.equal(question.options.length, 5);
    assert.equal(question.options.filter((option) => option.id === question.correctOptionId).length, 1);
    assert.ok(question.explanation && question.explanation.length > 30);
    assert.equal(Object.keys(question.explanationByOption).length, question.options.length);
    assert.ok(question.topicIds.length > 0);
    assert.ok(question.canonicalConceptIds.length > 0);
    assert.ok(validDifficulty.has(question.difficulty));
    assert.ok(validCognitive.has(question.cognitiveLevel));
    assert.equal(question.status, 'validated');
    assert.ok(question.provenance?.source);
    assert.ok(question.origin === 'generated_original' || question.provenance?.license);
    assert.equal(question.reviewStatus, 'approved');
    assert.equal(question.board, undefined);
    assert.equal(question.year, undefined);
    assert.ok(question.provenance.locator && question.sourceRefs.length);
    if (question.supersedes) assert.ok(history.questions.some(q => q.id === question.supersedes));
  }
});

test('O3: flashcards derivam conceitos sem substituir o banco de questões', () => {
  const topicIds = new Set(topics.map((topic) => topic.id));
  assert.ok(flashcards.cards.length >= topics.length);
  for (const card of flashcards.cards) {
    assert.ok(['concept_card', 'question_card', 'error_card', 'definition_card', 'comparison_card'].includes(card.type));
    assert.ok(card.front && card.back);
    assert.ok(card.topicIds.every((topicId) => topicIds.has(topicId)));
    assert.equal(card.reviewStatus, 'approved');
    assert.ok(card.provenance.locator && card.sourceRefs.length);
    assert.doesNotMatch(card.back, /deve ser estudado por meio de|^Explique /i);
    assert.ok(!history.cards.some(c => c.id === card.id));
  }
});

test('Curadoria: treino declara tamanho real e não oferece simulado completo sem conteúdo', () => {
  const ids = new Set(questions.map((question) => question.id));
  assert.ok(simulationsPack.simulations.length >= 1);
  const full = simulationsPack.simulations.find((simulation) => simulation.type === 'full-simulation');
  assert.equal(full, undefined);
  assert.ok(simulationsPack.gaps.length);
  assert.equal(history.simulations.simulations.length, 16);
  for (const simulation of simulationsPack.simulations) {
    assert.ok(simulation.pool);
    assert.ok(simulation.selection?.seed);
    assert.equal(simulation.status, 'validated');
    assert.equal(simulation.questionCount, simulation.questionIds.length);
    assert.ok(simulation.questionIds.every(id => ids.has(id)));
    assert.equal(new Set(simulation.questionIds).size, simulation.questionIds.length);
  }
});

test('O3: conteúdo é namespaced, utiliza canonicalConceptIds e não altera o Core', async () => {
  const coreText = await readFile(new URL('../../../core/src/index.js', import.meta.url), 'utf8');
  assert.equal(coreText.includes('tce-go'), false);
  assert.equal(coreText.includes('FCC'), false);
  assert.ok(resources.every((resource) => resource.examId === 'tce-go-ti-2026'));
  assert.ok(questions.every((question) => question.examId === 'tce-go-ti-2026'));
  assert.ok(flashcards.cards.every((card) => card.examId === 'tce-go-ti-2026'));
});
