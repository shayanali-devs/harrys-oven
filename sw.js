/* ═══════════════════════════════════════════════════════════
   HARRY'S OVEN — Service Worker
   ═══════════════════════════════════════════════════════════ */

const CACHE_NAME = 'harrys-oven-v1';
const STATIC_CACHE = 'harrys-static-v1';
const DYNAMIC_CACHE = 'harrys-dynamic-v1';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/app.js',
  '/js/firebase-init.js',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

// ── INSTALL ─────────────────────────────────────────────────
// Cache static assets and skip waiting to activate immediately
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[SW] Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// ── ACTIVATE ────────────────────────────────────────────────
// Clean up old caches and claim all clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter(key => key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
          .map(key => {
            console.log('[SW] Removing old cache:', key);
            return caches.delete(key);
          })
      );
    })
  );
  self.clients.claim();
});

// ── FETCH ───────────────────────────────────────────────────
// Route requests through appropriate caching strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip cross-origin requests except for known CDN resources
  if (url.origin !== self.location.origin &&
      !url.hostname.includes('fonts.googleapis') &&
      !url.hostname.includes('fonts.gstatic') &&
      !url.hostname.includes('unsplash') &&
      !url.hostname.includes('imgbb')) {
    return;
  }

  // Firebase / Google APIs — network only (don't cache auth/API calls)
  if (url.hostname.includes('firebase') || url.hostname.includes('googleapis')) {
    return;
  }

  // External images (Unsplash, imgbb) — stale-while-revalidate
  if (url.hostname.includes('unsplash') || url.hostname.includes('imgbb')) {
    event.respondWith(
      caches.open(DYNAMIC_CACHE).then((cache) => {
        return cache.match(request).then((cached) => {
          const fetchPromise = fetch(request).then((response) => {
            if (response.ok) cache.put(request, response.clone());
            return response;
          }).catch(() => cached);

          return cached || fetchPromise;
        });
      })
    );
    return;
  }

  // Static assets (CSS, JS, fonts, images) — cache-first strategy
  if (request.url.match(/\.(css|js|woff2?|ttf|svg|png|jpg|jpeg|gif|webp|ico)$/)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;

        return fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(STATIC_CACHE).then(cache => cache.put(request, clone));
          }
          return response;
        });
      }).catch(() => {
        // Return a pizza emoji SVG fallback for failed images
        if (request.url.match(/\.(png|jpg|jpeg|gif|webp|svg)$/)) {
          return new Response(
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🍕</text></svg>',
            { headers: { 'Content-Type': 'image/svg+xml' } }
          );
        }
      })
    );
    return;
  }

  // HTML pages — network-first, fall back to cache
  event.respondWith(
    fetch(request).then((response) => {
      if (response.ok) {
        const clone = response.clone();
        caches.open(DYNAMIC_CACHE).then(cache => cache.put(request, clone));
      }
      return response;
    }).catch(() => {
      return caches.match(request).then((cached) => {
        return cached || caches.match('/index.html');
      });
    })
  );
});
