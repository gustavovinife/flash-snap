// Flash Snap service worker: makes the web app installable and lets it open offline.
const CACHE = 'flash-snap-v1'
const SHELL = '/app/'

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.add(SHELL))
      .then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin || !url.pathname.startsWith('/app/')) return

  if (request.mode === 'navigate') {
    // Network first so new deploys show up right away; the cached shell is the offline fallback
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone()
          caches.open(CACHE).then((cache) => cache.put(SHELL, copy))
          return response
        })
        .catch(() => caches.match(SHELL))
    )
    return
  }

  if (url.pathname.startsWith('/app/_expo/') || url.pathname.startsWith('/app/assets/')) {
    // Bundles and assets have content hashes in their names, so a cached copy never goes stale
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            if (response.ok) cacheAsset(request, response.clone())
            return response
          })
      )
    )
  }
})

// Reminders sent by the send-reminders Edge Function: { title, body, url, tag }
self.addEventListener('push', (event) => {
  let data = {}
  try {
    data = event.data ? event.data.json() : {}
  } catch {
    data = { body: event.data ? event.data.text() : '' }
  }
  event.waitUntil(
    self.registration.showNotification(data.title || 'Flash Snap', {
      body: data.body,
      icon: '/app/icon-192.png',
      badge: '/app/icon-192.png',
      tag: data.tag,
      data: { url: data.url || '/app/' }
    })
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const target = new URL((event.notification.data && event.notification.data.url) || '/app/', self.location.origin).href
  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      const app = windows.find((client) => new URL(client.url).pathname.startsWith('/app'))
      if (app) {
        await app.focus()
        if ('navigate' in app) await app.navigate(target).catch(() => {})
        return
      }
      await self.clients.openWindow(target)
    })()
  )
})

const BUNDLE_DIR = '/app/_expo/static/js/'

async function cacheAsset(request, response) {
  const cache = await caches.open(CACHE)
  await cache.put(request, response)
  if (!new URL(request.url).pathname.startsWith(BUNDLE_DIR)) return
  // Every deploy ships a new bundle; drop older ones so the cache doesn't grow forever
  for (const key of await cache.keys()) {
    if (new URL(key.url).pathname.startsWith(BUNDLE_DIR) && key.url !== request.url) await cache.delete(key)
  }
}
