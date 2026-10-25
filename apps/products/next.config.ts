import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: ['@inventory/ui', '@inventory/domain'],
  basePath: '/mfe',
}

export default nextConfig
