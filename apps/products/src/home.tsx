'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Locale, ProductView, Snapshot } from '@inventory/domain'
import { Modal, ProductDialog, ProductsBoard, Shell, messagesFor } from '@inventory/ui'

type Props = {
  locale: Locale
  snapshot: Snapshot
  query: string
  type: string
  specification: string
}

function tabId(): string {
  const key = 'inventory.tab'
  const existing = window.sessionStorage.getItem(key)
  if (existing) return existing
  const next = window.crypto.randomUUID()
  window.sessionStorage.setItem(key, next)
  return next
}

export function ProductsHome({ locale, snapshot, query, type, specification }: Props) {
  const messages = messagesFor(locale)
  const router = useRouter()
  const [data, setData] = useState(snapshot)
  const [count, setCount] = useState<number | null>(null)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const [creating, setCreating] = useState(false)
  const [target, setTarget] = useState<ProductView | null>(null)
  const normalizedQuery = query.trim().toLowerCase()

  useEffect(() => setData(snapshot), [snapshot])

  useEffect(() => {
    const id = tabId()
    let stopped = false
    const beat = async () => {
      const response = await fetch('/api/presence', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ clientId: id }),
      })
      if (!response.ok || stopped) return
      const payload = (await response.json()) as { count: number }
      setCount(payload.count)
    }
    void beat()
    const timer = window.setInterval(() => void beat(), 2000)
    const socketUrl = process.env.NEXT_PUBLIC_REALTIME_URL
    let socket: { close: () => void } | null = null
    if (socketUrl) {
      void import('socket.io-client').then(({ io }) => {
        const client = io(socketUrl, { transports: ['websocket'], auth: { clientId: id } })
        client.on('presence', (payload: { count: number }) => setCount(payload.count))
        socket = client
      })
    }
    return () => {
      stopped = true
      window.clearInterval(timer)
      socket?.close()
    }
  }, [])

  const onSearch = useCallback((value: string) => {
    if (value === query) return
    const next = new URLSearchParams()
    if (value) next.set('q', value)
    if (type) next.set('type', type)
    if (specification) next.set('spec', specification)
    const search = next.toString()
    router.replace(search ? `/?${search}` : '/')
  }, [query, router, specification, type])

  const types = useMemo(() => [...new Set(data.products.map((product) => product.type))].sort(), [data.products])
  const specifications = useMemo(
    () => [...new Set(data.products.map((product) => product.specification))].sort(),
    [data.products],
  )
  const products = data.products.filter((product) => {
    if (type && product.type !== type) return false
    if (specification && product.specification !== specification) return false
    if (!normalizedQuery) return true
    return `${product.title} ${product.serialNumber} ${product.type}`.toLowerCase().includes(normalizedQuery)
  })

  function setParam(key: string, value: string) {
    const next = new URLSearchParams()
    if (query) next.set('q', query)
    if (type) next.set('type', type)
    if (specification) next.set('spec', specification)
    if (value) next.set(key, value)
    else next.delete(key)
    const search = next.toString()
    router.replace(search ? `/?${search}` : '/')
  }

  async function mutate(path: string, method: string, body?: unknown) {
    setPending(true)
    setError('')
    try {
      const response = await fetch(path, {
        method,
        headers: { 'content-type': 'application/json' },
        body: body === undefined ? undefined : JSON.stringify(body),
      })
      if (!response.ok) throw new Error('request failed')
      setData((await response.json()) as Snapshot)
      router.refresh()
      return true
    } catch {
      setError(messages.error)
      return false
    } finally {
      setPending(false)
    }
  }

  return (
    <Shell
      messages={messages}
      locale={locale}
      pathname="/products"
      query={query}
      tabCount={count}
      realtime={process.env.NEXT_PUBLIC_REALTIME_URL ? 'socket' : 'http'}
      onSearch={onSearch}
    >
      {error ? <div className="banner" role="alert">{error}</div> : null}
      <ProductsBoard
        messages={messages}
        locale={locale}
        products={products}
        total={data.products.length}
        type={type}
        specification={specification}
        types={types}
        specifications={specifications}
        onType={(value) => setParam('type', value)}
        onSpecification={(value) => setParam('spec', value)}
        onOpenOrder={(id) => {
          window.location.href = `/orders?id=${id}`
        }}
        onDelete={setTarget}
        onCreate={() => setCreating(true)}
        onReset={() => router.replace(query ? `/?q=${encodeURIComponent(query)}` : '/')}
      />
      {creating ? (
        <ProductDialog
          messages={messages}
          pending={pending}
          orders={data.orders}
          groups={data.groups}
          users={data.users}
          types={types}
          specifications={specifications}
          orderId={data.orders[0]?.id ?? 0}
          onClose={() => setCreating(false)}
          onSubmit={(value) => void mutate('/api/products', 'POST', value).then((ok) => ok && setCreating(false))}
        />
      ) : null}
      {target ? (
        <Modal
          danger
          title={messages.products.deleteTitle}
          closeLabel={messages.close}
          onClose={() => setTarget(null)}
          footer={
            <>
              <button type="button" className="btn btn--ghost" onClick={() => setTarget(null)}>{messages.cancel}</button>
              <button
                type="button"
                className="btn btn--white"
                disabled={pending}
                onClick={() => void mutate(`/api/products/${target.id}`, 'DELETE').then((ok) => ok && setTarget(null))}
              >
                {messages.delete}
              </button>
            </>
          }
        >
          <p className="product-line__title">{target.title}</p>
          <p className="muted">SN: {target.serialNumber}</p>
        </Modal>
      ) : null}
    </Shell>
  )
}
