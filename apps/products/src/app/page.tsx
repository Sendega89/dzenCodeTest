import { ProductsHome } from '@/home'
import { productsContext } from '@/context'

export const dynamic = 'force-dynamic'

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; spec?: string }>
}) {
  const context = await productsContext(searchParams)
  if (!context) return null
  return <ProductsHome {...context} />
}
