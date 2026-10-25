'use client'

import { useCallback, useEffect } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Shell } from '@inventory/ui'
import { api } from './api'
import { useAppDispatch, useAppSelector, useI18n } from './providers'
import { setCount } from './store'

function tabId(): string {
  const key = 'inventory.tab'
  const existing = window.sessionStorage.getItem(key)
  if (existing) return existing
  const next = window.crypto.randomUUID()
  window.sessionStorage.setItem(key, next)
  return next
}

export function Frame({ children }: { children: React.ReactNode }) {
  const { messages, locale } = useI18n()
  const dispatch = useAppDispatch()
  const count = useAppSelector((state) => state.session.count)
  const pathname = usePathname()
  const params = useSearchParams()
  const router = useRouter()
  const query = params.get('q') ?? ''

  const onSearch = useCallback(
    (value: string) => {
      const current = params.get('q') ?? ''
      if (current === value) return
      const next = new URLSearchParams(params.toString())
      if (value) next.set('q', value)
      else next.delete('q')
      next.delete('id')
      const path = pathname.startsWith('/orders') ? '/orders' : '/products'
      if (!pathname.startsWith('/orders') && !pathname.startsWith('/products')) {
        if (!value) return
        router.push(`/products?q=${encodeURIComponent(value)}`)
        return
      }
      const search = next.toString()
      router.replace(search ? `${path}?${search}` : path)
    },
    [params, pathname, router],
  )

  useEffect(() => {
    const id = tabId()
    let stopped = false
    const beat = async () => {
      try {
        const response = await api.post<{ count: number }>('/api/presence', { clientId: id })
        if (!stopped) dispatch(setCount(response.data.count))
      } catch {
        // The counter stays on the last known value when a heartbeat fails.
      }
    }
    void beat()
    const timer = window.setInterval(() => void beat(), 2000)
    const leave = () => {
      const blob = new Blob([JSON.stringify({ clientId: id })], { type: 'application/json' })
      if (!navigator.sendBeacon('/api/presence/leave', blob)) {
        void api.post('/api/presence/leave', { clientId: id })
      }
    }
    window.addEventListener('pagehide', leave)
    if ('serviceWorker' in navigator) {
      void navigator.serviceWorker.register('/sw.js').catch(() => undefined)
    }
    const socketUrl = process.env.NEXT_PUBLIC_REALTIME_URL
    let socket: { close: () => void } | null = null
    if (socketUrl) {
      void import('socket.io-client').then(({ io }) => {
        const client = io(socketUrl, { transports: ['websocket'], auth: { clientId: id } })
        client.on('presence', (payload: { count: number }) => dispatch(setCount(payload.count)))
        socket = client
      })
    }
    return () => {
      stopped = true
      window.clearInterval(timer)
      window.removeEventListener('pagehide', leave)
      socket?.close()
    }
  }, [dispatch])

  return (
    <Shell messages={messages} locale={locale} pathname={pathname} query={query} tabCount={count} realtime={process.env.NEXT_PUBLIC_REALTIME_URL ? 'socket' : 'http'} onSearch={onSearch}>
      <div className="container-fluid px-0 animate__animated animate__fadeIn page-transition">{children}</div>
    </Shell>
  )
}
