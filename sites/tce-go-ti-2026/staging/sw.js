const CACHE_NAME = 'studyos-tce-go-staging-v1';
const APP_SHELL = [
  './', './index.html', './styles.css', './app.js', './site-app.js',
  './manifest.webmanifest', './icon.svg', './release-diagnostics.html', './release-diagnostics.js', './o1-diagnostics.html', './o1-diagnostics.js', './diagnostic.html', './diagnostic.js', './staging-diagnostics.html', './staging-meta.json',
  './core/src/storage.js', './core/src/scoring.js', './core/src/gamification.js', './core/src/mastery.js', './core/src/diagnostics.js', './core/src/diagnostic-ui.js',
  './exam-pack/manifest.json', './exam-pack/facts.json', './exam-pack/source-map.json',
  './exam-pack/curriculum.json', './exam-pack/resources.json', './exam-pack/questions.json',
  './exam-pack/study-plan.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request)));
});
