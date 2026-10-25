import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { createJsonRepo, createMemoryRepo } from './json-repo'

const dirs: string[] = []

afterEach(async () => {
  await Promise.all(dirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })))
})

describe('inventory repository', () => {
  it('seeds, totals, deletes and keeps the result after a new reader', async () => {
    const dir = await mkdtemp(path.join(tmpdir(), 'inventory-'))
    dirs.push(dir)
    const file = path.join(dir, 'inventory.json')
    const repo = createJsonRepo(file)
    const initial = await repo.snapshot()
    expect(initial.orders.length).toBeGreaterThan(0)
    expect(initial.users.every((user) => !('passwordHash' in user))).toBe(true)

    const order = initial.orders[0]
    expect(order).toBeDefined()
    if (!order) return
    const own = initial.products.filter((product) => product.orderId === order.id)
    expect(order.productCount).toBe(own.length)

    const created = await repo.createOrder({ title: 'Новый приход', createdAt: '2026-10-25', description: '' })
    const added = created.orders.find((item) => item.title === 'Новый приход')
    expect(added?.productCount).toBe(0)

    const withProduct = await repo.createProduct({
      title: 'Тестовый монитор',
      type: 'Мониторы',
      specification: 'USB',
      serialNumber: 'SN-TEST',
      status: 'free',
      isNew: true,
      guaranteeStart: '2020-01-01',
      guaranteeEnd: '2024-01-01',
      priceUsd: '10',
      priceUah: '100,5',
      orderId: added?.id,
      groupId: '',
      userId: '',
    })
    const again = withProduct.orders.find((item) => item.id === added?.id)
    expect(again?.productCount).toBe(1)
    expect(again?.totalUsd).toBe(10)
    expect(again?.totalUah).toBe(100.5)

    await repo.deleteOrder(added?.id ?? 0)
    const reread = await createJsonRepo(file).snapshot()
    expect(reread.orders.some((item) => item.title === 'Новый приход')).toBe(false)
    expect(reread.products.some((item) => item.serialNumber === 'SN-TEST')).toBe(false)
  })

  it('counts two tabs and drops a closed one', async () => {
    const repo = createMemoryRepo()
    const now = Date.now()
    const first = await repo.touchPresence('tab-a', now)
    const second = await repo.touchPresence('tab-b', now + 10)
    expect(first.presenceCount).toBe(1)
    expect(second.presenceCount).toBe(2)
    const left = await repo.leavePresence('tab-a')
    expect(left.presenceCount).toBe(1)
    expect((await repo.snapshot(now + 20_000)).presenceCount).toBe(0)
  })

  it('logs in only with the demo password', async () => {
    const repo = createMemoryRepo()
    expect(await repo.authenticate('demo', 'demo')).toMatchObject({ login: 'demo' })
    expect(await repo.authenticate('demo', 'wrong')).toBeNull()
    expect(await repo.authenticate('missing', 'demo')).toBeNull()
  })
})
