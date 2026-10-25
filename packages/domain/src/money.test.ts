import { describe, expect, it } from 'vitest'
import { formatMoney, roundMoney, sumByCurrency, toCents } from './money'
import type { Product } from './types'

const sample = [
  {
    price: [
      { value: 100, symbol: 'USD', isDefault: false },
      { value: 10.1, symbol: 'UAH', isDefault: true },
    ],
  },
  {
    price: [
      { value: 50.25, symbol: 'USD', isDefault: false },
      { value: 0.2, symbol: 'UAH', isDefault: true },
    ],
  },
] as Product[]

describe('money', () => {
  it('sums each currency without a made-up rate', () => {
    expect(sumByCurrency(sample, 'USD')).toBe(150.25)
    expect(sumByCurrency(sample, 'UAH')).toBe(10.3)
  })

  it('formats USD and UAH the same way everywhere', () => {
    expect(formatMoney(2500, 'USD')).toBe('2 500 $')
    expect(formatMoney(250000.5, 'UAH')).toBe('250 000,50 uah')
  })

  it('rounds to cents', () => {
    expect(roundMoney(10.126)).toBe(10.13)
    expect(toCents(10.3)).toBe(1030)
  })
})
