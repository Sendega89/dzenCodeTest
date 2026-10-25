'use client'

import { routes } from '@inventory/domain'
import type { Messages } from './i18n'

const LINKS = [
  { href: routes.orders(), key: 'orders' as const },
  { href: routes.products(), key: 'products' as const },
  { href: routes.groups(), key: 'groups' as const },
  { href: routes.users(), key: 'users' as const },
  { href: routes.settings(), key: 'settings' as const },
]

export function NavigationMenu({
  pathname,
  messages,
  onNavigate,
}: {
  pathname: string
  messages: Messages
  onNavigate?: () => void
}) {
  return (
    <nav className="nav" aria-label={messages.menu}>
      {LINKS.map((link) => {
        const active = pathname === link.href || pathname.startsWith(`${link.href}/`)
        return (
          <a
            key={link.href}
            href={link.href}
            className={active ? 'nav__link nav__link--active' : 'nav__link'}
            aria-current={active ? 'page' : undefined}
            onClick={onNavigate}
          >
            {messages.nav[link.key]}
          </a>
        )
      })}
    </nav>
  )
}
