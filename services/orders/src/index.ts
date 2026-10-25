import { handleCrud, listenService } from '../../_shared/http.ts'

listenService(Number(process.env.PORT || 4101), 'orders', (req, res, url) =>
  handleCrud(req, res, url, 'orders', {
    list: async (repo) => (await repo.snapshot()).orders,
    create: (repo, body) => repo.createOrder(body),
    remove: (repo, id) => repo.deleteOrder(id),
  }),
)
