import { notFound } from 'next/navigation'
import { loadSnapshot } from '@inventory/db'
import { parseId } from '@inventory/domain'
import { OrdersScreen } from '../orders-screen'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const id = parseId((await params).id)
  return { title: id ? `Inventory · ${id}` : 'Inventory' }
}

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const id = parseId((await params).id)
  if (id == null) notFound()
  const snapshot = await loadSnapshot()
  if (!snapshot.orders.some((order) => order.id === id)) notFound()
  return <OrdersScreen selectedId={id} />
}
