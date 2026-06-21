// Minimal offline support for the game, scoped to /making-it/. Network-first so
// fresh deploys always win when online, falling back to cache when offline.
// Bump CACHE_VERSION to retire old caches.
const CACHE_VERSION = 'making-it-v2';

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
    event.waitUntil((async () => {
        const keys = await caches.keys();
        await Promise.all(
            keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k)),
        );
        await self.clients.claim();
    })());
});

self.addEventListener('fetch', (event) => {
    const { request } = event;
    if (request.method !== 'GET') return;
    event.respondWith((async () => {
        try {
            const response = await fetch(request);
            const cache = await caches.open(CACHE_VERSION);
            cache.put(request, response.clone());
            return response;
        } catch {
            const cached = await caches.match(request);
            if (cached) return cached;
            throw new Error('offline and not cached');
        }
    })());
});
