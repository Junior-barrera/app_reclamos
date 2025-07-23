const CACHE_NAME = 'dimao-mobile-v2';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/logo_MUNI.png',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
});

self.addEventListener('fetch', (event) => {
  // Manejar widgets
  if (event.request.url.includes('/widget-')) {
    event.respondWith(
      new Response(JSON.stringify({
        claims: currentUser ? currentUser.claims.length : 0,
        pending: currentUser ? currentUser.claims.filter(id => claimsDatabase[id].status === 'pending').length : 0
      }), {
        headers: { 'Content-Type': 'application/json' }
      })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});