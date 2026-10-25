'use client'

import type { ReactNode } from 'react'
import { formatLongDate, formatMoney, formatShortDate, routes, type Locale, type ProductView, type UserView } from '@inventory/domain'
import { productWord, type Messages } from './i18n'
import { PageHead } from './primitives'
import { ProductIdentity, ProductStatus, StatusDot } from './product-line'

function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="fact">
      <dt>{label}</dt>
      <dd>{children}</dd>
    </div>
  )
}

export function ProductDetail({
  messages,
  locale,
  product,
}: {
  messages: Messages
  locale: Locale
  product: ProductView
}) {
  const usd = product.price.find((price) => price.symbol === 'USD')?.value ?? 0
  const uah = product.price.find((price) => price.symbol === 'UAH')?.value ?? 0
  return (
    <section className="detail">
      <PageHead title={messages.products.page} messages={messages} />
      <a className="linkish" href={routes.products()}>{messages.products.back}</a>
      <article className="detail-card">
        <img className="detail-card__photo" src={product.photo || '/monitor.svg'} alt="" />
        <div>
          <div className="detail-card__kicker">
            <StatusDot status={product.status} />
            <ProductStatus status={product.status} messages={messages} />
          </div>
          <h2 className="detail-card__title">{product.title}</h2>
          <p className="muted">SN: {product.serialNumber}</p>
        </div>
        <dl className="facts">
          <Fact label={messages.products.type}>{product.type}</Fact>
          <Fact label={messages.products.specification}>{product.specification}</Fact>
          <Fact label={messages.forms.isNew}>{product.isNew ? messages.products.isNew : messages.products.used}</Fact>
          <Fact label={messages.products.guarantee}>
            {formatShortDate(product.guaranteeStart)} — {formatLongDate(product.guaranteeEnd, locale)}
          </Fact>
          <Fact label={messages.products.price}>
            {formatMoney(usd, 'USD')} · {formatMoney(uah, 'UAH')}
          </Fact>
          <Fact label={messages.products.order}>
            <a href={routes.order(product.orderId)}>{product.orderTitle}</a>
          </Fact>
          <Fact label={messages.products.group}>{product.groupName ?? messages.dash}</Fact>
          <Fact label={messages.products.user}>
            {product.userId && product.userLogin ? (
              <a href={routes.user({ id: product.userId, login: product.userLogin })}>{product.userName}</a>
            ) : messages.dash}
          </Fact>
          <Fact label={messages.products.created}>{formatLongDate(product.createdAt, locale)}</Fact>
        </dl>
      </article>
    </section>
  )
}

export function UserDetail({
  messages,
  locale,
  user,
  products,
}: {
  messages: Messages
  locale: Locale
  user: UserView
  products: ProductView[]
}) {
  return (
    <section className="detail">
      <PageHead title={messages.users.page} messages={messages} />
      <a className="linkish" href={routes.users()}>{messages.users.back}</a>
      <article className="detail-card">
        <div>
          <h2 className="detail-card__title">{user.name}</h2>
          <p className="muted">{user.login}</p>
          <p>
            {user.productCount} {productWord(user.productCount, locale)}
          </p>
        </div>
        <div className="detail-card__list">
          <h3>{messages.users.assigned}</h3>
          {products.length === 0 ? <p className="muted">{messages.users.none}</p> : null}
          {products.map((product) => (
            <a key={product.id} className="product-line" href={routes.product(product.id)}>
              <StatusDot status={product.status} />
              <img className="thumb" src={product.photo || '/monitor.svg'} alt="" />
              <ProductIdentity product={product} />
              <ProductStatus status={product.status} messages={messages} />
            </a>
          ))}
        </div>
      </article>
    </section>
  )
}
