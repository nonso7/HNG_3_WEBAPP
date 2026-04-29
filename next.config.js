/** @type {import('next').NextConfig} */
const backend = process.env.BACKEND_URL || 'https://be-hng-1-production.up.railway.app';

const nextConfig = {
  async rewrites() {
    return [
      { source: '/api/:path*', destination: `${backend}/api/:path*` },
      { source: '/auth/:path*', destination: `${backend}/auth/:path*` },
    ];
  },
};

module.exports = nextConfig;
