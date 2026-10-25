'use client'

import { StatusScreen } from '@inventory/ui'
import { useI18n } from '@/providers'

export default function MainNotFound() {
  const { messages } = useI18n()
  return <StatusScreen kind="not-found" messages={messages} />
}
