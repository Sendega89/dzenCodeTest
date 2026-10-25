import { cookies } from 'next/headers'
import type { Locale, Snapshot } from '@inventory/domain'
import { ProductsHome } from '@/home'

export const dynamic = 'force-dynamic'

async function loadSnapshot(): Promise<Snapshot> {
  const gateway = process.env.GATEWAY_URL?.replace(/\/$/, '')
  if (!gateway) throw new Error('GATEWAY_URL is required for the products microfrontend')
  const response = await fetch(`${gateway}/api/snapshot`, { cache: 'no-store' })
  if (!response.ok) throw new Error(`snapshot failed: ${response.status}`)
  return response.json() as Promise<Snapshot>
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string; spec?: string }>
}) {
  const jar = await cookies()
  const locale: Locale = jar.get('locale')?.value === 'en' ? 'en' : 'ru'
  const params = await searchParams
  const snapshot = await loadSnapshot()
  return (
    <ProductsHome
      locale={locale}
      snapshot={snapshot}
      query={params.q ?? ''}
      type={params.type ?? ''}
      specification={params.spec ?? ''}
    />
  )
}
