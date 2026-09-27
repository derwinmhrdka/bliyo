import type { NextConfig } from 'next';
import path from 'path';

const apiInternal = process.env.API_INTERNAL_URL || 'http://127.0.0.1:13004';

const nextConfig: NextConfig = {
  output: 'standalone',
  outputFileTracingRoot: path.join(__dirname, '../..'),
  poweredByHeader: false,
  eslint: { ignoreDuringBuilds: true },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${apiInternal}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
