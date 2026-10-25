'use client'

import { useMemo, useState, type ReactNode } from 'react'
import type { Locale, OrderInput, OrderView, ProductInput, ProductView, Snapshot } from '@inventory/domain'
import { ConfirmDialog } from './confirm-dialog'
import { OrderDialog, ProductDialog } from './forms'
import { Orders } from './orders'
import { Banner } from './primitives'
import { ProductIdentity } from './product-line'
import { OrderDeleteSummary } from './products-workspace'
import type { Messages } from './i18n'

type Target = { kind: 'order'; order: OrderView } | { kind: 'product'; product: ProductView }

type Props = {
  messages: Messages
  locale: Locale
  snapshot: Snapshot
  query: string
  selectedId: number | null
  pending: boolean
  error: string
  chart?: ReactNode
  onOpen: (id: number) => void
  onClose: () => void
  onCreateOrder: (value: OrderInput) => Promise<boolean>
  onCreateProduct: (value: ProductInput) => Promise<boolean>
  onDeleteOrder: (id: number) => Promise<boolean>
  onDeleteProduct: (id: number) => Promise<boolean>
}

export function OrdersWorkspace(props: Props) {
  const { messages, locale, snapshot, query, selectedId } = props
  const [dialog, setDialog] = useState<'order' | 'product' | null>(null)
  const [target, setTarget] = useState<Target | null>(null)
  const orders = useMemo(
    () => snapshot.orders.filter((order) => !query || order.title.toLowerCase().includes(query)),
    [snapshot.orders, query],
  )
  const selected = snapshot.orders.find((order) => order.id === selectedId) ?? null

  return (
    <>
      {props.error ? <Banner>{props.error}</Banner> : null}
      <Orders
        messages={messages}
        locale={locale}
        orders={selected ? snapshot.orders : orders}
        total={snapshot.orders.length}
        query={query}
        selected={selected}
        onOpen={props.onOpen}
        onClose={props.onClose}
        onCreate={() => setDialog('order')}
        onAddProduct={() => setDialog('product')}
        onDeleteOrder={(order) => setTarget({ kind: 'order', order })}
        onDeleteProduct={(product) => setTarget({ kind: 'product', product })}
      />
      {!selected && snapshot.orders.length > 0 ? props.chart : null}
      {dialog === 'order' ? (
        <OrderDialog
          messages={messages}
          pending={props.pending}
          onClose={() => setDialog(null)}
          onSubmit={(value) => void props.onCreateOrder(value).then((ok) => ok && setDialog(null))}
        />
      ) : null}
      {dialog === 'product' && selected ? (
        <ProductDialog
          messages={messages}
          pending={props.pending}
          orders={snapshot.orders}
          groups={snapshot.groups}
          users={snapshot.users}
          types={[...new Set(snapshot.products.map((product) => product.type))]}
          specifications={[...new Set(snapshot.products.map((product) => product.specification))]}
          orderId={selected.id}
          onClose={() => setDialog(null)}
          onSubmit={(value) => void props.onCreateProduct(value).then((ok) => ok && setDialog(null))}
        />
      ) : null}
      {target?.kind === 'order' ? (
        <ConfirmDialog
          messages={messages}
          title={messages.orders.deleteTitle}
          pending={props.pending}
          onClose={() => setTarget(null)}
          onConfirm={() => void props.onDeleteOrder(target.order.id).then((ok) => ok && setTarget(null))}
        >
          <OrderDeleteSummary title={target.order.title} count={target.order.productCount} usd={target.order.totalUsd} uah={target.order.totalUah} />
        </ConfirmDialog>
      ) : null}
      {target?.kind === 'product' ? (
        <ConfirmDialog
          messages={messages}
          title={messages.products.deleteTitle}
          pending={props.pending}
          onClose={() => setTarget(null)}
          onConfirm={() => void props.onDeleteProduct(target.product.id).then((ok) => ok && setTarget(null))}
        >
          <ProductIdentity product={target.product} />
        </ConfirmDialog>
      ) : null}
    </>
  )
}
