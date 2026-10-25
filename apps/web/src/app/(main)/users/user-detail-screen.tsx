'use client'

import { UserDetail } from '@inventory/ui'
import { useAppSelector, useI18n } from '@/providers'

export function UserDetailScreen({ userId }: { userId: number }) {
  const { messages, locale } = useI18n()
  const snapshot = useAppSelector((state) => state.inventory)
  const user = snapshot.users.find((item) => item.id === userId) ?? null
  if (!user) return null
  const products = snapshot.products.filter((product) => product.userId === user.id)
  return <UserDetail messages={messages} locale={locale} user={user} products={products} />
}
