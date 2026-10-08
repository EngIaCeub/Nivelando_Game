import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { test } from 'node:test';

const dist = new URL('../staging/', import.meta.url);
const text = (file) => readFile(new URL(file, dist), 'utf8');

test('O1.5 staging build has metadata, relative base path and preview identification', async () => {
  for (const file of ['index.html','manifest.webmanifest','sw.js','staging-meta.json','diagnostic.html','diagnostic.js','staging-diagnostics.html','exam-pack/manifest.json','exam-pack/curriculum.json']) assert.equal(existsSync(new URL(file, dist)), true, file);
  const html = await text('index.html');
  assert.match(html, /STAGING \/ PREVIEW/);
  assert.doesNotMatch(html, /(?:src|href)=["']\//);
  for (const route of ['#today','#curriculum','#diagnostic','#questions','#reviews','#progress','#settings']) assert.match(html, new RegExp(`href=["']${route}`));
});

test('O1.5 staging preview uses the production dark-only theme', async () => {
  const html = await text('index.html');
  const styles = await text('styles.css');
  assert.match(html, /name="theme-color" content="#101827"/);
  assert.match(styles, /color-scheme:\s*dark/);
  assert.match(styles, /--surface-base:\s*#101827/);
  assert.doesNotMatch(styles, /color-scheme:\s*light|--surface-base:\s*#f4f7f9|#f0fdf4|#fff1f2/);
});

test('O1.5 manifest and service worker are scoped relatively', async () => {
  const manifest = JSON.parse(await text('manifest.webmanifest'));
  const sw = await text('sw.js');
  const meta = JSON.parse(await text('staging-meta.json'));
  assert.equal(manifest.start_url, './');
  assert.equal(manifest.scope, './');
  assert.match(manifest.name, /STAGING/);
  assert.match(sw, /studyos-tce-go-staging-v1/);
  for (const asset of ['./diagnostic.html','./diagnostic.js','./staging-diagnostics.html','./staging-meta.json','./exam-pack/manifest.json']) assert.match(sw, new RegExp(asset.replaceAll('.', '\\.')));
  assert.equal(meta.buildVersion, 'o1.5-staging');
  assert.equal(meta.examId, 'tce-go-ti-2026');
});

test('O1.5 staging diagnostic page exposes accessible controls and no secrets', async () => {
  const html = await text('diagnostic.html');
  const js = await text('diagnostic.js');
  assert.match(html, /skip-link/);
  assert.match(html, /viewport/);
  assert.match(js, /DiagnosticUI/);
  assert.match(js, /IndexedDbStore/);
  assert.doesNotMatch(`${html}\n${js}`, /(ghp_[A-Za-z0-9]+|github_pat_[A-Za-z0-9_]+)/);
});
