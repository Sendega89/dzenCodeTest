import { NextResponse, type NextRequest } from 'next/server'
import { TOKEN_COOKIE, readSession, securityHeaders } from '@inventory/auth'
import { parseId, routes } from '@inventory/domain'

const OPEN = new Set(['/login', '/api/auth/login', '/api/health', '/api/graphql'])

function withSecurity(response: NextResponse) {
  for (const [key, value] of Object.entries(securityHeaders())) {
    response.headers.set(key, value)
  }
  return response
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  if (OPEN.has(pathname) || pathname.startsWith('/_next') || pathname.includes('.')) {
    return withSecurity(NextResponse.next())
  }

  const legacyId = pathname === '/orders' ? parseId(request.nextUrl.searchParams.get('id') ?? '') : null
  if (legacyId) {
    const url = request.nextUrl.clone()
    url.pathname = routes.order(legacyId)
    url.searchParams.delete('id')
    return withSecurity(NextResponse.redirect(url))
  }

  const user = await readSession(request.cookies.get(TOKEN_COOKIE)?.value, request.headers.get('authorization'))
  if (user) return withSecurity(NextResponse.next())
  if (pathname.startsWith('/api/')) {
    return withSecurity(NextResponse.json({ error: 'unauthorized' }, { status: 401 }))
  }
  const url = request.nextUrl.clone()
  url.pathname = routes.login()
  url.search = ''
  return withSecurity(NextResponse.redirect(url))
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
