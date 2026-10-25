import { json } from '@/server/http'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export function GET() {
  const driver = process.env.DATABASE_URL?.startsWith('mysql')
    ? 'mysql'
    : process.env.BLOB_READ_WRITE_TOKEN
      ? 'blob'
      : process.env.VERCEL
        ? 'tmp'
        : 'file'
  return json({ ok: true, driver })
}
