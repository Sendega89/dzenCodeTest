import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: ['@inventory/domain', '@inventory/db', '@inventory/auth', '@inventory/ui', '@inventory/events'],
  poweredByHeader: false,
  experimental: {
    cpus: 1,
  },
}

export default nextConfig
