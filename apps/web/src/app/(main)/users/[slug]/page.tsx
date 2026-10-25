import { notFound } from 'next/navigation'
import { loadSnapshot } from '@inventory/db'
import { resolveUser } from '@inventory/domain'
import { UserDetailScreen } from '../user-detail-screen'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  return { title: `${decodeURIComponent((await params).slug)} · Inventory` }
}

export default async function UserPage({ params }: { params: Promise<{ slug: string }> }) {
  const snapshot = await loadSnapshot()
  const user = resolveUser((await params).slug, snapshot.users)
  if (!user) notFound()
  return <UserDetailScreen userId={user.id} />
}
