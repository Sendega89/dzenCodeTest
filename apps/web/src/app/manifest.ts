import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Inventory',
    short_name: 'Inventory',
    start_url: '/orders',
    display: 'standalone',
    background_color: '#e7f0f0',
    theme_color: '#8bc346',
    lang: 'ru',
    icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' }],
  }
}
