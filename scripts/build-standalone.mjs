import { access, cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { deflateSync } from 'node:zlib';
import { createHash } from 'node:crypto';

const root = fileURLToPath(new URL('..', import.meta.url));

// Original StudyOS mark: static source is versioned here; generated PNGs need no network.
const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" role="img" aria-label="StudyOS"><rect width="512" height="512" rx="96" fill="#16324f"/><path d="M116 142h280v52H116zm0 88h210v52H116zm0 88h280v52H116z" fill="#f4f7f9"/><circle cx="376" cy="256" r="44" fill="#e0a458"/></svg>\n';
function png(size) {
  const chunk = (type, data) => {
    const body = Buffer.concat([Buffer.from(type), data]);
    let crc = 0xffffffff;
    for (const byte of body) { crc ^= byte; for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0); }
    const header = Buffer.alloc(4); header.writeUInt32BE(data.length);
    const trailer = Buffer.alloc(4); trailer.writeUInt32BE((crc ^ 0xffffffff) >>> 0);
    return Buffer.concat([header, body, trailer]);
  };
  const pixels = Buffer.alloc(size * (size * 3 + 1));
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const sx = (x + .5) * 512 / size, sy = (y + .5) * 512 / size;
    const bar = sx >= 116 && ((sy >= 142 && sy < 194 && sx < 396) || (sy >= 230 && sy < 282 && sx < 326) || (sy >= 318 && sy < 370 && sx < 396));
    const color = (sx - 376) ** 2 + (sy - 256) ** 2 <= 44 ** 2 ? [224, 164, 88] : bar ? [244, 247, 249] : [22, 50, 79];
    pixels.set(color, y * (size * 3 + 1) + 1 + x * 3);
  }
  const header = Buffer.alloc(13); header.writeUInt32BE(size, 0); header.writeUInt32BE(size, 4); header[8] = 8; header[9] = 2;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', header), chunk('IDAT', deflateSync(pixels)), chunk('IEND', Buffer.alloc(0))]);
}

// Independently reachable from a legacy cache: no imports, no storage writes.
const legacyUpdatePage = `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>StudyOS — Atualizar versão</title>
<style>body{font:1rem system-ui;max-width:42rem;margin:2rem auto;padding:1rem;color:#16324f}button,input{min-height:2.75rem}button{padding:.5rem 1rem}:focus-visible{outline:3px solid #16324f;outline-offset:3px}label{display:flex;align-items:center;gap:.75rem}p{line-height:1.6}</style></head>
<body><main><h1>Atualizar StudyOS</h1>
<p>Se a versão antiga não mostrar um aviso, abra <code>./update.html</code> dentro da pasta do aplicativo. Esta página verifica a nova versão sem alterar seus dados.</p>
<p>Antes de atualizar, pause e salve suas sessões no aplicativo e feche as outras abas StudyOS. Se a versão antiga não permitir pausar, conclua a atividade e confira se o progresso foi salvo.</p>
<button id="check" type="button">Verificar atualização</button>
<p id="status" role="status" aria-live="polite">Aguardando verificação.</p>
<label><input id="safe" type="checkbox">Pausei ou concluí e salvei todas as sessões e fechei as outras abas StudyOS.</label>
<button id="apply" type="button" disabled>Atualizar agora</button>
<p><a href="./">Voltar ao aplicativo</a></p></main>
<script>
(() => {
  const status = document.querySelector('#status'), check = document.querySelector('#check'), apply = document.querySelector('#apply'), safe = document.querySelector('#safe');
  const base = new URL('./', window.location.href);
  let registration, requested = false, navigated = false;
  const show = () => { apply.disabled = requested || !registration?.waiting || !safe.checked; if (registration?.waiting && !requested) status.textContent = 'Nova versão disponível. Confirme a pausa segura para atualizar.'; };
  safe.addEventListener('change', show);
  if (!('serviceWorker' in navigator)) { status.textContent = 'Service worker indisponível. Abra em HTTPS ou localhost.'; check.disabled = true; return; }
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (requested && !navigated) { navigated = true; window.location.assign(base.href); }
  });
  const watch = () => {
    const worker = registration.installing;
    worker?.addEventListener('statechange', () => { if (worker.state === 'installed') show(); });
    show();
  };
  check.addEventListener('click', async () => {
    check.disabled = true; status.textContent = 'Verificando atualização…';
    try {
      registration = await navigator.serviceWorker.getRegistration(base.href);
      if (!registration) registration = await navigator.serviceWorker.register(new URL('sw.js', base).href, { scope: base.href, updateViaCache: 'none' });
      if (registration.scope !== base.href) throw new Error('O service worker não pertence a esta pasta.');
      registration.addEventListener('updatefound', watch);
      watch(); await registration.update(); show();
      if (!registration.waiting) status.textContent = registration.installing ? 'Nova versão sendo preparada. Aguarde…' : 'Nenhuma atualização aguardando ativação.';
    } catch (error) { status.textContent = 'Não foi possível verificar: ' + error.message; }
    finally { check.disabled = false; }
  });
  apply.addEventListener('click', () => {
    if (requested || !registration?.waiting || !safe.checked || document.documentElement.dataset.studyActive === 'true') return;
    if (!window.confirm('Confirmar atualização? Todas as sessões devem estar pausadas ou concluídas e salvas, e as outras abas StudyOS fechadas.')) return;
    requested = true; apply.disabled = true; status.textContent = 'Atualizando…';
    try { registration.waiting.postMessage({ type: 'SKIP_WAITING' }); }
    catch (error) { requested = false; status.textContent = 'Não foi possível atualizar: ' + error.message; show(); }
  });
})();
</script></body></html>\n`;

export function validateBuildMetadata(metadata, schema) {
  for (const field of schema.required) if (!(field in metadata)) throw new TypeError(`missing build metadata field: ${field}`);
  for (const [field, value] of Object.entries(metadata)) {
    const rule = schema.properties[field];
    if (!rule) throw new TypeError(`unknown build metadata field: ${field}`);
    if (rule.type === 'integer' ? !Number.isInteger(value) : typeof value !== rule.type) throw new TypeError(`invalid build metadata field: ${field}`);
    if (rule.minLength && value.length < rule.minLength || rule.minimum && value < rule.minimum || rule.const !== undefined && value !== rule.const || rule.pattern && !new RegExp(rule.pattern).test(value)) throw new TypeError(`invalid build metadata field: ${field}`);
    if (rule.format === 'date-time' && !Number.isFinite(Date.parse(value))) throw new TypeError(`invalid build timestamp: ${field}`);
  }
  return metadata;
}

export async function buildStandalone(options = {}) {
  const repository = options.root ?? root;
  const examId = options.examId ?? process.env.STUDYOS_EXAM_ID ?? 'tce-go-ti-2026';
  if (!/^[a-z0-9-]+$/.test(examId)) throw new TypeError('invalid examId');
  const site = resolve(repository, 'sites', examId);
  const dist = resolve(options.dist ?? process.env.STUDYOS_DIST_DIR ?? resolve(site, 'dist'));
  const core = resolve(repository, 'core');
  const pack = resolve(repository, 'exam-packs', examId);
  const packManifest = JSON.parse(await readFile(resolve(pack, 'manifest.json'), 'utf8'));
  const appVersion = options.appVersion ?? process.env.STUDYOS_APP_VERSION ?? '1.0.0';
  const channel = options.channel ?? process.env.STUDYOS_CHANNEL ?? 'production';
  const commitSha = options.commitSha ?? process.env.GITHUB_SHA ?? 'local';
  const buildTimestamp = options.buildTimestamp ?? process.env.STUDYOS_BUILD_TIMESTAMP ?? new Date().toISOString();
  const buildId = options.buildId ?? process.env.STUDYOS_BUILD_ID ?? `${commitSha.slice(0, 12)}-${buildTimestamp.replace(/[^0-9]/g, '')}`;
  const emitted = new Set();
  const sources = new Map();
  const emit = async (name, data) => {
    await mkdir(dirname(resolve(dist, name)), { recursive: true });
    await writeFile(resolve(dist, name), data); emitted.add(name);
  };
  const copy = async (source, name) => {
    await mkdir(dirname(resolve(dist, name)), { recursive: true });
    await cp(source, resolve(dist, name)); emitted.add(name); sources.set(name, source);
  };
  const copyTree = async (source, prefix, accept) => {
    for (const entry of (await readdir(source, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name))) {
      if (entry.name === 'tests') continue;
      const name = `${prefix}/${entry.name}`;
      if (entry.isDirectory()) await copyTree(resolve(source, entry.name), name, accept);
      else if (accept(entry.name)) await copy(resolve(source, entry.name), name);
    }
  };
  for (const file of ['index.html', 'manifest.webmanifest', 'styles.css', 'app.js']) await copy(resolve(core, file), file);
  await copyTree(resolve(core, 'src'), 'core/src', () => true);
  try { await access(resolve(core, 'assets')); await copyTree(resolve(core, 'assets'), 'core/assets', (name) => /\.(svg|png|webp|json)$/i.test(name)); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
  try {
    await access(resolve(core, 'src/platform-shell.js'));
    const index = (await readFile(resolve(dist, 'index.html'), 'utf8')).replace('src="./src/platform-shell.js"', 'src="./core/src/platform-shell.js"');
    await emit('index.html', index);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    const index = (await readFile(resolve(dist, 'index.html'), 'utf8')).replace(/\s*<script type="module" src="\.\/src\/platform-shell\.js"><\/script>/, '');
    await emit('index.html', index);
  }
  // Curatorial drafts are never a public payload, even when empty in a new pack.
  await rm(resolve(dist, 'exam-pack', 'library-candidates.json'), { force: true });
  await copyTree(pack, 'exam-pack', (name) => name !== 'library-candidates.json' && /\.(json|png|svg|jpg|webp|pdf)$/i.test(name));
  for (const entry of await readdir(site, { withFileTypes: true })) if (entry.isFile() && /\.(html|js|mjs|css)$/.test(entry.name)) await copy(resolve(site, entry.name), entry.name);
  // Follow relative imports/assets so new nested runtime modules join the build automatically.
  for (const [name, source] of sources) {
    if (!/\.(js|mjs|html|css)$/.test(name)) continue;
    const text = await readFile(name === 'index.html' ? resolve(dist, name) : source, 'utf8');
    const refs = [...text.matchAll(/(?:\bfrom\s*|\bimport\s*(?:\(\s*)?|\b(?:src|href)\s*=\s*|\burl\(\s*)['"](\.[^'"#?]*)(?:[?#][^'"]*)?['"]/g)];
    for (const [, ref] of refs) {
      const destination = new URL(ref, `https://build.invalid/${name}`).pathname.slice(1);
      if (!destination || emitted.has(destination) || destination === 'sw.js' || destination === 'icon.svg' || destination.endsWith('/')) continue;
      const dependency = resolve(dirname(source), ref);
      if (relative(repository, dependency).startsWith('..')) throw new Error(`asset escapes repository: ${ref}`);
      await copy(dependency, destination);
    }
  }
  await emit('icon.svg', svg);
  for (const size of [192, 512]) await emit(`icon-${size}.png`, png(size));
  const manifest = JSON.parse(await readFile(resolve(dist, 'manifest.webmanifest'), 'utf8'));
  Object.assign(manifest, { id: './', start_url: './', scope: './', display: 'standalone', name: 'Nivelando Game — StudyOS', short_name: 'Nivelando Game', icons: [
    { src: './icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
    ...[192, 512].map((size) => ({ src: `./icon-${size}.png`, sizes: `${size}x${size}`, type: 'image/png', purpose: 'any maskable' }))
  ] });
  await emit('manifest.webmanifest', `${JSON.stringify(manifest, null, 2)}\n`);
  const metadata = { metadataVersion: 1, appVersion, buildId, commitSha, buildTimestamp, channel, examPackVersion: packManifest.version, schemaVersion: packManifest.schemaVersion, storageVersion: options.storageVersion ?? 2, examId: packManifest.examId };
  if (metadata.examId !== examId) throw new Error('pack manifest examId mismatch');
  validateBuildMetadata(metadata, JSON.parse(await readFile(resolve(repository, 'schemas/build-metadata.schema.json'), 'utf8')));
  await emit('build-meta.json', `${JSON.stringify(metadata, null, 2)}\n`);
  await emit('update.html', legacyUpdatePage);
  let index = await readFile(resolve(dist, 'index.html'), 'utf8');
  const versionedApp = `./site-app.js?v=${encodeURIComponent(buildId)}`;
  if (emitted.has('site-app.js')) index = index.includes('./site-app.js') ? index.replace(/\.\/site-app\.js(?:\?[^"']*)?/, versionedApp) : index.replace('</body>', `    <script type="module" src="${versionedApp}"></script>\n  </body>`);
  await emit('index.html', index);
  // Preserve the established release prefix; scope and build identify the cache.
  const namespace = `studyos-${examId.replace(/-ti-\d+$/, '')}-${channel}-${appVersion}-`;
  const revision = createHash('sha256').update(buildId).digest('hex').slice(0, 20);
  const shell = ['./', ...[...emitted].sort().map((name) => `./${name}`), ...(emitted.has('site-app.js') ? [versionedApp] : [])];
  const serviceWorker = `const CACHE_NAME = '${namespace}${revision}';
const CACHE_PREFIX = 'studyos-scope:' + encodeURIComponent(self.registration.scope) + ':';
const SCOPED_CACHE = CACHE_PREFIX + CACHE_NAME;
const APP_SHELL = ${JSON.stringify(shell)};
const SHELL_URLS = new Set(APP_SHELL.map((path) => new URL(path, self.registration.scope).href));
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(SCOPED_CACHE).then((cache) => cache.addAll(APP_SHELL)));
});
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') event.waitUntil(self.skipWaiting());
  if (event.data?.type === 'STUDYOS_HEALTH') event.ports?.[0]?.postMessage({ cacheName: SCOPED_CACHE, scope: self.registration.scope, buildId: ${JSON.stringify(buildId)}, appVersion: ${JSON.stringify(appVersion)}, channel: ${JSON.stringify(channel)} });
});
self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key.startsWith(CACHE_PREFIX) && key !== SCOPED_CACHE).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  const scope = new URL(self.registration.scope);
  if (event.request.method !== 'GET' || url.origin !== scope.origin || !url.pathname.startsWith(scope.pathname)) return;
  url.hash = '';
  const navigation = event.request.mode === 'navigate' && (url.pathname === scope.pathname || url.pathname === scope.pathname + 'index.html');
  const key = navigation ? new URL('./index.html', scope).href : url.href;
  if (!SHELL_URLS.has(key)) return;
  event.respondWith(caches.open(SCOPED_CACHE).then(async (cache) => {
    const cached = await cache.match(key);
    // Controlled clients must never mix new network content with this build's shell.
    return cached || new Response('StudyOS: conteúdo local indisponível. Reabra após atualizar.', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
  }));
});
`;
  await emit('sw.js', serviceWorker);
  return { dist, metadata, files: [...emitted] };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const result = await buildStandalone();
  console.log(`standalone build ready: ${result.dist}`);
}
