'use client'

import { useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { routes, type Snapshot } from '@inventory/domain'
import { ProductsWorkspace, useCatalogNav, useSnapshotMutation } from '@inventory/ui'
import { api } from '@/api'
import { useAppDispatch, useAppSelector, useI18n } from '@/providers'
import { applySnapshot } from '@/store'

export function ProductsScreen({ type }: { type: string }) {
  const { messages, locale } = useI18n()
  const snapshot = useAppSelector((state) => state.inventory)
  const dispatch = useAppDispatch()
  const router = useRouter()
  const params = useSearchParams()
  const query = (params.get('q') ?? '').trim().toLowerCase()
  const specification = params.get('spec') ?? ''
  const filters = useCatalogNav(router, routes, { type: type || undefined, spec: specification || undefined, q: query || undefined })
  const apply = useCallback((next: Snapshot) => {
    dispatch(applySnapshot(next))
    router.refresh()
  }, [dispatch, router])
  const { pending, error, commit } = useSnapshotMutation(messages.error, apply)

  return (
    <ProductsWorkspace
      messages={messages}
      locale={locale}
      snapshot={snapshot}
      query={query}
      type={type}
      specification={specification}
      pending={pending}
      error={error}
      onType={filters.onType}
      onSpecification={filters.onSpecification}
      onReset={filters.onReset}
      onCreate={(value) => commit(() => api.post<Snapshot>('/api/products', value).then((response) => response.data))}
      onDelete={(id) => commit(() => api.delete<Snapshot>(`/api/products/${id}`).then((response) => response.data))}
    />
  )
}
