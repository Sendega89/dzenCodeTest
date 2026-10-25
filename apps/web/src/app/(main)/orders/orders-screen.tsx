'use client'

import { useCallback } from 'react'
import dynamic from 'next/dynamic'
import { useRouter, useSearchParams } from 'next/navigation'
import { formatMoney, routes, type Snapshot } from '@inventory/domain'
import { OrdersWorkspace, useSnapshotMutation } from '@inventory/ui'
import { api } from '@/api'
import { useAppDispatch, useAppSelector, useI18n } from '@/providers'
import { applySnapshot } from '@/store'
import { useWasmTotal } from '@/use-wasm-total'

const SumsChart = dynamic(() => import('@/chart').then((mod) => mod.SumsChart), { ssr: false })

export function OrdersScreen({ selectedId }: { selectedId: number | null }) {
  const { messages, locale } = useI18n()
  const snapshot = useAppSelector((state) => state.inventory)
  const dispatch = useAppDispatch()
  const router = useRouter()
  const params = useSearchParams()
  const query = (params.get('q') ?? '').trim().toLowerCase()
  const totals = useWasmTotal(snapshot.orders.map((order) => order.totalUah))
  const apply = useCallback((next: Snapshot) => {
    dispatch(applySnapshot(next))
    router.refresh()
  }, [dispatch, router])
  const { pending, error, commit } = useSnapshotMutation(messages.error, apply)

  return (
    <OrdersWorkspace
      messages={messages}
      locale={locale}
      snapshot={snapshot}
      query={query}
      selectedId={selectedId}
      pending={pending}
      error={error}
      onOpen={(id) => router.push(routes.order(id, query || undefined))}
      onClose={() => router.push(routes.orders(query || undefined))}
      onCreateOrder={(value) => commit(() => api.post<Snapshot>('/api/orders', value).then((response) => response.data))}
      onCreateProduct={(value) => commit(() => api.post<Snapshot>('/api/products', value).then((response) => response.data))}
      onDeleteOrder={async (id) => {
        const ok = await commit(() => api.delete<Snapshot>(`/api/orders/${id}`).then((response) => response.data))
        if (ok && selectedId === id) router.push(routes.orders(query || undefined))
        return ok
      }}
      onDeleteProduct={(id) => commit(() => api.delete<Snapshot>(`/api/products/${id}`).then((response) => response.data))}
      chart={(
        <section className="chart-card">
          <h2>{messages.orders.chart}</h2>
          <SumsChart orders={snapshot.orders} />
          <p className="hint">
            {messages.orders.wasm}: {totals == null ? '…' : formatMoney(totals, 'UAH')}
          </p>
        </section>
      )}
    />
  )
}
