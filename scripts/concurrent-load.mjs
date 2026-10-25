#!/usr/bin/env node
/**
 * Concurrent-write contour against a live gateway.
 * This is not a 100k-user day simulation; it proves the write queue holds under parallel traffic.
 *
 *   GATEWAY_URL=http://localhost:4000 node scripts/concurrent-load.mjs
 */

const base = (process.env.GATEWAY_URL || 'http://localhost:4000').replace(/\/$/, '')
const workers = Number(process.env.LOAD_WORKERS || 40)

async function post(path, body) {
  const response = await fetch(`${base}${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!response.ok) throw new Error(`${path} ${response.status}`)
  return response.json()
}

const started = Date.now()
const orders = await Promise.all(
  Array.from({ length: workers }, (_, index) =>
    post('/api/orders', { title: `Load ${index}`, createdAt: '2026-10-25', description: '' }),
  ),
)
const presence = await Promise.all(
  Array.from({ length: workers }, (_, index) =>
    post('/api/presence', { clientId: `load-${index.toString().padStart(4, '0')}` }),
  ),
)
const elapsed = Date.now() - started
const last = orders.at(-1)
console.log(
  JSON.stringify(
    {
      workers,
      ms: elapsed,
      orders: last?.orders?.length ?? null,
      presence: presence.at(-1)?.count ?? null,
    },
    null,
    2,
  ),
)
