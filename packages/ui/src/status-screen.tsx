'use client'

import { routes } from '@inventory/domain'
import { Button } from './primitives'
import { messagesFor, type Messages } from './i18n'

export function StatusScreen({
  kind,
  messages,
  onRetry,
  homeHref = routes.orders(),
}: {
  kind: 'not-found' | 'error'
  messages?: Messages
  onRetry?: () => void
  homeHref?: string
}) {
  const copy = messages ?? messagesFor('ru')
  const title = kind === 'not-found' ? copy.status.notFoundTitle : copy.status.errorTitle
  const text = kind === 'not-found' ? copy.status.notFoundText : copy.status.errorText
  return (
    <div className="login-page">
      <div className="login-card stack">
        <p className="muted">{kind === 'not-found' ? '404' : '500'}</p>
        <h1>{title}</h1>
        <p>{text}</p>
        {kind === 'not-found' ? (
          <a className="btn" href={homeHref}>{copy.status.notFoundCta}</a>
        ) : (
          <Button onClick={onRetry}>{copy.status.errorRetry}</Button>
        )}
      </div>
    </div>
  )
}
