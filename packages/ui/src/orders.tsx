'use client'

import { formatLongDate, formatMoney, formatShortDate, type Locale, type OrderView, type ProductView } from '@inventory/domain'
import { CloseIcon, ListIcon, Plus, Trash } from './icons'
import { productWord, type Messages } from './i18n'

function Dates({ value, locale }: { value: string; locale: Locale }) {
  return (
    <div className="dates">
      <span className="dates__short">{formatShortDate(value)}</span>
      <span>{formatLongDate(value, locale)}</span>
    </div>
  )
}

function ProductRow({
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
      <span className={product.status === 'repair' ? 'dot dot--repair' : 'dot'} />
      <img className="thumb" src={product.photo || '/monitor.svg'} alt="" />
      <div>
        <div className="product-line__title">{product.title}</div>
        <div className="product-line__sn">SN: {product.serialNumber}</div>
      </div>
      <div className={product.status === 'repair' ? 'status status--repair' : 'status'}>
        {product.status === 'repair' ? messages.products.repair : messages.products.free}
      </div>
      <button type="button" className="trash" aria-label={messages.delete} onClick={() => onDelete(product)}>
        <Trash />
      </button>
    </div>
  )
}

type OrdersBoardProps = {
  messages: Messages
  locale: Locale
  orders: OrderView[]
  total: number
  query: string
  selected: OrderView | null
  products: ProductView[]
  onOpen: (id: number) => void
  onClose: () => void
  onCreate: () => void
  onDeleteOrder: (order: OrderView) => void
  onDeleteProduct: (product: ProductView) => void
  onAddProduct: () => void
}

export function OrdersBoard(props: OrdersBoardProps) {
  const { messages, locale, orders, total, query, selected, products } = props
  return (
    <section>
      <div className="page-head">
        <button type="button" className="plus" aria-label={messages.orders.add} onClick={props.onCreate}>
          <Plus />
        </button>
        <h1>
          {messages.orders.title} / {total}
        </h1>
        {query && orders.length !== total ? (
          <span className="muted">
            {messages.shown} {orders.length}
          </span>
        ) : null}
      </div>
      {selected ? (
        <div className="orders--split">
          <div className="order-list">
            {orders.map((order) => (
              <button
                key={order.id}
                type="button"
                className={order.id === selected.id ? 'order-card order-card--selected' : 'order-card'}
                onClick={() => props.onOpen(order.id)}
              >
                <span className="order-card__title">{order.title}</span>
                <span className="meta">
                  <ListIcon />
                  <span>
                    <span className="meta__num">{order.productCount}</span>
                    <small>{productWord(order.productCount, locale)}</small>
                  </span>
                </span>
                <Dates value={order.createdAt} locale={locale} />
              </button>
            ))}
          </div>
          <article className="panel">
            <div className="panel__head">
              <h2 className="panel__title">{selected.title}</h2>
              <button type="button" className="icon-button icon-button--ghost panel__close" aria-label={messages.close} onClick={props.onClose}>
                <CloseIcon />
              </button>
            </div>
            <button type="button" className="linkish" onClick={props.onAddProduct}>
              <Plus /> {messages.orders.addProduct}
            </button>
            {products.length === 0 ? <p className="muted">{messages.orders.products}</p> : null}
            {products.map((product) => (
              <ProductRow key={product.id} product={product} messages={messages} onDelete={props.onDeleteProduct} />
            ))}
          </article>
        </div>
      ) : (
        <div className="order-list">
          {orders.length === 0 ? <p className="muted">{query ? messages.orders.filtered : messages.orders.empty}</p> : null}
          {orders.map((order) => (
            <article key={order.id} className="order-row">
              <button type="button" className="order-row__title" onClick={() => props.onOpen(order.id)}>
                {order.title}
              </button>
              <div className="meta">
                <ListIcon />
                <span>
                  <span className="meta__num">{order.productCount}</span>
                  <small>{productWord(order.productCount, locale)}</small>
                </span>
              </div>
              <Dates value={order.createdAt} locale={locale} />
              <div className="prices">
                <span>{formatMoney(order.totalUsd, 'USD')}</span>
                <span>{formatMoney(order.totalUah, 'UAH')}</span>
              </div>
              <button type="button" className="trash" aria-label={messages.delete} onClick={() => props.onDeleteOrder(order)}>
                <Trash />
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

export function ProductSummary({ product, messages }: { product: ProductView; messages: Messages }) {
  return <ProductRow product={product} messages={messages} onDelete={() => undefined} />
}
