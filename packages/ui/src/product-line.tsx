'use client'

import { routes, type ProductView } from '@inventory/domain'
import { Trash } from './icons'
import type { Messages } from './i18n'
import { Button } from './primitives'

export function StatusDot({ status }: { status: ProductView['status'] }) {
  return <span className={status === 'repair' ? 'dot dot--repair' : 'dot'} />
}

export function ProductStatus({ status, messages }: { status: ProductView['status']; messages: Messages }) {
  return (
    <div className={status === 'repair' ? 'status status--repair' : 'status'}>
      {status === 'repair' ? messages.products.repair : messages.products.free}
    </div>
  )
}

export function ProductIdentity({ product, href }: { product: ProductView; href?: string }) {
  const title = href ? <a className="product-line__title" href={href}>{product.title}</a> : <div className="product-line__title">{product.title}</div>
  return (
    <div>
      {title}
      <div className="product-line__sn">SN: {product.serialNumber}</div>
    </div>
  )
}

export function DeleteButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <Button variant="trash" aria-label={label} onClick={onClick}>
      <Trash />
    </Button>
  )
}

export function ProductLine({
  product,
  messages,
  onDelete,
}: {
  product: ProductView
  messages: Messages
  onDelete: (product: ProductView) => void
}) {
  return (
    <div className="product-line">
      <StatusDot status={product.status} />
      <img className="thumb" src={product.photo || '/monitor.svg'} alt="" />
      <ProductIdentity product={product} href={routes.product(product.id)} />
      <ProductStatus status={product.status} messages={messages} />
      <DeleteButton label={messages.delete} onClick={() => onDelete(product)} />
    </div>
  )
}
