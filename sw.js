/**
 * Service Worker - Vanilla PWA Support
 * Works on GitHub Pages!
 */

const CACHE_NAME = 'iceman404-portfolio-v3';
const urlsToCache = [
  '/',
  '/index.html',
  '/bio.html',
  '/contacts.html',
  '/skills.html',
  '/css/style.css',
  '/particles.js',
  '/particle.js/app.js'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
      .catch((err) => {
        console.warn('Cache failed:', err);
      })
  );
  self.skipWaiting(); // Activate immediately
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip caching for extension URLs and other unsupported schemes
  const requestUrl = event.request.url || '';
  const requestMethod = event.request.method || 'GET';
  
  // Skip all non-HTTP requests and extension URLs
  if (!requestUrl || 
      requestUrl.startsWith('chrome-extension://') || 
      requestUrl.startsWith('moz-extension://') ||
      requestUrl.startsWith('safari-extension://') ||
      requestUrl.startsWith('ms-browser-extension://') ||
      requestUrl.startsWith('chrome://') ||
      requestUrl.startsWith('about:') ||
      (!requestUrl.startsWith('http://') && !requestUrl.startsWith('https://'))) {
    // Don't intercept extension URLs at all - let browser handle them
    return;
  }
  
  // Only handle GET requests
  if (requestMethod !== 'GET') {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request).then((response) => {
          // Don't cache non-GET requests or non-200 responses
          if (event.request.method !== 'GET' || !response || response.status !== 200) {
            return response;
          }

          // Double-check response URL before caching
          const responseUrl = response.url || '';
          if (responseUrl.startsWith('chrome-extension://') || 
              responseUrl.startsWith('moz-extension://') ||
              responseUrl.startsWith('safari-extension://') ||
              responseUrl.startsWith('ms-browser-extension://') ||
              (!responseUrl.startsWith('http://') && !responseUrl.startsWith('https://'))) {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          // Safely attempt to cache - check request URL one more time
          const finalRequestUrl = event.request.url || '';
          if (finalRequestUrl.startsWith('chrome-extension://') || 
              finalRequestUrl.startsWith('moz-extension://') ||
              finalRequestUrl.startsWith('safari-extension://') ||
              finalRequestUrl.startsWith('ms-browser-extension://') ||
              (!finalRequestUrl.startsWith('http://') && !finalRequestUrl.startsWith('https://'))) {
            // Don't cache extension URLs
            return response;
          }

          // Safely attempt to cache
          caches.open(CACHE_NAME)
            .then((cache) => {
              // Wrap cache.put in try-catch to handle any errors
              return cache.put(event.request, responseToCache).catch((err) => {
                // Silently ignore cache errors (e.g., for unsupported schemes)
                console.warn('Cache put skipped:', err.message);
              });
            })
            .catch(() => {
              // Silently ignore cache errors
            });

          return response;
        });
      })
      .catch(() => {
        // Return offline page if available
        return caches.match('/404.html');
      })
  );
});
