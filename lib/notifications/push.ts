"use client"

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!("Notification" in window)) {
    console.log("[v0] This browser does not support notifications")
    return "denied"
  }

  if (Notification.permission === "granted") {
    return "granted"
  }

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission()
    return permission
  }

  return Notification.permission
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!("serviceWorker" in navigator)) {
    console.log("[v0] Service workers are not supported")
    return null
  }

  try {
    const registration = await navigator.serviceWorker.register("/sw.js")
    console.log("[v0] Service worker registered:", registration)
    return registration
  } catch (error) {
    console.error("[v0] Service worker registration failed:", error)
    return null
  }
}

export async function subscribeToPushNotifications(
  registration: ServiceWorkerRegistration,
): Promise<PushSubscription | null> {
  try {
    // Check if already subscribed
    let subscription = await registration.pushManager.getSubscription()

    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY

    if (!vapidPublicKey) {
      console.log("[v0] Push notifications disabled: VAPID key not configured")
      return null
    }

    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      })
    }

    console.log("[v0] Push subscription:", subscription)
    return subscription
  } catch (error) {
    console.error("[v0] Failed to subscribe to push notifications:", error)
    return null
  }
}

export function showLocalNotification(title: string, options?: NotificationOptions) {
  if (Notification.permission === "granted") {
    new Notification(title, {
      icon: "/icon-192x192.png",
      badge: "/icon-192x192.png",
      ...options,
    })
  }
}

// Helper function to convert VAPID key to ArrayBuffer
function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray.buffer as ArrayBuffer
}
