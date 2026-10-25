'use client'

import { formatLongDate, formatMoney, formatShortDate, type Locale, type ProductView } from '@inventory/domain'
import { Plus, Trash } from './icons'
import type { Messages } from './i18n'

type ProductsBoardProps = {
  messages: Messages
  locale: Locale
  products: ProductView[]
  total: number
  type: string
  specification: string
  types: string[]
  specifications: string[]
  onType: (value: string) => void
  onSpecification: (value: string) => void
  onOpenOrder: (id: number) => void
  onDelete: (product: ProductView) => void
  onCreate: () => void
  onReset: () => void
}

export function ProductsBoard(props: ProductsBoardProps) {
  const { messages, locale, products, total } = props
  const filtered = Boolean(props.type || props.specification)
  return (
    <section>
      <div className="page-head">
        <h1>
          {messages.products.title} / {total}
        </h1>
        {filtered ? (
          <span className="muted">
            {messages.shown} {products.length}
          </span>
        ) : null}
        <div className="filters">
          <label>
            {messages.products.type}
            <select aria-label={messages.products.type} value={props.type} onChange={(event) => props.onType(event.target.value)}>
              <option value="">{messages.products.all}</option>
              {props.types.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </label>
          <label>
            {messages.products.specification}
            <select aria-label={messages.products.specification} value={props.specification} onChange={(event) => props.onSpecification(event.target.value)}>
              <option value="">{messages.products.all}</option>
              {props.specifications.map((specification) => (
                <option key={specification} value={specification}>{specification}</option>
              ))}
            </select>
          </label>
          <button type="button" className="linkish" onClick={props.onCreate}>
            <Plus /> {messages.products.add}
          </button>
        </div>
      </div>
      {products.length === 0 ? (
        <p className="muted">
          {filtered || total > 0 ? messages.products.filtered : messages.products.empty}{' '}
          {filtered ? (
            <button type="button" className="linkish" onClick={props.onReset}>{messages.products.reset}</button>
          ) : null}
        </p>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th />
                <th>{messages.products.title}</th>
                <th>{messages.products.type}</th>
                <th>{messages.products.guarantee}</th>
                <th>{messages.products.price}</th>
                <th>{messages.products.group}</th>
                <th>{messages.products.user}</th>
                <th>{messages.products.order}</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td data-label="">
                    <span className={product.status === 'repair' ? 'dot dot--repair' : 'dot'} />
                  </td>
                  <td data-label={messages.products.title}>
                    <div className="product-line__title">{product.title}</div>
                    <div className="product-line__sn">SN: {product.serialNumber}</div>
                    <div className={product.status === 'repair' ? 'status status--repair' : 'status'}>
                      {product.status === 'repair' ? messages.products.repair : messages.products.free}
                    </div>
                  </td>
                  <td data-label={messages.products.type}>
                    <div>{product.type}</div>
                    <div className="muted">{product.isNew ? messages.products.isNew : messages.products.used}</div>
                  </td>
                  <td data-label={messages.products.guarantee}>
                    <div className="nowrap">{formatShortDate(product.guaranteeStart)}/{product.guaranteeStart.slice(0, 4)}</div>
                    <div className="nowrap">{formatLongDate(product.guaranteeEnd, locale)}</div>
                  </td>
                  <td data-label={messages.products.price}>
                    <div className="nowrap">{formatMoney(product.price.find((price) => price.symbol === 'USD')?.value ?? 0, 'USD')}</div>
                    <div className="nowrap">{formatMoney(product.price.find((price) => price.symbol === 'UAH')?.value ?? 0, 'UAH')}</div>
                  </td>
                  <td data-label={messages.products.group}>{product.groupName ?? messages.dash}</td>
                  <td data-label={messages.products.user}>{product.userName ?? messages.dash}</td>
                  <td data-label={messages.products.order}>
                    <a href={`/orders?id=${product.orderId}`}>{product.orderTitle}</a>
                    <div className="muted">{formatLongDate(product.createdAt, locale)}</div>
                  </td>
                  <td data-label={messages.delete}>
                    <button type="button" className="trash" aria-label={messages.delete} onClick={() => props.onDelete(product)}>
                      <Trash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
