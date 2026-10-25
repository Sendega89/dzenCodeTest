import { signToken } from '@inventory/auth'
import { loginSchema } from '@inventory/domain'
import { listen, readBody, send, withRepo } from '../../_shared/http.ts'

listen(Number(process.env.PORT || 4103), async (req, res) => {
  const url = new URL(req.url || '/', 'http://localhost')
  if (url.pathname === '/health') return send(res, 200, { ok: true, service: 'auth' })
  if (req.method === 'POST' && url.pathname === '/login') {
    const body = await readBody(req)
    const parsed = loginSchema.safeParse(body)
    if (!parsed.success) return send(res, 400, { error: 'validation' })
    return withRepo(res, async (repo) => {
      const user = await repo.authenticate(parsed.data.login, parsed.data.password)
      if (!user) {
        send(res, 401, { error: 'unauthorized' })
        return null
      }
      return { token: await signToken(user), user }
    })
  }
  send(res, 404, { error: 'not_found' })
})
