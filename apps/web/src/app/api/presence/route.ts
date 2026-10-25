import { getRepo } from '@inventory/db'
import { json } from '@/server/http'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function clientId(value: unknown): string | null {
  return typeof value === 'string' && /^[\w-]{8,64}$/.test(value) ? value : null
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const id = clientId(body?.clientId)
  if (!id) return json({ error: 'validation' }, 400)
  const snapshot = await getRepo().touchPresence(id)
  return json({ count: snapshot.presenceCount })
}
