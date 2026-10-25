import { describe, expect, it } from 'vitest'
import { productSchema } from './validation'

describe('validation', () => {
  it('rejects a guarantee that ends before it starts', () => {
    const parsed = productSchema.safeParse({
      title: 'Монитор',
      type: 'Мониторы',
      specification: 'USB',
      serialNumber: 'SN-1',
      status: 'free',
      isNew: true,
      guaranteeStart: '2020-01-02',
      guaranteeEnd: '2020-01-01',
      priceUsd: '10',
      priceUah: '100,5',
      orderId: 1,
      groupId: '',
      userId: '',
    })
    expect(parsed.success).toBe(false)
    if (!parsed.success) {
      expect(parsed.error.issues.some((issue) => issue.message === 'guarantee.order')).toBe(true)
    }
  })

  it('accepts a comma price and empty relations', () => {
    const parsed = productSchema.safeParse({
      title: 'Монитор',
      type: 'Мониторы',
      specification: 'USB',
      serialNumber: 'SN-12',
      status: 'repair',
      isNew: false,
      guaranteeStart: '2017-04-06',
      guaranteeEnd: '2025-08-06',
      priceUsd: '2 500',
      priceUah: '250 000,50',
      orderId: '2',
      groupId: '',
      userId: '',
    })
    expect(parsed.success).toBe(true)
    if (parsed.success) {
      expect(parsed.data.priceUsd).toBe(2500)
      expect(parsed.data.priceUah).toBe(250000.5)
      expect(parsed.data.groupId).toBeNull()
    }
  })
})
