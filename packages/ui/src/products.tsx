'use client'

import { formatLongDate, formatMoney, formatShortDate, routes, type Locale, type ProductView } from '@inventory/domain'
import { Plus } from './icons'
import type { Messages } from './i18n'
import { DeleteButton, ProductIdentity, ProductStatus, StatusDot } from './product-line'
import { Button, EmptyHint, PageHead } from './primitives'

type ProductsProps = {
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
  onDelete: (product: ProductView) => void
  onCreate: () => void
  onReset: () => void
}

export function Products(props: ProductsProps) {
  const { messages, locale, products, total } = props
  const filtered = Boolean(props.type || props.specification)
  return (
    <section>
      <PageHead
        title={messages.products.title}
        total={total}
        shown={filtered ? products.length : undefined}
        messages={messages}
        trail={(
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
          <Button variant="link" onClick={props.onCreate}>
            <Plus /> {messages.products.add}
          </Button>
        </div>
        )}
      />
      {products.length === 0 ? (
        <EmptyHint>
          {filtered || total > 0 ? messages.products.filtered : messages.products.empty}{' '}
          {filtered ? (
            <Button variant="link" onClick={props.onReset}>{messages.products.reset}</Button>
          ) : null}
        </EmptyHint>
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
                    <StatusDot status={product.status} />
                  </td>
                  <td data-label={messages.products.title}>
                    <ProductIdentity product={product} href={routes.product(product.id)} />
                    <ProductStatus status={product.status} messages={messages} />
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
                  <td data-label={messages.products.user}>
                    {product.userId && product.userLogin ? (
                      <a href={routes.user({ id: product.userId, login: product.userLogin })}>{product.userName}</a>
                    ) : messages.dash}
                  </td>
                  <td data-label={messages.products.order}>
                    <a href={routes.order(product.orderId)}>{product.orderTitle}</a>
                    <div className="muted">{formatLongDate(product.createdAt, locale)}</div>
                  </td>
                  <td data-label={messages.delete}>
                    <DeleteButton label={messages.delete} onClick={() => props.onDelete(product)} />
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
