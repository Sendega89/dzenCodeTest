'use client'

import { useEffect, useState } from 'react'

function tabId(): string {
  const key = 'inventory.tab'
  const existing = window.sessionStorage.getItem(key)
  if (existing) return existing
  const next = window.crypto.randomUUID()
  window.sessionStorage.setItem(key, next)
  return next
}

export function realtimeChannel(): 'socket' | 'http' {
  return process.env.NEXT_PUBLIC_REALTIME_URL ? 'socket' : 'http'
}

export function usePresence(onCount?: (count: number) => void) {
  const [count, setCount] = useState<number | null>(null)

  useEffect(() => {
    const id = tabId()
    let stopped = false
    const apply = (next: number) => {
      setCount(next)
      onCount?.(next)
    }
    const beat = async () => {
      try {
        const response = await fetch('/api/presence', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ clientId: id }),
        })
        if (!response.ok || stopped) return
        apply(((await response.json()) as { count: number }).count)
      } catch {
        // Keep the last known value when a heartbeat fails.
      }
    }
    void beat()
    const timer = window.setInterval(() => void beat(), 2000)
    const leave = () => {
      const blob = new Blob([JSON.stringify({ clientId: id })], { type: 'application/json' })
      if (!navigator.sendBeacon('/api/presence/leave', blob)) {
        void fetch('/api/presence/leave', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ clientId: id }),
        })
      }
    }
    window.addEventListener('pagehide', leave)
    const configured = process.env.NEXT_PUBLIC_REALTIME_URL
    let socket: { close: () => void } | null = null
    if (configured) {
      const socketUrl = configured === 'same-origin' ? window.location.origin : configured
      void import('socket.io-client').then(({ io }) => {
        const client = io(socketUrl, { auth: { clientId: id } })
        client.on('presence', (payload: { count: number }) => apply(payload.count))
        socket = client
      })
    }
    return () => {
      stopped = true
      window.clearInterval(timer)
      window.removeEventListener('pagehide', leave)
      socket?.close()
    }
  }, [onCount])

  return count
}
