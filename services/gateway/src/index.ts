import { createInventoryYoga, getRepo } from '@inventory/db'
import { listen, readBody, send, withRepo } from '../../_shared/http.ts'

const yoga = createInventoryYoga(getRepo())
const port = Number(process.env.PORT || 4000)

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
  if (url.pathname === '/api/snapshot') return withRepo(res, (repo) => repo.snapshot())
  send(res, 404, { error: 'not_found' })
})
