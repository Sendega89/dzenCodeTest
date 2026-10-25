'use client'

import { useMemo } from 'react'
import type { AppRoutes, ProductQuery } from '@inventory/domain'

type MiniRouter = { replace: (href: string) => void; push: (href: string) => void }

export function useCatalogNav(
  router: MiniRouter,
  routes: AppRoutes,
  query: ProductQuery,
  reset: 'push' | 'replace' = 'push',
) {
  const nav = useMemo(
    () => routes.productNav({ type: query.type, spec: query.spec, q: query.q }),
    [routes, query.type, query.spec, query.q],
  )
  return useMemo(
    () => ({
      onType: (value: string) => router.replace(nav.type(value)),
      onSpecification: (value: string) => router.replace(nav.spec(value)),
      onReset: () => (reset === 'push' ? router.push(nav.reset()) : router.replace(nav.reset())),
    }),
    [nav, reset, router],
  )
}
