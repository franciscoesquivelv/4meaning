'use client'

import { useState, useEffect } from 'react'

interface Props {
  eventId?: string
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export default function PushSubscribeButton({ eventId }: Props) {
  const [status, setStatus] = useState<'loading' | 'unsupported' | 'denied' | 'subscribed' | 'unsubscribed'>('loading')

  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setStatus('unsupported')
      return
    }
    if (Notification.permission === 'denied') {
      setStatus('denied')
      return
    }
    navigator.serviceWorker.ready.then(reg => {
      reg.pushManager.getSubscription().then(sub => {
        setStatus(sub ? 'subscribed' : 'unsubscribed')
      })
    })
  }, [])

  async function subscribe() {
    const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
    if (!vapidKey) return

    const reg = await navigator.serviceWorker.register('/sw.js')
    await navigator.serviceWorker.ready

    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidKey),
    })

    const res = await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscription: sub.toJSON(), eventId }),
    })

    if (res.ok) setStatus('subscribed')
  }

  async function unsubscribe() {
    const reg = await navigator.serviceWorker.ready
    const sub = await reg.pushManager.getSubscription()
    if (!sub) return

    await sub.unsubscribe()
    await fetch('/api/push/subscribe', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ endpoint: sub.endpoint }),
    })
    setStatus('unsubscribed')
  }

  if (status === 'loading' || status === 'unsupported' || status === 'denied') return null

  // Se ancla arriba a la derecha de Mi Retiro, que es papel. Estaba en grises
  // de pantalla oscura y en el dorado que no es de la marca.
  //
  // Los dos estados se distinguen por peso, no por dos colores distintos: ya
  // activo es un apunte gris y sin acento, activar es la invitacion y lleva la
  // terracota, que es el acento del sistema.
  return status === 'subscribed' ? (
    <button
      onClick={unsubscribe}
      className="flex min-h-toque items-center gap-2 px-3 py-1.5 text-xs text-gray-ui border border-line rounded-lg hover:border-gray-ui transition-colors"
    >
      <span>🔔</span>
      <span>Notificaciones activas</span>
    </button>
  ) : (
    <button
      onClick={subscribe}
      className="flex min-h-toque items-center gap-2 px-3 py-1.5 text-xs text-terra-ui border border-terra/40 rounded-lg hover:border-terra transition-colors"
    >
      <span>🔔</span>
      <span>Activar notificaciones</span>
    </button>
  )
}
