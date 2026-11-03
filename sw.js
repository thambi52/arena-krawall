// Speichert alle Dateien der App, damit sie ohne Internet startet.
const CACHE = 'arena-krawall-20261103-224358';
const FILES = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  // Alte Versionen lÃ¶schen
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  // Erst im Internet nach einer neuen Version schauen, ohne Internet die gespeicherte nehmen
  e.respondWith(
    fetch(e.request).then(res => {
      // Eigene Dateien und die Bibliotheken von unpkg (3D, Mehrspieler) merken, damit sie auch ohne Internet da sind
      const u = new URL(e.request.url);
      if ((res.ok || res.type === 'opaque') && (u.origin === location.origin || u.hostname === 'unpkg.com')){
        const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy));
      }
      return res;
    }).catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match('index.html')))
  );
});