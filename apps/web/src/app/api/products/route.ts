import { getRepo } from '@inventory/db'
import { handle } from '@/server/http'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  return handle(() => getRepo().createProduct(body))
}
