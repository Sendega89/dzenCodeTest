import { json } from '@/server/http'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const locale = body?.locale === 'en' ? 'en' : 'ru'
  const response = json({ locale })
  response.cookies.set('locale', locale, { path: '/', maxAge: 60 * 60 * 24 * 365, sameSite: 'lax' })
  return response
}
