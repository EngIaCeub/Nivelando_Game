import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
const dist = new URL('../dist/', import.meta.url);
const read = (file) => readFile(new URL(file, dist), 'utf8');
const readSource = (file) => readFile(new URL(`../../../exam-packs/tce-go-ti-2026/${file}`, import.meta.url), 'utf8');
test('O4 production build exposes versioned metadata and no preview markers', async () => {
  const metadata = JSON.parse(await read('build-meta.json'));
  const html = await read('index.html');
  const manifest = JSON.parse(await read('manifest.webmanifest'));
  const sw = await read('sw.js');
  assert.equal(metadata.appVersion, '1.0.0');
  assert.equal(metadata.channel, 'production');
  assert.equal(metadata.examPackVersion, '1.0.0');
  assert.equal(manifest.start_url, './');
  assert.equal(manifest.scope, './');
  assert.doesNotMatch(`${html}\n${manifest.name}`, /STAGING|PREVIEW BUILD/i);
  assert.match(sw, /studyos-tce-go-production-1\.0\.0/);
  assert.match(sw, /build-meta\.json/);
});

test('O4 production build includes backup, reset and update UX', async () => {
  const html = await read('index.html');
  const app = await read('site-app.js');
  const coreApp = await read('app.js');
  assert.match(html, /production-settings/);
  assert.match(app, /Exportar meus dados/);
  assert.match(app, /Importar backup/);
  assert.match(app, /RESETAR/);
  assert.match(coreApp, /Nova versão disponível/);
});

test('O4 content integrity matches the current approved source pack', async () => {
  const questions = JSON.parse(await read('exam-pack/questions.json'));
  const cards = JSON.parse(await read('exam-pack/flashcards.json'));
  const simulations = JSON.parse(await read('exam-pack/simulations.json'));
  const resources = JSON.parse(await read('exam-pack/resources.json'));
  const coverage = JSON.parse(await read('exam-pack/content-coverage.json'));
  assert.deepEqual(questions, JSON.parse(await readSource('questions.json')));
  assert.deepEqual(cards, JSON.parse(await readSource('flashcards.json')));
  assert.deepEqual(simulations, JSON.parse(await readSource('simulations.json')));
  assert.deepEqual(resources, JSON.parse(await readSource('resources.json')));
  assert.deepEqual(coverage, JSON.parse(await readSource('content-coverage.json')));
  assert.ok(questions.length > 0 && cards.cards.length > 0 && simulations.simulations.length > 0);
  assert.equal(coverage.topics.length, 45);
});
