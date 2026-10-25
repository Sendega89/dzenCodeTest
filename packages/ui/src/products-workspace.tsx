'use client'

import { useMemo, useState } from 'react'
import { formatMoney, type Locale, type ProductInput, type ProductView, type Snapshot } from '@inventory/domain'
import { ConfirmDialog } from './confirm-dialog'
import { ProductDialog } from './forms'
import { Products } from './products'
import { Banner } from './primitives'
import { ProductIdentity } from './product-line'
import type { Messages } from './i18n'

type Props = {
  messages: Messages
  locale: Locale
  snapshot: Snapshot
  query: string
  type: string
  specification: string
  pending: boolean
  error: string
  onType: (value: string) => void
  onSpecification: (value: string) => void
  onReset: () => void
  onCreate: (value: ProductInput) => Promise<boolean>
  onDelete: (id: number) => Promise<boolean>
}

export function ProductsWorkspace(props: Props) {
  const { messages, locale, snapshot } = props
  const [creating, setCreating] = useState(false)
  const [target, setTarget] = useState<ProductView | null>(null)
  const types = useMemo(() => [...new Set(snapshot.products.map((product) => product.type))].sort(), [snapshot.products])
  const specifications = useMemo(
    () => [...new Set(snapshot.products.map((product) => product.specification))].sort(),
    [snapshot.products],
  )
  const products = snapshot.products.filter((product) => {
    if (props.type && product.type !== props.type) return false
    if (props.specification && product.specification !== props.specification) return false
    if (!props.query) return true
    return `${product.title} ${product.serialNumber} ${product.type}`.toLowerCase().includes(props.query)
  })

  return (
    <>
      {props.error ? <Banner>{props.error}</Banner> : null}
      <Products
        messages={messages}
        locale={locale}
        products={products}
        total={snapshot.products.length}
        type={props.type}
        specification={props.specification}
        types={types}
        specifications={specifications}
        onType={props.onType}
        onSpecification={props.onSpecification}
        onDelete={setTarget}
        onCreate={() => setCreating(true)}
        onReset={props.onReset}
      />
      {creating ? (
        <ProductDialog
          messages={messages}
          pending={props.pending}
          orders={snapshot.orders}
          groups={snapshot.groups}
          users={snapshot.users}
          types={types}
          specifications={specifications}
          orderId={snapshot.orders[0]?.id ?? 0}
          onClose={() => setCreating(false)}
          onSubmit={(value) => void props.onCreate(value).then((ok) => ok && setCreating(false))}
        />
      ) : null}
      {target ? (
        <ConfirmDialog
          messages={messages}
          title={messages.products.deleteTitle}
          pending={props.pending}
          onClose={() => setTarget(null)}
          onConfirm={() => void props.onDelete(target.id).then((ok) => ok && setTarget(null))}
        >
          <ProductIdentity product={target} />
        </ConfirmDialog>
      ) : null}
    </>
  )
}

export function OrderDeleteSummary({ title, count, usd, uah }: { title: string; count: number; usd: number; uah: number }) {
  return (
    <>
      <h3>{title}</h3>
      <p>{count} · {formatMoney(usd, 'USD')} · {formatMoney(uah, 'UAH')}</p>
    </>
  )
}
