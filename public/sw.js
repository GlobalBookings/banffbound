const CACHE_NAME = 'banffbound-v2';
const OFFLINE_URL = '/404';

const PRECACHE_URLS = [
  '/',
  '/hiking',
  '/hotels',
  '/weather',
  '/skiing',
  '/trip-builder',
  '/tools',
  '/trail-map',
  '/eat-and-drink',
  '/404',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k.startsWith('banffbound-v') && k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // The companion app owns its narrower worker and complete offline packs.
  if (new URL(event.request.url).pathname.startsWith('/app/')) return;
  if (event.request.mode !== 'navigate') return;
  event.respondWith(
    fetch(event.request).catch(() =>
      caches.match(event.request).then((cached) => cached || caches.match(OFFLINE_URL))
    )
  );
});
