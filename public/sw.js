// Service Worker — Web Push handler for Jetis Sumur
// Registered by pages/ops/notifikasi.vue via navigator.serviceWorker.register('/sw.js')

self.addEventListener('push', (event) => {
  const data = event.data?.json() || {}
  event.waitUntil(
    self.registration.showNotification(data.title || 'Jetis Sumur', {
      body: data.body || '',
      icon: '/icon.svg',
      badge: '/icon.svg',
      data: { url: data.url || '/ops' },
    })
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((list) => {
        const target = event.notification.data?.url || '/ops'
        for (const c of list) {
          if (c.url === target && 'focus' in c) return c.focus()
        }
        if (clients.openWindow) return clients.openWindow(target)
      })
  )
})
