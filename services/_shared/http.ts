import { createServer, type IncomingMessage, type ServerResponse } from 'node:http'
import { FieldValidationError, NotFoundError, getRepo, type Repo } from '@inventory/db'

export function readBody(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (chunk) => chunks.push(Buffer.from(chunk)))
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
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'access-control-allow-origin': '*',
    'access-control-allow-headers': 'content-type, authorization',
  })
  res.end(JSON.stringify(body))
}

export async function withRepo(res: ServerResponse, run: (repo: Repo) => Promise<unknown>) {
  try {
    const result = await run(getRepo())
    if (!res.headersSent) send(res, 200, result)
  } catch (error) {
    if (error instanceof FieldValidationError) return send(res, 400, { error: 'validation', fields: error.fields })
    if (error instanceof NotFoundError) return send(res, 404, { error: 'not_found' })
    console.error(error)
    send(res, 500, { error: 'server' })
  }
}

export function listen(port: number, handler: (req: IncomingMessage, res: ServerResponse) => Promise<void> | void) {
  const server = createServer((req, res) => {
    if (req.method === 'OPTIONS') return send(res, 204, {})
    Promise.resolve(handler(req, res)).catch((error) => {
      console.error(error)
      if (!res.headersSent) send(res, 500, { error: 'server' })
    })
  })
  server.listen(port, () => console.log(`listening on ${port}`))
}
