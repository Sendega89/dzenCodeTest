'use client'

import { useEffect, useState } from 'react'
import { dayCaption, formatClock, formatHeaderDate, type Locale } from '@inventory/domain'
import { ClockIcon } from './icons'
import type { Messages } from './i18n'
import { realtimeChannel, usePresence } from './use-presence'

export function TopMenu({ messages, locale }: { messages: Messages; locale: Locale }) {
  const sessions = usePresence()
  const [now, setNow] = useState<Date | null>(null)

  useEffect(() => {
    setNow(new Date())
    const timer = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  return (
    <div className="top-menu" role="group" aria-label={messages.tabs}>
      <div>
        <div className="clock__caption">{now ? dayCaption(now, locale, messages.today) : messages.today}</div>
        <div className="clock__date">{now ? formatHeaderDate(now, locale) : ''}</div>
      </div>
      <div className="clock__time">
        <ClockIcon />
        <time dateTime={now?.toISOString()}>{now ? formatClock(now) : '--:--:--'}</time>
      </div>
      <div className="counter" data-realtime={realtimeChannel()} aria-label={messages.tabs} title={messages.tabs}>
        {sessions ?? '·'}
      </div>
    </div>
  )
}
