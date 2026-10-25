'use client'

import { useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import { useRouter, useSearchParams } from 'next/navigation'
import { formatMoney, type OrderView, type ProductView, type Snapshot } from '@inventory/domain'
import { Modal, OrderDialog, OrdersBoard, ProductDialog } from '@inventory/ui'
import { api } from '@/api'
import { useAppDispatch, useAppSelector, useI18n } from '@/providers'
import { applySnapshot } from '@/store'
import { useWasmTotal } from '@/use-wasm-total'

const SumsChart = dynamic(() => import('@/chart').then((mod) => mod.SumsChart), { ssr: false })

type Target = { kind: 'order'; order: OrderView } | { kind: 'product'; product: ProductView } | null

export default function OrdersPage() {
  const { messages, locale } = useI18n()
  const snapshot = useAppSelector((state) => state.inventory)
  const dispatch = useAppDispatch()
  const router = useRouter()
  const params = useSearchParams()
  const query = (params.get('q') ?? '').trim().toLowerCase()
  const selectedId = Number(params.get('id') || 0)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const [dialog, setDialog] = useState<'order' | 'product' | null>(null)
  const [target, setTarget] = useState<Target>(null)

  const orders = useMemo(
    () => snapshot.orders.filter((order) => !query || order.title.toLowerCase().includes(query)),
    [snapshot.orders, query],
  )
  const selected = snapshot.orders.find((order) => order.id === selectedId) ?? null
  const products = snapshot.products.filter((product) => product.orderId === selected?.id)
  const totals = useWasmTotal(snapshot.orders.map((order) => order.totalUah))

  async function run(action: () => Promise<{ data: Snapshot }>) {
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
      <OrdersBoard
        messages={messages}
        locale={locale}
        orders={selected ? snapshot.orders : orders}
        total={snapshot.orders.length}
        query={query}
        selected={selected}
        products={products}
        onOpen={(id) => router.push(query ? `/orders?id=${id}&q=${encodeURIComponent(query)}` : `/orders?id=${id}`)}
        onClose={() => router.push(query ? `/orders?q=${encodeURIComponent(query)}` : '/orders')}
        onCreate={() => setDialog('order')}
        onAddProduct={() => setDialog('product')}
        onDeleteOrder={(order) => setTarget({ kind: 'order', order })}
        onDeleteProduct={(product) => setTarget({ kind: 'product', product })}
      />
      {!selected && snapshot.orders.length > 0 ? (
        <section className="chart-card">
          <h2>{messages.orders.chart}</h2>
          <SumsChart orders={snapshot.orders} />
          <p className="hint">
            {messages.orders.wasm}: {totals == null ? '…' : formatMoney(totals, 'UAH')}
          </p>
        </section>
      ) : null}
      {dialog === 'order' ? (
        <OrderDialog
          messages={messages}
          pending={pending}
          onClose={() => setDialog(null)}
          onSubmit={(value) => void run(() => api.post('/api/orders', value)).then((ok) => ok && setDialog(null))}
        />
      ) : null}
      {dialog === 'product' && selected ? (
        <ProductDialog
          messages={messages}
          pending={pending}
          orders={snapshot.orders}
          groups={snapshot.groups}
          users={snapshot.users}
          types={[...new Set(snapshot.products.map((product) => product.type))]}
          specifications={[...new Set(snapshot.products.map((product) => product.specification))]}
          orderId={selected.id}
          onClose={() => setDialog(null)}
          onSubmit={(value) => void run(() => api.post('/api/products', value)).then((ok) => ok && setDialog(null))}
        />
      ) : null}
      {target?.kind === 'order' ? (
        <Modal
          danger
          title={messages.orders.deleteTitle}
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
                  void run(async () => {
                    const response = await api.delete<Snapshot>(`/api/orders/${target.order.id}`)
                    if (selectedId === target.order.id) router.push('/orders')
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
          <h3>{target.order.title}</h3>
          <p>
            {target.order.productCount} · {formatMoney(target.order.totalUsd, 'USD')} · {formatMoney(target.order.totalUah, 'UAH')}
          </p>
        </Modal>
      ) : null}
      {target?.kind === 'product' ? (
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
                  void run(async () => {
                    const response = await api.delete<Snapshot>(`/api/products/${target.product.id}`)
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
          <p className="product-line__title">{target.product.title}</p>
          <p className="muted">SN: {target.product.serialNumber}</p>
        </Modal>
      ) : null}
    </>
  )
}
