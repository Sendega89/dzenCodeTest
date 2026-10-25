'use client'

import { StatusScreen } from '@inventory/ui'

export default function ErrorPage({ error: _error, reset }: { error: Error; reset: () => void }) {
  return <StatusScreen kind="error" onRetry={reset} />
}
