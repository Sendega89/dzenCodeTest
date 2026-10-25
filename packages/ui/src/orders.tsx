'use client'

import { formatLongDate, formatMoney, formatShortDate, routes, type Locale, type OrderView, type ProductView } from '@inventory/domain'
import { CloseIcon, ListIcon, Plus } from './icons'
import { productWord, type Messages } from './i18n'
import { DeleteButton, ProductLine } from './product-line'
import { Button, EmptyHint, PageHead } from './primitives'

function Dates({ value, locale }: { value: string; locale: Locale }) {
  return (
    <div className="dates">
      <span className="dates__short">{formatShortDate(value)}</span>
      <span>{formatLongDate(value, locale)}</span>
    </div>
  )
}

type OrdersProps = {
  messages: Messages
  locale: Locale
  orders: OrderView[]
  total: number
  query: string
  selected: OrderView | null
  onOpen: (id: number) => void
  onClose: () => void
  onCreate: () => void
  onDeleteOrder: (order: OrderView) => void
  onDeleteProduct: (product: ProductView) => void
  onAddProduct: () => void
}

export function Orders(props: OrdersProps) {
  const { messages, locale, orders, total, query, selected } = props
  const products = selected?.products ?? []
  return (
    <section>
      <PageHead
        title={messages.orders.title}
        total={total}
        shown={query && orders.length !== total ? orders.length : undefined}
        messages={messages}
        lead={(
          <Button variant="plus" aria-label={messages.orders.add} onClick={props.onCreate}>
            <Plus />
          </Button>
        )}
      />
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
          <article key={selected.id} className="panel animate__animated animate__fadeIn">
            <div className="panel__head">
              <h2 className="panel__title">{selected.title}</h2>
              <Button variant="icon" className="icon-button--ghost panel__close" aria-label={messages.close} onClick={props.onClose}>
                <CloseIcon />
              </Button>
            </div>
            <Button variant="link" onClick={props.onAddProduct}>
              <Plus /> {messages.orders.addProduct}
            </Button>
            {products.length === 0 ? <EmptyHint>{messages.orders.products}</EmptyHint> : null}
            {products.map((product) => (
              <ProductLine key={product.id} product={product} messages={messages} onDelete={props.onDeleteProduct} />
            ))}
          </article>
        </div>
      ) : (
        <div className="order-list">
          {orders.length === 0 ? <EmptyHint>{query ? messages.orders.filtered : messages.orders.empty}</EmptyHint> : null}
          {orders.map((order) => (
            <article key={order.id} className="order-row">
              <a className="order-row__title" href={routes.order(order.id, query || undefined)}>
                {order.title}
              </a>
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
              <DeleteButton label={messages.delete} onClick={() => props.onDeleteOrder(order)} />
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
