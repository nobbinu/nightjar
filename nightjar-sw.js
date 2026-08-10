/* Nightjar service worker — offline-first shell.
 * BUMP VERSION ON EVERY EDIT of nightjar-messenger.html or this file,
 * exactly as with ShopCalc, or phones keep serving the cached copy. */
const VERSION = 'nightjar-v1';
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION)
    .then((c) => c.addAll(['./nightjar-messenger.html']))
    .then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys()
    .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  e.respondWith((async () => {
    const hit = await caches.match(e.request, { ignoreSearch: true });
    const refresh = fetch(e.request).then(async (res) => {
      if (res && res.ok) { const c = await caches.open(VERSION); await c.put(e.request, res.clone()); }
      return res;
    }).catch(() => hit);
    return hit || refresh;
  })());
});
