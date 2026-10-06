import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const source = resolve(root, 'sites/tce-go-ti-2026/dist');
const staging = resolve(root, 'sites/tce-go-ti-2026/staging');
const repository = process.env.GITHUB_REPOSITORY?.split('/').at(-1) ?? '';
const commitSha = process.env.GITHUB_SHA ?? 'unavailable-local-snapshot';
const buildTimestamp = process.env.STAGING_BUILD_TIMESTAMP ?? new Date().toISOString();
const cacheName = `studyos-tce-go-staging-v1-${commitSha.slice(0, 12).replace(/[^a-zA-Z0-9-]/g, 'local')}`;
await rm(staging, { recursive: true, force: true });
await mkdir(staging, { recursive: true });
await cp(source, staging, { recursive: true });
await cp(resolve(root, 'sites/tce-go-ti-2026/staging-source/diagnostic.html'), resolve(staging, 'diagnostic.html'));
await cp(resolve(root, 'sites/tce-go-ti-2026/staging-source/diagnostic.js'), resolve(staging, 'diagnostic.js'));
await cp(resolve(root, 'sites/tce-go-ti-2026/staging-source/staging-diagnostics.html'), resolve(staging, 'staging-diagnostics.html'));
const indexPath = resolve(staging, 'index.html');
const index = await readFile(indexPath, 'utf8');
const stagingNav = '<nav aria-label="Staging navigation"><a href="#today">Hoje</a> <a href="#curriculum">Currículo</a> <a href="#diagnostic">Diagnóstico</a> <a href="#questions">Questões</a> <a href="#reviews">Revisões</a> <a href="#progress">Progresso</a> <a href="#settings">Configurações</a></nav>';
const previewSections = {
  curriculum: '<section id="curriculum" class="card"><h2>Currículo</h2><p><a href="#subjects">Abrir currículo do Exam Pack ativo</a>.</p></section>',
  diagnostic: '<section id="diagnostic" class="card"><h2>Diagnóstico</h2><p><a href="./diagnostic.html">Abrir diagnóstico O1 isolado da prévia</a>.</p></section>',
  settings: '<section id="settings" class="card"><h2>Configurações</h2><p>Preferências da prévia.</p></section>',
};
const stagingSections = Object.entries(previewSections).filter(([id]) => !index.includes(`id="${id}"`)).map(([, section]) => section).join('');
await writeFile(indexPath, index.replace('<body>', '<body><div class="staging-ribbon" role="status">STAGING / PREVIEW</div>').replace('<header', `${stagingNav}<header`).replace('</main>', `${stagingSections}</main>`));
const stylesPath = resolve(staging, 'styles.css');
const styles = await readFile(stylesPath, 'utf8');
await writeFile(stylesPath, `${styles}\n.staging-ribbon { padding: .35rem 1rem; color: #fff; background: #7c2d12; font-weight: 700; text-align: center; }\nnav[aria-label="Staging navigation"] { display: flex; flex-wrap: wrap; gap: .75rem; padding: .75rem 1rem; }\n`);
const manifestPath = resolve(staging, 'manifest.webmanifest');
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
manifest.name = 'StudyOS — STAGING / PREVIEW — TCE-GO TI 2026';
manifest.short_name = 'StudyOS STAGING';
manifest.id = './';
await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
const swPath = resolve(staging, 'sw.js');
const sw = await readFile(swPath, 'utf8');
const shellMatch = sw.match(/const APP_SHELL = (\[[^\n]+\]);/);
if (!shellMatch) throw new Error('Standalone service worker APP_SHELL format unsupported; refusing incomplete preview cache.');
const previewShell = [...new Set([...JSON.parse(shellMatch[1]), './diagnostic.html', './diagnostic.js', './staging-diagnostics.html', './staging-meta.json'])];
await writeFile(swPath, sw.replace(/const CACHE_NAME = '[^']+'/g, `const CACHE_NAME = '${cacheName}'`).replace(shellMatch[0], `const APP_SHELL = ${JSON.stringify(previewShell)};`));
await writeFile(resolve(staging, 'staging-meta.json'), `${JSON.stringify({ buildVersion: 'o1.5-staging', commitSha, buildTimestamp, repository: repository || 'unavailable-local-repository', examId: 'tce-go-ti-2026', schemaVersions: 'mastery:1, diagnostic-run:1', storageVersion: 1, basePath: repository ? `/${repository}/` : './' }, null, 2)}\n`);
if (!repository) console.warn('GITHUB_REPOSITORY unavailable; local preview metadata uses relative base path.');
console.log(`staging build ready: ${staging}`);
