const CACHE_NAME = 'czesci-zdania-cache-v1';
const URLS_TO_CACHE = [
  '/', // The main HTML file (index.html at root)
  '/index.html', // Explicitly, in case server treats / and /index.html differently
  // Add paths to your main JavaScript and CSS bundles if known and static.
  // Vite often generates hashed filenames in an /assets directory.
  // For example: '/assets/index.abcdef.js', '/assets/index.123456.css'
  // Without knowing these, we rely on the fetch handler to cache them dynamically on first request.
  '/icon.svg', // Assuming an icon.svg is in the public folder
  '/api/sentences/random' // Cache the data from the API
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching app shell');
        // Using addAll, if one request fails, the entire cache operation fails.
        // For a more robust approach, cache URLs individually and handle errors.
        return cache.addAll(URLS_TO_CACHE.map(url => new Request(url, { cache: 'reload' })));
      })
      .catch(error => {
        console.error('Service Worker: Failed to cache app shell', error);
      })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Cache hit - return response
        if (cachedResponse) {
          return cachedResponse;
        }

        // Not in cache - fetch from network
        return fetch(event.request).then(
          (networkResponse) => {
            // Check if we received a valid response to cache
            // Don't cache opaque responses (e.g. from third-party CDNs without CORS) unless you are sure.
            // Don't cache non-GET requests.
            if (!networkResponse || networkResponse.status !== 200 || event.request.method !== 'GET' ) {
              return networkResponse;
            }
            
            // Responses from some CDNs might be of type 'opaque', which cannot be cloned
            // if networkResponse.type === 'opaque' and you want to cache it, handle carefully.
            // For 'basic' and 'cors' type responses, cloning is fine.

            const responseToCache = networkResponse.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                console.log('Service Worker: Caching new resource: ', event.request.url);
                cache.put(event.request, responseToCache);
              });

            return networkResponse;
          }
        ).catch(error => {
          console.error('Service Worker: Fetch failed; returning offline fallback or error for:', event.request.url, error);
          // Optionally, return a fallback page for navigation requests:
          // if (event.request.mode === 'navigate') {
          //   return caches.match('/offline.html'); // You'd need an offline.html in your cache
          // }
          // For other requests like API calls, you might just let the error propagate or return a specific JSON error.
          return new Response(JSON.stringify({ error: "offline" }), {
            headers: { 'Content-Type': 'application/json' },
            status: 503,
            statusText: "Service Unavailable"
          });
        });
      })
  );
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Force the SW to take control of current open clients
  return self.clients.claim();
}); 