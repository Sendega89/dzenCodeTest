import { cookies } from 'next/headers'
import { loadSnapshot } from '@inventory/db'
import { catalogType, localeOf } from '@inventory/domain'

export async function productsContext(
  searchParams: Promise<{ q?: string; spec?: string }>,
  slug?: string,
) {
  const locale = localeOf((await cookies()).get('locale')?.value)
  const snapshot = await loadSnapshot()
  const params = await searchParams
  const query = params.q ?? ''
  const specification = params.spec ?? ''
  if (!slug) return { locale, snapshot, type: '', query, specification }
  const type = catalogType(decodeURIComponent(slug), snapshot.products)
  if (!type) return null
  return { locale, snapshot, type, query, specification }
}
