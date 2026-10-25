'use client'

import { useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import type { ProductView, Snapshot } from '@inventory/domain'
import { Modal, ProductDialog, ProductsBoard } from '@inventory/ui'
import { api } from '@/api'
import { useAppDispatch, useAppSelector, useI18n } from '@/providers'
import { applySnapshot } from '@/store'

export default function ProductsPage() {
  const { messages, locale } = useI18n()
  const snapshot = useAppSelector((state) => state.inventory)
  const dispatch = useAppDispatch()
  const router = useRouter()
  const params = useSearchParams()
  const query = (params.get('q') ?? '').trim().toLowerCase()
  const type = params.get('type') ?? ''
  const specification = params.get('spec') ?? ''
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const [creating, setCreating] = useState(false)
  const [target, setTarget] = useState<ProductView | null>(null)

  const types = useMemo(() => [...new Set(snapshot.products.map((product) => product.type))].sort(), [snapshot.products])
  const specifications = useMemo(
    () => [...new Set(snapshot.products.map((product) => product.specification))].sort(),
    [snapshot.products],
  )
  const products = snapshot.products.filter((product) => {
    if (type && product.type !== type) return false
    if (specification && product.specification !== specification) return false
    if (!query) return true
    return `${product.title} ${product.serialNumber} ${product.type}`.toLowerCase().includes(query)
  })

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(params.toString())
    if (value) next.set(key, value)
    else next.delete(key)
    const search = next.toString()
    router.replace(search ? `/products?${search}` : '/products')
  }

  async function mutate(action: () => Promise<{ data: Snapshot }>) {
    setPending(true)
    setError('')
    try {
      const response = await action()
      dispatch(applySnapshot(response.data))
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
    <>
      {error ? <div className="banner" role="alert">{error}</div> : null}
      <ProductsBoard
        messages={messages}
        locale={locale}
        products={products}
        total={snapshot.products.length}
        type={type}
        specification={specification}
        types={types}
        specifications={specifications}
        onType={(value) => setParam('type', value)}
        onSpecification={(value) => setParam('spec', value)}
        onOpenOrder={(id) => router.push(`/orders?id=${id}`)}
        onDelete={setTarget}
        onCreate={() => setCreating(true)}
        onReset={() => router.push(query ? `/products?q=${encodeURIComponent(query)}` : '/products')}
      />
      {creating ? (
        <ProductDialog
          messages={messages}
          pending={pending}
          orders={snapshot.orders}
          groups={snapshot.groups}
          users={snapshot.users}
          types={types}
          specifications={specifications}
          orderId={snapshot.orders[0]?.id ?? 0}
          onClose={() => setCreating(false)}
          onSubmit={(value) => void mutate(() => api.post('/api/products', value)).then((ok) => ok && setCreating(false))}
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
                onClick={() =>
                  void mutate(async () => {
                    const response = await api.delete<Snapshot>(`/api/products/${target.id}`)
                    setTarget(null)
                    return response
                  })
                }
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
    </>
  )
}
