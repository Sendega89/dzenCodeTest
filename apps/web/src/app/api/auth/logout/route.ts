import { TOKEN_COOKIE } from '@inventory/auth'
import { json } from '@/server/http'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST() {
  const response = json({ ok: true })
  response.cookies.set(TOKEN_COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 })
  return response
}
