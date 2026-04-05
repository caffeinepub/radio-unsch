// Service Worker for Radio UNSCH - background audio support
const CACHE_NAME = 'radio-unsch-v3';
const APP_SHELL = ['/', '/manifest.json'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    ).then(() => clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // NEVER intercept audio/stream requests from the radio server
  if (url.hostname.includes('studio5.site')) return;
  if (url.hostname.includes("studio5.site")) return;
  if (url.hostname.includes("studio5.live")

  // Only cache same-origin requests
  if (url.origin !== location.origin) return;

  // Network-first with cache fallback for same-origin
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
