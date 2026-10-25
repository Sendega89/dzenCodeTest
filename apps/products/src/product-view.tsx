'use client'

import type { Locale, Snapshot } from '@inventory/domain'
import { AppChrome, ProductDetail, messagesFor } from '@inventory/ui'

export function ProductView({ locale, snapshot, productId }: { locale: Locale; snapshot: Snapshot; productId: number }) {
  const messages = messagesFor(locale)
  const product = snapshot.products.find((item) => item.id === productId)
  if (!product) return null
  return (
    <AppChrome
      messages={messages}
      locale={locale}
      pathname="/products"
      query=""
      onSearch={(value) => {
        if (value) window.location.href = `/products?q=${encodeURIComponent(value)}`
      }}
    >
      <ProductDetail messages={messages} locale={locale} product={product} />
    </AppChrome>
  )
}
