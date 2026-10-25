'use client'

import { StatusScreen } from '@inventory/ui'
import { useI18n } from '@/providers'

export default function RouteError({ reset }: { error: Error; reset: () => void }) {
  const { messages } = useI18n()
  return <StatusScreen kind="error" messages={messages} onRetry={reset} />
}
