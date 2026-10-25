import { scrypt, randomBytes, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'

const scryptAsync = promisify(scrypt)
const PARAMS = { N: 16384, r: 8, p: 1, len: 32 }

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex')
  const derived = (await scryptAsync(password, salt, PARAMS.len)) as Buffer
  return `scrypt$${PARAMS.N}$${PARAMS.r}$${PARAMS.p}$${salt}$${derived.toString('hex')}`
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split('$')
  if (parts.length !== 6 || parts[0] !== 'scrypt') return false
  const salt = parts[4]
  const expectedHex = parts[5]
  if (!salt || !expectedHex) return false
  const expected = Buffer.from(expectedHex, 'hex')
  const derived = (await scryptAsync(password, salt, expected.length)) as Buffer
  if (derived.length !== expected.length) return false
  return timingSafeEqual(derived, expected)
}
