import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import { localeOf, parseId } from '@inventory/domain'
import { ProductsHome } from '@/home'
import { ProductView } from '@/product-view'
import { productsContext } from '@/context'
import { loadSnapshot } from '@inventory/db'

export const dynamic = 'force-dynamic'

export default async function TypePage({
  params,
  searchParams,
}: {
  params: Promise<{ type: string }>
  searchParams: Promise<{ q?: string; spec?: string }>
}) {
  const segment = decodeURIComponent((await params).type)
  const id = parseId(segment)
  if (id) {
    const locale = localeOf((await cookies()).get('locale')?.value)
    const snapshot = await loadSnapshot()
    if (!snapshot.products.some((product) => product.id === id)) notFound()
    return <ProductView locale={locale} snapshot={snapshot} productId={id} />
  }
  const context = await productsContext(searchParams, segment)
  if (!context) notFound()
  return <ProductsHome {...context} />
}
