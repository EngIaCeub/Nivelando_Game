import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { validatePack } from '../../../core/src/factory.js';

const packRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const load = async (name) => JSON.parse(await readFile(join(packRoot, name), 'utf8'));

test('F9 pack validates against the Core factory contract', async () => {
  const manifest = await load('manifest.json');
  const curriculum = await load('curriculum.json');
  const resources = await load('resources.json');
  const questions = await load('questions.json');
  const result = validatePack({ manifest, curriculum, resources, questions });
  assert.deepEqual(result, { valid: true, errors: [] });
  assert.equal(manifest.examId, 'tce-go-ti-2026');
  assert.equal(manifest.status, 'validated');
});

test('F9 curriculum has stable unique IDs and reusable canonical concepts', async () => {
  const curriculum = await load('curriculum.json');
  const disciplines = curriculum.disciplines;
  assert.equal(disciplines.length, 14);
  const ids = [];
  const concepts = [];
  for (const discipline of disciplines) {
    ids.push(discipline.id);
    for (const module of discipline.modules) {
      ids.push(module.id);
      for (const topic of module.topics) {
        ids.push(topic.id);
        concepts.push(...topic.canonicalConceptIds);
      }
    }
  }
  assert.equal(new Set(ids).size, ids.length);
  assert.ok(concepts.includes('database.sql'));
  assert.ok(concepts.includes('security.cryptography'));
});

test('F9 critical facts are sourced and assumptions are explicit', async () => {
  const facts = await load('facts.json');
  const sourceMap = await load('source-map.json');
  const sources = new Set(sourceMap.sources.map((source) => source.id));
  for (const fact of facts.facts) {
    assert.ok(['verified_fact', 'derived', 'assumption'].includes(fact.classification));
    if (fact.classification !== 'assumption') assert.ok(sources.has(fact.sourceRef), fact.id);
  }
  const criticalAssumptions = facts.facts.filter((fact) => fact.classification === 'assumption' && ['cargo', 'specialty', 'education', 'examDate', 'exam_date', 'vacancies_total'].includes(fact.id));
  assert.deepEqual(criticalAssumptions, []);
  assert.equal(facts.facts.find((fact) => fact.id === 'known_content').classification, 'assumption');
});

test('F9 resources are checked and questions are original, sourced and deduplicated', async () => {
  const resources = await load('resources.json');
  const questions = await load('questions.json');
  assert.ok(resources.length >= 10);
  assert.ok(resources.every((resource) => resource.verified === true && resource.verifiedAt && resource.source && resource.topicIds.length > 0));
  assert.equal(new Set(questions.map((question) => question.fingerprint)).size, questions.length);
  assert.ok(questions.every((question) => !question.board && !question.year && question.origin === 'generated_original' && question.reviewStatus === 'approved' && question.provenance.status === 'derived' && question.provenance.license.includes('original StudyOS')));
  assert.ok(questions.every((question) => question.options.some((option) => option.id === question.correctOptionId)));
});

test('F9 official source hash matches the stored source map', async () => {
  const sourceMap = await load('source-map.json');
  const official = sourceMap.sources.find((source) => source.id === 'official-edital-01-2026');
  const pdf = await readFile(join(packRoot, official.file));
  assert.equal(createHash('sha256').update(pdf).digest('hex').toUpperCase(), official.sha256);
});

test('F9 study plan is two-hour, date-aware and explains priorities', async () => {
  const plan = await load('study-plan.json');
  assert.equal(plan.dailyMinutes, 120);
  assert.equal(plan.targetDate, '2027-01-17');
  assert.equal(plan.priorityExplanations.length, 14);
  assert.ok(plan.weeklyTemplate.some((day) => day.activities.some((activity) => activity.includes('simulado'))));
  assert.ok(plan.weeklyTemplate.some((day) => day.activities.some((activity) => activity.includes('revisão'))));
});

test('F9 standalone demo references only relative assets and includes the pack payload', async () => {
  const html = await readFile(join(packRoot, '..', '..', 'sites', 'tce-go-ti-2026', 'dist', 'index.html'), 'utf8');
  const siteApp = await readFile(join(packRoot, '..', '..', 'sites', 'tce-go-ti-2026', 'dist', 'site-app.js'), 'utf8');
  const distManifest = await readFile(join(packRoot, '..', '..', 'sites', 'tce-go-ti-2026', 'dist', 'exam-pack', 'manifest.json'), 'utf8');
  assert.match(html, /\.\/app\.js/);
  assert.match(html, /\.\/site-app\.js/);
  assert.match(siteApp, /\.\/exam-pack\/manifest\.json/);
  assert.equal(JSON.parse(distManifest).examId, 'tce-go-ti-2026');
});

test('NEW_EXAM_ACCEPTANCE: pack is structurally valid without Core-specific changes', async () => {
  const manifest = await load('manifest.json');
  const facts = await load('facts.json');
  const curriculum = await load('curriculum.json');
  const resources = await load('resources.json');
  const questions = await load('questions.json');
  const plan = await load('study-plan.json');
  assert.ok(manifest.sourceRefs.length > 0);
  assert.equal(facts.facts.filter((fact) => fact.classification === 'assumption' && fact.sourceRef).length, 0);
  assert.ok(curriculum.disciplines.every((discipline) => discipline.modules.every((module) => module.topics.every((topic) => topic.canonicalConceptIds.length > 0))));
  assert.ok(resources.every((resource) => resource.examId === manifest.examId && resource.verified === true));
  assert.ok(questions.every((question) => question.examId === manifest.examId && question.provenance.source));
  assert.equal(plan.examId, manifest.examId);
  assert.equal(manifest.status, 'validated');
});
