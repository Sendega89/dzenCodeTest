const CACHE = 'inventory-static-v1'

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting())
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)
  const cacheable =
    event.request.method === 'GET' &&
    url.origin === self.location.origin &&
    (url.pathname.startsWith('/_next/static') || url.pathname.endsWith('.svg') || url.pathname.endsWith('.wasm'))
  if (!cacheable) return
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone()
        void caches.open(CACHE).then((cache) => cache.put(event.request, copy))
        return response
      })
      .catch(() => caches.match(event.request)),
  )
})
