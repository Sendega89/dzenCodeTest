import { listen, readBody, send, withRepo } from '../../_shared/http.ts'

listen(Number(process.env.PORT || 4102), async (req, res) => {
  const url = new URL(req.url || '/', 'http://localhost')
  if (url.pathname === '/health') return send(res, 200, { ok: true, service: 'products' })
  if (req.method === 'GET' && url.pathname === '/products') {
    return withRepo(res, async (repo) => (await repo.snapshot()).products)
  }
  if (req.method === 'POST' && url.pathname === '/products') {
    const body = await readBody(req)
    return withRepo(res, (repo) => repo.createProduct(body))
  }
  const match = url.pathname.match(/^\/products\/(\d+)$/)
  if (req.method === 'DELETE' && match?.[1]) {
    return withRepo(res, (repo) => repo.deleteProduct(Number(match[1])))
  }
  send(res, 404, { error: 'not_found' })
})
