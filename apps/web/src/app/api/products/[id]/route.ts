import { getRepo } from '@inventory/db'
import { handle } from '@/server/http'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  return handle(() => getRepo().deleteProduct(Number(id)))
}
