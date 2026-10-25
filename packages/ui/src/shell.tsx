'use client'

import { useEffect, useState } from 'react'
import { routes, type Locale } from '@inventory/domain'
import { Avatar, Gear, Logo, MenuIcon } from './icons'
import type { Messages } from './i18n'
import { NavigationMenu } from './navigation-menu'
import { TopMenu } from './top-menu'

type ShellProps = {
  messages: Messages
  locale: Locale
  pathname: string
  query: string
  onSearch: (value: string) => void
  children: React.ReactNode
}

export function Shell({ messages, locale, pathname, query, onSearch, children }: ShellProps) {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState(query)

  useEffect(() => setValue(query), [query])
  useEffect(() => {
    const timer = window.setTimeout(() => onSearch(value), 250)
    return () => window.clearTimeout(timer)
  }, [value, onSearch])

  return (
    <div className="shell">
      <aside className={open ? 'sidebar sidebar--open' : 'sidebar'}>
        <div className="sidebar__user">
          <Avatar />
          <a className="avatar__gear" href={routes.settings()} aria-label={messages.nav.settings}>
            <Gear />
          </a>
        </div>
        <NavigationMenu pathname={pathname} messages={messages} onNavigate={() => setOpen(false)} />
      </aside>
      {open ? <button type="button" className="nav-backdrop" aria-label={messages.close} onClick={() => setOpen(false)} /> : null}
      <div className="shell__body">
        <header className="topbar">
          <button type="button" className="icon-button topbar__menu" aria-label={messages.menu} onClick={() => setOpen(true)}>
            <MenuIcon />
          </button>
          <a className="brand" href={routes.orders()}>
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
          <TopMenu messages={messages} locale={locale} />
        </header>
        <main className="content">{children}</main>
      </div>
    </div>
  )
}
