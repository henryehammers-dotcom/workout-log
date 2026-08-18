const CACHE = 'tallyup-v174';
const FILES = [
  './index.html',
  './manifest.json',
  './version.json',
  './Tallyup-Icon-192.png',
  './Tallyup-Icon-512.png',
  './sfx/man-snoring.mp3',
  './src/state.js',
  './src/exercises-data.js',
  './src/muscle-group-icons.js',
  './src/theme.js',
  './src/bodyweight.js',
  './src/backup.js',
  './src/modal.js',
  './src/library.js',
  './src/calendar.js',
  './src/speech.js',
  './src/schedule-day.js',
  './src/drag.js',
  './src/timers.js',
  './src/history.js',
  './src/custom-log.js',
  './src/tabs.js',
  './src/sidebar.js',
  './src/clock.js',
  './src/music.js',
  './src/greeting.js',
  './src/main.js'
];

// Install: cache all files individually (not addAll) so a single missing/failed
// file can't reject the whole install and leave the service worker stuck —
// then activate immediately so the next launch gets the new bundle without waiting.
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => Promise.all(
        FILES.map(f => c.add(f).catch(err => console.warn('SW: failed to cache', f, err)))
      ))
      .then(() => self.skipWaiting())
  );
});

// Listen for page to trigger activation (when no active workout session)
self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
});

// Activate: delete old caches and claim clients
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// Fetch: network first for HTML, cache first for everything else
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  const isHTML = e.request.destination === 'document' || url.pathname.endsWith('.html');

  if (isHTML) {
    e.respondWith(
      fetch(e.request)
        .then(response => {
          const clone = response.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
          return response;
        })
        .catch(() => caches.match(e.request))
    );
  } else {
    e.respondWith(
      caches.match(e.request).then(cached => cached || fetch(e.request).catch(() => cached))
    );
  }
});
