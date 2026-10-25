import { signToken, TOKEN_COOKIE } from '@inventory/auth'
import { getRepo } from '@inventory/db'
import { loginSchema } from '@inventory/domain'
import { json } from '@/server/http'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const parsed = loginSchema.safeParse(body)
  if (!parsed.success) return json({ error: 'validation' }, 400)
  const user = await getRepo().authenticate(parsed.data.login, parsed.data.password)
  if (!user) return json({ error: 'unauthorized' }, 401)
  const token = await signToken(user)
  const response = json({ token, user })
  response.cookies.set(TOKEN_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })
  return response
}
