import { SignJWT, jwtVerify } from 'jose'

export const TOKEN_COOKIE = 'inventory_token'

function secret() {
  return new TextEncoder().encode(process.env.JWT_SECRET || 'inventory-demo-secret')
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
