import { describe, expect, it } from 'vitest'
import { AppRoutes, parseId, resolveSlug, resolveUser, routes, slugify } from './routes'

describe('human-readable routes', () => {
  it('builds transliterated product and order paths', () => {
    expect(slugify('Мониторы')).toBe('monitory')
    expect(routes.order(12, 'usb')).toBe('/orders/12?q=usb')
    expect(routes.products({ type: 'Мониторы', spec: 'USB' })).toBe('/products/monitory?spec=USB')
    expect(resolveSlug('monitory', ['Мониторы', 'Наушники'])).toBe('Мониторы')
    expect(resolveSlug('missing', ['Мониторы'])).toBeNull()
    expect(parseId('12')).toBe(12)
    expect(parseId('0')).toBeNull()
    expect(parseId('ab')).toBeNull()
    expect(routes.product(12)).toBe('/products/12')
    expect(routes.user({ id: 1, login: 'demo' })).toBe('/users/demo')
    expect(resolveUser('demo', [{ id: 1, login: 'demo', name: 'Демо' }])?.id).toBe(1)
    expect(resolveUser('1', [{ id: 1, login: 'demo', name: 'Демо' }])?.login).toBe('demo')
  })

  it('uses an empty products root for the microfrontend base path', () => {
    const nested = new AppRoutes({ orders: '/orders', products: '' })
    expect(nested.products()).toBe('/')
    expect(nested.products({ type: 'Мониторы' })).toBe('/monitory')
    expect(nested.productNav({ spec: 'USB' }).type('Мониторы')).toBe('/monitory?spec=USB')
  })
})
