const CACHE_NAME = 'studyos-tjto-f11-v1';
const APP_SHELL = ['./','./index.html','./styles.css','./app.js','./site-app.js','./manifest.webmanifest','./exam-pack/manifest.json','./exam-pack/curriculum.json'];
self.addEventListener('install', (event) => { event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))); self.skipWaiting(); });
self.addEventListener('activate', (event) => { event.waitUntil(self.clients.claim()); });
self.addEventListener('fetch', (event) => { event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request))); });
