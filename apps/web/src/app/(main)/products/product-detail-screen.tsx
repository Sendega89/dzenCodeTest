'use client'

import { ProductDetail } from '@inventory/ui'
import { useAppSelector, useI18n } from '@/providers'

export function ProductDetailScreen({ productId }: { productId: number }) {
  const { messages, locale } = useI18n()
  const product = useAppSelector((state) => state.inventory.products.find((item) => item.id === productId) ?? null)
  if (!product) return null
  return <ProductDetail messages={messages} locale={locale} product={product} />
}
