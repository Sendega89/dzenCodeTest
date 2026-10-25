import { notFound } from 'next/navigation'
import { loadSnapshot } from '@inventory/db'
import { catalogType, parseId } from '@inventory/domain'
import { ProductDetailScreen } from '../product-detail-screen'
import { ProductsScreen } from '../products-screen'

export async function generateMetadata({ params }: { params: Promise<{ type: string }> }) {
  const segment = decodeURIComponent((await params).type)
  return { title: `Inventory · ${segment}` }
}

export default async function ProductsSegmentPage({ params }: { params: Promise<{ type: string }> }) {
  const segment = decodeURIComponent((await params).type)
  const snapshot = await loadSnapshot()
  const id = parseId(segment)
  if (id) {
    if (!snapshot.products.some((product) => product.id === id)) notFound()
    return <ProductDetailScreen productId={id} />
  }
  const type = catalogType(segment, snapshot.products)
  if (!type) notFound()
  return <ProductsScreen type={type} />
}
