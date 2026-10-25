'use client'

import type { Locale } from '@inventory/domain'
import { ErrorBoundary } from './error-boundary'
import type { Messages } from './i18n'
import { Shell } from './shell'

export function AppChrome({
  messages,
  locale,
  pathname,
  query,
  onSearch,
  children,
}: {
  messages: Messages
  locale: Locale
  pathname: string
  query: string
  onSearch: (value: string) => void
  children: React.ReactNode
}) {
  return (
    <Shell messages={messages} locale={locale} pathname={pathname} query={query} onSearch={onSearch}>
      <ErrorBoundary messages={messages}>
        <div key={pathname} className="container-fluid px-0 animate__animated animate__fadeIn page-transition">
          {children}
        </div>
      </ErrorBoundary>
    </Shell>
  )
}
