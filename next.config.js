/** @type {import('next').NextConfig} */
const backend = process.env.BACKEND_URL || 'https://be-hng-1.onrender.com';

const nextConfig = {
  async rewrites() {
    return [
      { source: '/api/:path*', destination: `${backend}/api/:path*` },
      { source: '/auth/:path*', destination: `${backend}/auth/:path*` },
    ];
  },
  async headers() {
    return [
      {
        // Prevent any cache layer (browser, bfcache, CDN) from serving a stale
        // /login. Otherwise an old build's "Continue with GitHub" link can
        // outlive a deploy and break OAuth in users' regular browsers.
        source: '/login',
        headers: [
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate, max-age=0' },
          { key: 'Pragma', value: 'no-cache' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
