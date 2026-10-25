import { getRepo } from '@inventory/db'
import { json } from '@/server/http'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const id = typeof body?.clientId === 'string' ? body.clientId : ''
  if (!/^[\w-]{8,64}$/.test(id)) return json({ error: 'validation' }, 400)
  const snapshot = await getRepo().leavePresence(id)
  return json({ count: snapshot.presenceCount })
}
