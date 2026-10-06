const CACHE_NAME = 'studyos-tce-go-staging-v1-unavailable-';
const CACHE_PREFIX = 'studyos-scope:' + encodeURIComponent(self.registration.scope) + ':';
const SCOPED_CACHE = CACHE_PREFIX + CACHE_NAME;
const APP_SHELL = ["./","./app.js","./build-meta.json","./core/src/analytics.js","./core/src/curriculum.js","./core/src/diagnostic-ui.js","./core/src/diagnostics.js","./core/src/factory.js","./core/src/gamification.js","./core/src/index.js","./core/src/mastery.js","./core/src/mutation-context.js","./core/src/production.js","./core/src/revision.js","./core/src/scoring.js","./core/src/storage.js","./core/src/study-ui.js","./core/src/today-planner.js","./core/src/today-ui.js","./exam-pack/content-coverage.json","./exam-pack/curriculum.json","./exam-pack/edital-01-2026-oficial.pdf","./exam-pack/facts.json","./exam-pack/flashcards.json","./exam-pack/manifest.json","./exam-pack/questions.json","./exam-pack/resources.json","./exam-pack/simulations.json","./exam-pack/source-map.json","./exam-pack/study-plan.json","./icon-192.png","./icon-512.png","./icon.svg","./index.html","./manifest.webmanifest","./release-diagnostics.html","./release-diagnostics.js","./site-app.js","./styles.css","./update.html","./site-app.js?v=local-20261006041019225","./diagnostic.html","./diagnostic.js","./staging-diagnostics.html","./staging-meta.json"];
const SHELL_URLS = new Set(APP_SHELL.map((path) => new URL(path, self.registration.scope).href));
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(SCOPED_CACHE).then((cache) => cache.addAll(APP_SHELL)));
});
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') event.waitUntil(self.skipWaiting());
  if (event.data?.type === 'STUDYOS_HEALTH') event.ports?.[0]?.postMessage({ cacheName: SCOPED_CACHE, scope: self.registration.scope, buildId: "local-20261006041019225", appVersion: "1.0.0", channel: "production" });
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
