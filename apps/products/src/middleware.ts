import { NextResponse, type NextRequest } from 'next/server'
import { TOKEN_COOKIE, readSession } from '@inventory/auth'
import { routes } from '@inventory/domain'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  if (pathname.startsWith('/_next') || pathname.includes('.')) return NextResponse.next()
  const user = await readSession(request.cookies.get(TOKEN_COOKIE)?.value)
  if (user) return NextResponse.next()
  return NextResponse.redirect(new URL(routes.login(), request.url))
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
