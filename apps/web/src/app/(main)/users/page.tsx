'use client'

import { UsersBoard } from '@inventory/ui'
import { useAppSelector, useI18n } from '@/providers'

export default function UsersPage() {
  const { messages } = useI18n()
  const users = useAppSelector((state) => state.inventory.users)
  return <UsersBoard messages={messages} users={users} />
}
