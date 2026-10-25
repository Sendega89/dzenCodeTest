import { SignJWT, jwtVerify } from 'jose'

export const TOKEN_COOKIE = 'inventory_token'
export const TOKEN_MAX_AGE = 60 * 60 * 24 * 7
const DEMO_SECRET = 'inventory-demo-secret'
const LOGIN_WINDOW_MS = 60_000
const LOGIN_MAX = 20
const loginHits = new Map<string, number[]>()

function secret() {
  const value = process.env.JWT_SECRET || DEMO_SECRET
  if (process.env.VERCEL && value === DEMO_SECRET) {
    console.warn('JWT_SECRET is still the demo default; set a unique secret in the host env')
  }
  return new TextEncoder().encode(value)
}

export function cookieAuth(secure: boolean) {
  return {
    httpOnly: true as const,
    sameSite: 'lax' as const,
    path: '/',
    maxAge: TOKEN_MAX_AGE,
    secure,
  }
}

export function requestIsSecure(request: { headers: Headers }): boolean {
  if (process.env.VERCEL) return true
  return request.headers.get('x-forwarded-proto') === 'https'
}

export function allowLoginAttempt(key: string): boolean {
  const now = Date.now()
  const recent = (loginHits.get(key) ?? []).filter((stamp) => now - stamp < LOGIN_WINDOW_MS)
  if (recent.length >= LOGIN_MAX) {
    loginHits.set(key, recent)
    return false
  }
  recent.push(now)
  loginHits.set(key, recent)
  return true
}

export function clientKey(request: { headers: Headers }): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0]?.trim() || 'unknown'
  return request.headers.get('x-real-ip') || 'local'
}

export async function signToken(user: { id: number; login: string }): Promise<string> {
  return new SignJWT({ login: user.login })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(String(user.id))
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret())
}

export async function readToken(token: string): Promise<{ id: number; login: string } | null> {
  try {
    const { payload } = await jwtVerify(token, secret())
    const id = Number(payload.sub)
    const login = typeof payload.login === 'string' ? payload.login : ''
    if (!id || !login) return null
    return { id, login }
  } catch {
    return null
  }
}

export function tokenFromHeader(header: string | null): string | null {
  if (!header) return null
  const [type, value] = header.split(' ')
  if (type?.toLowerCase() !== 'bearer' || !value) return null
  return value
}

export async function readSession(cookie?: string, authorization?: string | null) {
  const token = cookie || tokenFromHeader(authorization ?? null)
  return token ? readToken(token) : null
}

export function securityHeaders(): Record<string, string> {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  }
}
