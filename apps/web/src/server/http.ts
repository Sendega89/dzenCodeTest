import { FieldValidationError, NotFoundError } from '@inventory/db'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers: { 'cache-control': 'no-store' } })
}

export async function handle(run: () => Promise<unknown>) {
  try {
    return json(await run())
  } catch (error) {
    if (error instanceof FieldValidationError) return json({ error: 'validation', fields: error.fields }, 400)
    if (error instanceof NotFoundError) return json({ error: 'not_found' }, 404)
    console.error(error)
    return json({ error: 'server' }, 500)
  }
}
