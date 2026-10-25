import { createInventoryYoga, getRepo } from '@inventory/db'
import { json } from '@/server/http'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const yoga = createInventoryYoga(getRepo())

async function handle(request: Request) {
  try {
    return await yoga.fetch(request)
  } catch (error) {
    console.error(error)
    return json({ error: 'server' }, 500)
  }
}

export { handle as GET, handle as POST }
