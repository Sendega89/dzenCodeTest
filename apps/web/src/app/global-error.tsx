'use client'

import { StatusScreen } from '@inventory/ui'
import '@inventory/ui/styles.css'

export default function GlobalError({ error: _error, reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="ru">
      <body>
        <StatusScreen kind="error" onRetry={reset} />
      </body>
    </html>
  )
}
