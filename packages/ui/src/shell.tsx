'use client'

import { useEffect, useState } from 'react'
import { dayCaption, formatClock, formatHeaderDate, type Locale } from '@inventory/domain'
import { Avatar, ClockIcon, Gear, Logo, MenuIcon } from './icons'
import type { Messages } from './i18n'

const LINKS = [
  { href: '/orders', key: 'orders' },
  { href: '/groups', key: 'groups' },
  { href: '/products', key: 'products' },
  { href: '/users', key: 'users' },
  { href: '/settings', key: 'settings' },
] as const

type ShellProps = {
  messages: Messages
  locale: Locale
  pathname: string
  query: string
  tabCount: number | null
  onSearch: (value: string) => void
  children: React.ReactNode
}

export function Shell({ messages, locale, pathname, query, tabCount, onSearch, children }: ShellProps) {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState(query)
  const [now, setNow] = useState<Date | null>(null)

  useEffect(() => setValue(query), [query])
  useEffect(() => {
    setNow(new Date())
    const timer = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(timer)
  }, [])
  useEffect(() => {
    const timer = window.setTimeout(() => onSearch(value), 250)
    return () => window.clearTimeout(timer)
  }, [value, onSearch])

  return (
    <div className="shell">
      <aside className={open ? 'sidebar sidebar--open' : 'sidebar'}>
        <div className="sidebar__user">
          <Avatar />
          <a className="avatar__gear" href="/settings" aria-label={messages.nav.settings}>
            <Gear />
          </a>
        </div>
        <nav className="nav" aria-label={messages.menu}>
          {LINKS.map((link) => {
            const active = pathname === link.href || pathname.startsWith(`${link.href}/`)
            return (
              <a
                key={link.href}
                href={link.href}
                className={active ? 'nav__link nav__link--active' : 'nav__link'}
                aria-current={active ? 'page' : undefined}
                onClick={() => setOpen(false)}
              >
                {messages.nav[link.key]}
              </a>
            )
          })}
        </nav>
      </aside>
      {open ? <button type="button" className="nav-backdrop" aria-label={messages.close} onClick={() => setOpen(false)} /> : null}
      <div className="shell__body">
        <header className="topbar">
          <button type="button" className="icon-button topbar__menu" aria-label={messages.menu} onClick={() => setOpen(true)}>
            <MenuIcon />
          </button>
          <a className="brand" href="/orders">
            <Logo />
            {messages.brand}
          </a>
          <form className="search" role="search" onSubmit={(event) => event.preventDefault()}>
            <input
              value={value}
              placeholder={messages.search}
              aria-label={messages.search}
              onChange={(event) => setValue(event.target.value)}
            />
          </form>
          <div className="clock">
            <div>
              <div className="clock__caption">{now ? dayCaption(now, locale, messages.today) : messages.today}</div>
              <div className="clock__date">{now ? formatHeaderDate(now, locale) : ''}</div>
            </div>
            <div className="clock__time">
              <ClockIcon />
              <span>{now ? formatClock(now) : '--:--:--'}</span>
            </div>
            <div className="counter" aria-label={messages.tabs} title={messages.tabs}>
              {tabCount ?? '·'}
            </div>
          </div>
        </header>
        <main className="content">{children}</main>
      </div>
    </div>
  )
}
