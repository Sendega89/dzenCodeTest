import { NextResponse, type NextRequest } from 'next/server'
import { readToken, TOKEN_COOKIE } from '@inventory/auth'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  if (pathname.startsWith('/_next') || pathname.includes('.')) return NextResponse.next()
  const token = request.cookies.get(TOKEN_COOKIE)?.value
  const user = token ? await readToken(token) : null
  if (user) return NextResponse.next()
  return NextResponse.redirect(new URL('/login', request.url))
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
