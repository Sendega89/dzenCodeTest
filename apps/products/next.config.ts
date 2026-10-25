import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: ['@inventory/ui', '@inventory/domain', '@inventory/auth'],
  basePath: '/products',
}

export default nextConfig
