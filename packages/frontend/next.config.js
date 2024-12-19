const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@test-app/shared', '@tonconnect/ui-react'],
  output: 'standalone',
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NODE_ENV === 'production' 
      ? 'https://test.timecommunity.xyz' 
      : 'https://dev.timecommunity.xyz:4000'
  },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      net: false,
      fs: false,
      tls: false
    };
    return config;
  },
  async rewrites() {
    return [
      {
        source: '/tonconnect-manifest.json',
        destination: process.env.NODE_ENV === 'production'
          ? '/tonconnect-manifest.prod.json'
          : '/tonconnect-manifest.dev.json'
      }
    ]
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: '*' },
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
        ]
      }
    ]
  }
}

module.exports = nextConfig