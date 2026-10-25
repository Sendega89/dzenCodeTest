'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AppRoutes, type Locale, type Snapshot } from '@inventory/domain'
import { AppChrome, ProductsWorkspace, messagesFor, requestJson, useCatalogNav, useSnapshotMutation } from '@inventory/ui'

const catalog = new AppRoutes({ orders: '/orders', products: '' })

type Props = {
  locale: Locale
  snapshot: Snapshot
  query: string
  type: string
  specification: string
}

export function ProductsHome({ locale, snapshot, query, type, specification }: Props) {
  const messages = messagesFor(locale)
  const router = useRouter()
  const [data, setData] = useState(snapshot)
  const filters = useCatalogNav(
    router,
    catalog,
    { type: type || undefined, spec: specification || undefined, q: query || undefined },
    'replace',
  )
  const apply = useCallback((next: Snapshot) => {
    setData(next)
    router.refresh()
  }, [router])
  const { pending, error, commit } = useSnapshotMutation(messages.error, apply)

  useEffect(() => setData(snapshot), [snapshot])

  const onSearch = useCallback((value: string) => {
    if (value === query) return
    router.replace(catalog.productNav({ type: type || undefined, spec: specification || undefined }).search(value))
  }, [query, router, specification, type])

  return (
    <AppChrome messages={messages} locale={locale} pathname="/products" query={query} onSearch={onSearch}>
      <ProductsWorkspace
        messages={messages}
        locale={locale}
        snapshot={data}
        query={query.trim().toLowerCase()}
        type={type}
        specification={specification}
        pending={pending}
        error={error}
        onType={filters.onType}
        onSpecification={filters.onSpecification}
        onReset={filters.onReset}
        onCreate={(value) => commit(() => requestJson('/api/products', 'POST', value))}
        onDelete={(id) => commit(() => requestJson(`/api/products/${id}`, 'DELETE'))}
      />
    </AppChrome>
  )
}
