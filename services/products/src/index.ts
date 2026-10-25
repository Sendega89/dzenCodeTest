import { handleCrud, listenService, withRepo } from '../../_shared/http.ts'

listenService(Number(process.env.PORT || 4102), 'products', async (req, res, url) => {
  if (req.method === 'GET' && url.pathname === '/groups') {
    await withRepo(res, async (repo) => (await repo.snapshot()).groups)
    return true
  }
  return handleCrud(req, res, url, 'products', {
    list: async (repo) => (await repo.snapshot()).products,
    create: (repo, body) => repo.createProduct(body),
    remove: (repo, id) => repo.deleteProduct(id),
  })
})
