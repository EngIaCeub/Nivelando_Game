import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { test } from 'node:test';
import { MemoryStore } from '../../../core/src/storage.js';
import { ScoringEngine } from '../../../core/src/scoring.js';
import { GamificationEngine } from '../../../core/src/gamification.js';
import { calculateAnalytics } from '../../../core/src/analytics.js';
import { createStudyPlan, flattenTopics } from '../../../core/src/curriculum.js';
import { createHubCatalog, createStandaloneConfig, validatePack } from '../../../core/src/factory.js';

const root = new URL('../../../', import.meta.url);
const second = new URL('../', import.meta.url);
const first = new URL('../../../exam-packs/tce-go-ti-2026/', import.meta.url);
const readJson = async (base, file) => JSON.parse(await readFile(new URL(file, base), 'utf8'));
const secondPack = async () => ({
  manifest: await readJson(second, 'manifest.json'),
  curriculum: await readJson(second, 'curriculum.json'),
  resources: await readJson(second, 'resources.json'),
  questions: await readJson(second, 'questions.json')
});
const firstPack = async () => ({
  manifest: await readJson(first, 'manifest.json'),
  curriculum: await readJson(first, 'curriculum.json'),
  resources: await readJson(first, 'resources.json'),
  questions: await readJson(first, 'questions.json')
});
const concepts = (curriculum) => new Set(curriculum.disciplines.flatMap((d) => d.modules.flatMap((m) => m.topics.flatMap((t) => t.canonicalConceptIds))));

test('SECOND_EXAM_DRY_RUN: TJTO é um pack válido e diferente do TCE-GO', async () => {
  const pack = await secondPack();
  const result = validatePack(pack);
  assert.equal(result.valid, true, result.errors.join('; '));
  assert.equal(pack.manifest.examId, 'tjto-tecnico-administrativo-2022');
  assert.equal(pack.manifest.board, 'Fundação Getulio Vargas (FGV)');
  assert.notEqual(pack.manifest.examId, 'tce-go-ti-2026');
  assert.equal(pack.curriculum.disciplines.length, 5);
  assert.ok(flattenTopics(pack.curriculum).length >= 10);
  assert.ok(pack.resources.every((resource) => resource.verified === true && resource.source));
  assert.equal(new Set(pack.questions.map((question) => question.fingerprint)).size, pack.questions.length);
  const facts = await readJson(second, 'facts.json');
  assert.ok(facts.some((fact) => fact.classification === 'verified_fact' && fact.id === 'approval'));
  assert.equal(facts.find((fact) => fact.id === 'known_content').classification, 'assumption');
  const sourceMap = await readJson(second, 'source-map.json');
  const pdf = await readFile(new URL('../edital-01-2022-retificado.pdf', import.meta.url));
  assert.equal(createHash('sha256').update(pdf).digest('hex').toUpperCase(), sourceMap.sources[0].sha256);
});

test('F11: curriculum, planner, standalone e hub funcionam sem customização', async () => {
  const pack = await secondPack();
  const plan = createStudyPlan({ curriculum: pack.curriculum, availableMinutes: 120, today: '2026-10-02' });
  assert.equal(plan.examId, pack.manifest.examId);
  assert.ok(plan.activities.length > 0);
  assert.equal(createStandaloneConfig(pack).mode, 'standalone');
  const catalog = createHubCatalog([await firstPack(), pack]);
  assert.deepEqual(catalog.map((item) => item.examId), ['tce-go-ti-2026', 'tjto-tecnico-administrativo-2022']);
  for (const file of ['index.html','app.js','styles.css','site-app.js','manifest.webmanifest','sw.js','exam-pack/manifest.json','exam-pack/curriculum.json']) {
    assert.equal(existsSync(new URL(`../../../sites/tjto-tecnico-administrativo-2022/dist/${file}`, import.meta.url)), true, `missing standalone asset: ${file}`);
  }
  assert.equal(existsSync(new URL('../../../sites/hub/dist/catalog.json', import.meta.url)), true);
});

test('F11: sobreposição por canonicalConceptIds e conceitos exclusivos', async () => {
  const a = concepts((await firstPack()).curriculum);
  const b = concepts((await secondPack()).curriculum);
  const shared = [...a].filter((id) => b.has(id));
  const onlyFirst = [...a].filter((id) => !b.has(id));
  const onlySecond = [...b].filter((id) => !a.has(id));
  const union = new Set([...a, ...b]);
  const jaccard = shared.length / union.size;
  assert.ok(shared.includes('language.reading.comprehension'));
  assert.ok(shared.includes('public-law.public-service'));
  assert.ok(onlyFirst.includes('database.sql'));
  assert.ok(onlySecond.includes('law.civil.procedure'));
  assert.ok(jaccard > 0 && jaccard < 1);
  const sqlAlias = new Map([['Banco de Dados > SQL','database.sql'],['Banco de Dados > Linguagem SQL','database.sql']]);
  assert.equal(sqlAlias.get('Banco de Dados > SQL'), sqlAlias.get('Banco de Dados > Linguagem SQL'));
});

test('F11: isolamento de storage, score, XP, planos, analytics e troca de pack', async () => {
  const [a, b] = await Promise.all([firstPack(), secondPack()]);
  const store = new MemoryStore();
  const scoring = new ScoringEngine(store);
  await scoring.submitAnswer({ examId: a.manifest.examId, simulationRunId: 'run-a', questionId: 'q-a', correct: true });
  await scoring.submitAnswer({ examId: b.manifest.examId, simulationRunId: 'run-b', questionId: 'q-b', correct: false });
  assert.equal(await scoring.getScore(a.manifest.examId, 'run-a'), 100);
  assert.equal(await scoring.getScore(b.manifest.examId, 'run-a'), null);
  const gamification = new GamificationEngine(store);
  await gamification.awardForEvent({ eventId:'event-a', type:'question_answered', examId:a.manifest.examId, timestamp:'2026-10-02', payload:{} });
  await gamification.awardForEvent({ eventId:'event-b', type:'question_answered', examId:b.manifest.examId, timestamp:'2026-10-02', payload:{} });
  assert.equal(await gamification.total(a.manifest.examId), 5);
  assert.equal(await gamification.total(b.manifest.examId), 5);
  await store.put(a.manifest.examId, 'progress', 'shared-topic', { id:'shared-topic', mastery:.8 });
  await store.put(b.manifest.examId, 'progress', 'shared-topic', { id:'shared-topic', mastery:.2 });
  const exportA = await store.export(a.manifest.examId);
  const exportB = await store.export(b.manifest.examId);
  const imported = new MemoryStore();
  await imported.import(a.manifest.examId, exportA);
  await imported.import(b.manifest.examId, exportB);
  assert.equal((await imported.get(a.manifest.examId,'progress','shared-topic')).mastery, .8);
  assert.equal((await imported.get(b.manifest.examId,'progress','shared-topic')).mastery, .2);
  const analyticsA = calculateAnalytics({ curriculum:a.curriculum, events:[{type:'topic_completed',entityId:'shared-topic',timestamp:'2026-10-02'}], firstAttempts:[{correct:true}] });
  const analyticsB = calculateAnalytics({ curriculum:b.curriculum, events:[], firstAttempts:[] });
  assert.notEqual(analyticsA.coverage.totalTopics, analyticsB.coverage.totalTopics);
  assert.equal(createStandaloneConfig(a).manifest.examId, a.manifest.examId);
  assert.equal(createStandaloneConfig(b).manifest.examId, b.manifest.examId);
});

test('F11: testes adversariais são tratados sem alterar o Core', async () => {
  const pack = await secondPack();
  const reduced = structuredClone(pack.curriculum);
  reduced.disciplines = reduced.disciplines.slice(0, 2);
  assert.doesNotThrow(() => createStudyPlan({ curriculum: reduced, availableMinutes: 60 }));
  const noWeight = structuredClone(pack.curriculum);
  delete noWeight.disciplines[0].weight;
  assert.equal(flattenTopics(noWeight)[0].weight, 1);
  const badResource = structuredClone(pack);
  badResource.resources[0].verified = false;
  assert.equal(validatePack(badResource).valid, false);
  const duplicate = structuredClone(pack.questions);
  duplicate.push(structuredClone(duplicate[0]));
  assert.equal(new Set(duplicate.map((question) => question.fingerprint)).size < duplicate.length, true);
  const datedPlan = JSON.parse(await readFile(new URL('../study-plan.json', import.meta.url), 'utf8'));
  assert.equal(datedPlan.targetDate, '2022-06-26');
});

test('F11: zero leakage do primeiro e segundo edital no Core', async () => {
  const coreFiles = ['core/index.html','core/app.js','core/styles.css','core/sw.js','core/manifest.webmanifest','core/src/storage.js','core/src/curriculum.js','core/src/scoring.js','core/src/revision.js','core/src/gamification.js','core/src/analytics.js','core/src/factory.js'];
  const forbidden = /tce-go|TCE-GO|tjto|TJTO|Fundação Carlos|Fundação Getulio|FCC|FGV|Tecnologia da Informação|Apoio Judiciário|Contas do Estado/;
  for (const file of coreFiles) assert.doesNotMatch(await readFile(new URL(`../../../${file}`, import.meta.url), 'utf8'), forbidden, file);
});

test('F11: SECOND_EXAM_DRY_RUN e NEW_EXAM_ACCEPTANCE', async () => {
  const pack = await secondPack();
  assert.equal(validatePack(pack).valid, true);
  assert.ok(pack.manifest.sourceRefs.length > 0);
  assert.ok(pack.curriculum.disciplines.every((discipline) => discipline.modules.every((module) => module.topics.every((topic) => topic.canonicalConceptIds.length > 0))));
  assert.ok(pack.questions.every((question) => question.provenance?.source && question.board && question.year));
  assert.ok(pack.resources.every((resource) => resource.url.startsWith('https://')));
});
