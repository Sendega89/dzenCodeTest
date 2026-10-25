'use client'

import { useCallback, useEffect } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { routes } from '@inventory/domain'
import { AppChrome } from '@inventory/ui'
import { useI18n } from './providers'

export function Frame({ children }: { children: React.ReactNode }) {
  const { messages, locale } = useI18n()
  const pathname = usePathname()
  const params = useSearchParams()
  const router = useRouter()
  const query = params.get('q') ?? ''

  const onSearch = useCallback(
    (value: string) => {
      const current = params.get('q') ?? ''
      if (current === value) return
      const next = new URLSearchParams(params.toString())
      if (value) next.set('q', value)
      else next.delete('q')
      if (!routes.isOrders(pathname) && !routes.isProductCatalog(pathname)) {
        if (!value) return
        router.push(routes.products({ q: value }))
        return
      }
      const search = next.toString()
      router.replace(search ? `${pathname}?${search}` : pathname)
    },
    [params, pathname, router],
  )

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      void navigator.serviceWorker.register('/sw.js').catch(() => undefined)
    }
  }, [])

  return (
    <AppChrome messages={messages} locale={locale} pathname={pathname} query={query} onSearch={onSearch}>
      {children}
    </AppChrome>
  )
}
