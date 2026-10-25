import { signToken, TOKEN_COOKIE } from '@inventory/auth'
import { createInventoryYoga, getRepo } from '@inventory/db'
import { loginSchema } from '@inventory/domain'
import { handle, json } from '@/server/http'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

type Context = { params: Promise<{ path?: string[] }> }

const yoga = createInventoryYoga(getRepo())

function gatewayBase(): string {
  return process.env.GATEWAY_URL?.replace(/\/$/, '') || ''
}

async function proxy(request: Request, suffix: string): Promise<Response | null> {
  const base = gatewayBase()
  if (!base) return null
  const hasBody = request.method !== 'GET' && request.method !== 'DELETE'
  const response = await fetch(`${base}/api/${suffix}`, {
    method: request.method,
    headers: { 'content-type': request.headers.get('content-type') || 'application/json' },
    body: hasBody ? await request.text() : undefined,
    cache: 'no-store',
  })
  return new Response(await response.arrayBuffer(), {
    status: response.status,
    headers: {
      'content-type': response.headers.get('content-type') || 'application/json',
      'cache-control': 'no-store',
    },
  })
}

function clientId(value: unknown): string | null {
  return typeof value === 'string' && /^[\w-]{8,64}$/.test(value) ? value : null
}

async function segments(context: Context): Promise<string[]> {
  const { path } = await context.params
  return path ?? []
}

export async function GET(request: Request, context: Context) {
  const path = await segments(context)
  if (gatewayBase() && path[0] === 'health' && path.length === 1) {
    const response = await fetch(`${gatewayBase()}/health`, { cache: 'no-store' })
    return new Response(await response.text(), {
      status: response.status,
      headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
    })
  }
  if (gatewayBase() && path[0] === 'graphql') {
    return (await proxy(request, path.join('/'))) as Response
  }
  if (path.length === 1 && path[0] === 'health') {
    const driver = process.env.DATABASE_URL?.startsWith('mysql')
      ? 'mysql'
      : process.env.BLOB_READ_WRITE_TOKEN
        ? 'blob'
        : process.env.VERCEL
          ? 'tmp'
          : 'file'
    return json({ ok: true, driver })
  }
  if (path[0] === 'graphql') return yoga.fetch(request)
  return json({ error: 'not_found' }, 404)
}

export async function POST(request: Request, context: Context) {
  const path = await segments(context)
  if (gatewayBase() && path[0] === 'auth' && path[1] === 'login') {
    const proxied = await proxy(request, 'auth/login')
    const payload = await proxied?.json()
    if (!proxied?.ok) return json(payload, proxied?.status || 502)
    const response = json(payload)
    if (payload?.token) {
      response.cookies.set(TOKEN_COOKIE, payload.token, {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      })
    }
    return response
  }
  if (gatewayBase() && path[0] !== 'locale' && !(path[0] === 'auth' && path[1] === 'logout')) {
    return (await proxy(request, path.join('/'))) as Response
  }
  if (path[0] === 'graphql') return yoga.fetch(request)

  if (path[0] === 'auth' && path[1] === 'login' && path.length === 2) {
    const body = await request.json().catch(() => null)
    const parsed = loginSchema.safeParse(body)
    if (!parsed.success) return json({ error: 'validation' }, 400)
    const user = await getRepo().authenticate(parsed.data.login, parsed.data.password)
    if (!user) return json({ error: 'unauthorized' }, 401)
    const token = await signToken(user)
    const response = json({ token, user })
    response.cookies.set(TOKEN_COOKIE, token, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    })
    return response
  }

  if (path[0] === 'auth' && path[1] === 'logout' && path.length === 2) {
    const response = json({ ok: true })
    response.cookies.set(TOKEN_COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 })
    return response
  }

  if (path[0] === 'locale' && path.length === 1) {
    const body = await request.json().catch(() => null)
    const locale = body?.locale === 'en' ? 'en' : 'ru'
    const response = json({ locale })
    response.cookies.set('locale', locale, { path: '/', maxAge: 60 * 60 * 24 * 365, sameSite: 'lax' })
    return response
  }

  if (path[0] === 'orders' && path.length === 1) {
    const body = await request.json().catch(() => null)
    return handle(() => getRepo().createOrder(body))
  }

  if (path[0] === 'products' && path.length === 1) {
    const body = await request.json().catch(() => null)
    return handle(() => getRepo().createProduct(body))
  }

  if (path[0] === 'presence' && path.length === 1) {
    const body = await request.json().catch(() => null)
    const id = clientId(body?.clientId)
    if (!id) return json({ error: 'validation' }, 400)
    const snapshot = await getRepo().touchPresence(id)
    return json({ count: snapshot.presenceCount })
  }

  if (path[0] === 'presence' && path[1] === 'leave' && path.length === 2) {
    const body = await request.json().catch(() => null)
    const id = clientId(body?.clientId)
    if (!id) return json({ error: 'validation' }, 400)
    const snapshot = await getRepo().leavePresence(id)
    return json({ count: snapshot.presenceCount })
  }

  return json({ error: 'not_found' }, 404)
}

export async function DELETE(request: Request, context: Context) {
  const path = await segments(context)
  if (gatewayBase()) return (await proxy(request, path.join('/'))) as Response
  if (path[0] === 'orders' && path[1] && path.length === 2) {
    return handle(() => getRepo().deleteOrder(Number(path[1])))
  }
  if (path[0] === 'products' && path[1] && path.length === 2) {
    return handle(() => getRepo().deleteProduct(Number(path[1])))
  }
  return json({ error: 'not_found' }, 404)
}
