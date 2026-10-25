import { createServer, type IncomingMessage, type ServerResponse } from 'node:http'
import { FieldValidationError, NotFoundError, getRepo, type Repo } from '@inventory/db'

const MAX_BODY = 512 * 1024

function allowedOrigins(): string[] {
  return (process.env.CORS_ORIGIN || 'http://localhost:8080,http://localhost:3000,http://localhost:3002')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

function corsHeaders(req?: IncomingMessage): Record<string, string> {
  const origin = typeof req?.headers.origin === 'string' ? req.headers.origin : ''
  const headers: Record<string, string> = {
    'content-type': 'application/json; charset=utf-8',
    'access-control-allow-headers': 'content-type, authorization',
    'access-control-allow-methods': 'GET,POST,DELETE,OPTIONS',
    'x-content-type-options': 'nosniff',
  }
  if (origin && allowedOrigins().includes(origin)) {
    headers['access-control-allow-origin'] = origin
    headers['access-control-allow-credentials'] = 'true'
    headers.vary = 'Origin'
  }
  return headers
}

export class PayloadTooLargeError extends Error {
  constructor() {
    super('payload_too_large')
    this.name = 'PayloadTooLargeError'
  }
}

export function readBody(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    let size = 0
    req.on('data', (chunk) => {
      const buffer = Buffer.from(chunk)
      size += buffer.length
      if (size > MAX_BODY) {
        req.destroy()
        reject(new PayloadTooLargeError())
        return
      }
      chunks.push(buffer)
    })
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8')
      if (!raw) return resolve(null)
      try {
        resolve(JSON.parse(raw))
      } catch (error) {
        reject(error)
      }
    })
    req.on('error', reject)
  })
}

export function send(res: ServerResponse, status: number, body: unknown) {
  res.writeHead(status, corsHeaders(res.req))
  res.end(JSON.stringify(body))
}

export async function withRepo(res: ServerResponse, run: (repo: Repo) => Promise<unknown>) {
  try {
    const result = await run(getRepo())
    if (!res.headersSent) send(res, 200, result)
  } catch (error) {
    if (error instanceof FieldValidationError) return send(res, 400, { error: 'validation', fields: error.fields })
    if (error instanceof NotFoundError) return send(res, 404, { error: 'not_found' })
    if (error instanceof PayloadTooLargeError) return send(res, 413, { error: 'payload_too_large' })
    console.error(error)
    send(res, 500, { error: 'server' })
  }
}

export async function handleCrud(
  req: IncomingMessage,
  res: ServerResponse,
  url: URL,
  collection: string,
  ops: {
    list: (repo: Repo) => Promise<unknown>
    create: (repo: Repo, body: unknown) => Promise<unknown>
    remove: (repo: Repo, id: number) => Promise<unknown>
  },
): Promise<boolean> {
  if (req.method === 'GET' && url.pathname === `/${collection}`) {
    await withRepo(res, ops.list)
    return true
  }
  if (req.method === 'POST' && url.pathname === `/${collection}`) {
    const body = await readBody(req)
    await withRepo(res, (repo) => ops.create(repo, body))
    return true
  }
  const match = url.pathname.match(new RegExp(`^/${collection}/(\\d+)$`))
  if (req.method === 'DELETE' && match?.[1]) {
    await withRepo(res, (repo) => ops.remove(repo, Number(match[1])))
    return true
  }
  return false
}

export function listenService(
  port: number,
  service: string,
  route: (req: IncomingMessage, res: ServerResponse, url: URL) => Promise<boolean>,
) {
  listen(port, async (req, res) => {
    const url = new URL(req.url || '/', 'http://localhost')
    if (url.pathname === '/health') return send(res, 200, { ok: true, service })
    if (await route(req, res, url)) return
    send(res, 404, { error: 'not_found' })
  })
}

export function listen(port: number, handler: (req: IncomingMessage, res: ServerResponse) => Promise<void> | void) {
  const server = createServer((req, res) => {
    if (req.method === 'OPTIONS') return send(res, 204, {})
    Promise.resolve(handler(req, res)).catch((error) => {
      console.error(error)
      if (res.headersSent) return
      if (error instanceof PayloadTooLargeError) return send(res, 413, { error: 'payload_too_large' })
      send(res, 500, { error: 'server' })
    })
  })
  server.listen(port, () => console.log(`listening on ${port}`))
}
