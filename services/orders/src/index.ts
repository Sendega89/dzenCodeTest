import { listen, readBody, send, withRepo } from '../../_shared/http.ts'

listen(Number(process.env.PORT || 4101), async (req, res) => {
  const url = new URL(req.url || '/', 'http://localhost')
  if (url.pathname === '/health') return send(res, 200, { ok: true, service: 'orders' })
  if (req.method === 'GET' && url.pathname === '/orders') {
    return withRepo(res, async (repo) => (await repo.snapshot()).orders)
  }
  if (req.method === 'POST' && url.pathname === '/orders') {
    const body = await readBody(req)
    return withRepo(res, (repo) => repo.createOrder(body))
  }
  const match = url.pathname.match(/^\/orders\/(\d+)$/)
  if (req.method === 'DELETE' && match?.[1]) {
    return withRepo(res, (repo) => repo.deleteOrder(Number(match[1])))
  }
  send(res, 404, { error: 'not_found' })
})
