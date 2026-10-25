import { NextResponse, type NextRequest } from 'next/server'
import { readToken, TOKEN_COOKIE } from '@inventory/auth'

const OPEN = new Set(['/login', '/api/auth/login', '/api/health', '/api/graphql'])

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  if (OPEN.has(pathname) || pathname.startsWith('/_next') || pathname.includes('.')) {
    return NextResponse.next()
  }
  const token = request.cookies.get(TOKEN_COOKIE)?.value ?? bearer(request.headers.get('authorization'))
  const user = token ? await readToken(token) : null
  if (user) return NextResponse.next()
  if (pathname.startsWith('/api/')) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }
  const url = request.nextUrl.clone()
  url.pathname = '/login'
  url.search = ''
  return NextResponse.redirect(url)
}

function bearer(header: string | null): string | null {
  if (!header?.toLowerCase().startsWith('bearer ')) return null
  return header.slice(7)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
