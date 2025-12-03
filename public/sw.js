// Service Worker for handling push notifications
self.addEventListener("install", (event) => {
  console.log("[SW] Service worker installed")
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  console.log("[SW] Service worker activated")
  event.waitUntil(clients.claim())
})

self.addEventListener("push", (event) => {
  console.log("[SW] Push notification received")

  let data = {}
  if (event.data) {
    try {
      data = event.data.json()
    } catch (e) {
      data = { title: "V-Life", body: event.data.text() }
    }
  }

  const title = data.title || "V-Life"
  const options = {
    body: data.body || "You have a new notification",
    icon: "/icon-192x192.png",
    badge: "/icon-192x192.png",
    vibrate: [200, 100, 200],
    data: data,
    actions: data.actions || [],
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener("notificationclick", (event) => {
  console.log("[SW] Notification clicked")

  event.notification.close()

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // If a window is already open, focus it
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          return client.focus()
        }
      }
      // Otherwise, open a new window
      if (clients.openWindow) {
        return clients.openWindow("/dashboard")
      }
    }),
  )
})
