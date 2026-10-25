import type { Currency, Product } from './types'

const NBSP = /[\u00a0\u202f]/g

export function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

export function sumByCurrency(products: Product[], symbol: Currency): number {
  const total = products.reduce((acc, product) => {
    const price = product.price.find((item) => item.symbol === symbol)
    return acc + (price ? price.value : 0)
  }, 0)
  return roundMoney(total)
}

export function formatMoney(value: number, symbol: Currency): string {
  const rounded = roundMoney(value)
  const hasCents = symbol === 'UAH' || !Number.isInteger(rounded)
  const formatted = new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: 2,
  })
    .format(rounded)
    .replace(NBSP, ' ')
  return symbol === 'USD' ? `${formatted} $` : `${formatted} uah`
}

export function toCents(value: number): number {
  return Math.round(roundMoney(value) * 100)
}
