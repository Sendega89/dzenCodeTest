import { createInventoryYoga, FieldValidationError, NotFoundError, getRepo } from '@inventory/db'
import type { Snapshot } from '@inventory/domain'
import { listen, readBody, send, withRepo } from '../../_shared/http.ts'

const port = Number(process.env.PORT || 4000)
const ordersUrl = process.env.ORDERS_URL || 'http://orders:4101'
const productsUrl = process.env.PRODUCTS_URL || 'http://products:4102'
const authUrl = process.env.AUTH_URL || 'http://auth:4103'

async function callService(url: string, method: string, body?: unknown): Promise<{ status: number; payload: unknown }> {
  try {
    const response = await fetch(url, {
      method,
      headers: { 'content-type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
    const payload = await response.json().catch(() => ({ error: 'upstream' }))
    return { status: response.status, payload }
  } catch (error) {
    console.error(error)
    return { status: 502, payload: { error: 'upstream' } }
  }
}

function reply(res: Parameters<typeof send>[0], result: { status: number; payload: unknown }) {
  send(res, result.status, result.payload)
}

async function snapshotFromServices(): Promise<Snapshot> {
  let last = 'upstream snapshot failed'
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const [ordersResult, productsResult, local] = await Promise.all([
      callService(`${ordersUrl}/orders`, 'GET'),
      callService(`${productsUrl}/products`, 'GET'),
      getRepo().snapshot(),
    ])
    if (ordersResult.status === 200 && productsResult.status === 200) {
      return {
        ...local,
        orders: ordersResult.payload as Snapshot['orders'],
        products: productsResult.payload as Snapshot['products'],
      }
    }
    last = `orders ${ordersResult.status}, products ${productsResult.status}`
    await new Promise((resolve) => setTimeout(resolve, 500))
  }
  throw new Error(last)
}

const yoga = createInventoryYoga(getRepo(), {
  snapshot: snapshotFromServices,
  createOrder: async (input) => {
    const result = await callService(`${ordersUrl}/orders`, 'POST', input)
    if (result.status === 400) throw new FieldValidationError((result.payload as { fields?: { field: string; message: string }[] }).fields ?? [])
    if (result.status === 404) throw new NotFoundError()
    if (result.status !== 200) throw new Error('upstream')
    return result.payload as Snapshot
  },
  deleteOrder: async (id) => {
    const result = await callService(`${ordersUrl}/orders/${id}`, 'DELETE')
    if (result.status === 404) throw new NotFoundError()
    if (result.status !== 200) throw new Error('upstream')
    return result.payload as Snapshot
  },
  deleteProduct: async (id) => {
    const result = await callService(`${productsUrl}/products/${id}`, 'DELETE')
    if (result.status === 404) throw new NotFoundError()
    if (result.status !== 200) throw new Error('upstream')
    return result.payload as Snapshot
  },
})

function clientId(value: unknown): string | null {
  return typeof value === 'string' && /^[\w-]{8,64}$/.test(value) ? value : null
}

listen(port, async (req, res) => {
  const url = new URL(req.url || '/', 'http://localhost')
  if (url.pathname === '/health') return send(res, 200, { ok: true, service: 'gateway' })

  if (url.pathname === '/api/graphql') {
    const body = req.method === 'GET' ? undefined : await readBody(req)
    const headers = new Headers()
    for (const [key, value] of Object.entries(req.headers)) {
      if (typeof value === 'string') headers.set(key, value)
    }
    const response = await yoga.fetch(
      new Request(`http://localhost${url.pathname}${url.search}`, {
        method: req.method,
        headers,
        body: body == null ? undefined : JSON.stringify(body),
      }),
    )
    const text = await response.text()
    res.writeHead(response.status, { 'content-type': response.headers.get('content-type') || 'application/json' })
    res.end(text)
    return
  }

  if (req.method === 'GET' && url.pathname === '/api/snapshot') {
    try {
      return send(res, 200, await snapshotFromServices())
    } catch (error) {
      console.error(error)
      return send(res, 502, { error: 'upstream' })
    }
  }

  if (req.method === 'POST' && url.pathname === '/api/auth/login') {
    return reply(res, await callService(`${authUrl}/login`, 'POST', await readBody(req)))
  }

  if (req.method === 'POST' && url.pathname === '/api/orders') {
    return reply(res, await callService(`${ordersUrl}/orders`, 'POST', await readBody(req)))
  }

  const orderMatch = url.pathname.match(/^\/api\/orders\/(\d+)$/)
  if (req.method === 'DELETE' && orderMatch?.[1]) {
    return reply(res, await callService(`${ordersUrl}/orders/${orderMatch[1]}`, 'DELETE'))
  }

  if (req.method === 'POST' && url.pathname === '/api/products') {
    return reply(res, await callService(`${productsUrl}/products`, 'POST', await readBody(req)))
  }

  const productMatch = url.pathname.match(/^\/api\/products\/(\d+)$/)
  if (req.method === 'DELETE' && productMatch?.[1]) {
    return reply(res, await callService(`${productsUrl}/products/${productMatch[1]}`, 'DELETE'))
  }

  if (req.method === 'POST' && url.pathname === '/api/presence') {
    const body = (await readBody(req)) as { clientId?: unknown }
    const id = clientId(body?.clientId)
    if (!id) return send(res, 400, { error: 'validation' })
    return withRepo(res, async (repo) => ({ count: (await repo.touchPresence(id)).presenceCount }))
  }

  if (req.method === 'POST' && url.pathname === '/api/presence/leave') {
    const body = (await readBody(req)) as { clientId?: unknown }
    const id = clientId(body?.clientId)
    if (!id) return send(res, 400, { error: 'validation' })
    return withRepo(res, async (repo) => ({ count: (await repo.leavePresence(id)).presenceCount }))
  }

  send(res, 404, { error: 'not_found' })
})
