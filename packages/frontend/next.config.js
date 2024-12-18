/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@test-app/shared', '@tonconnect/ui-react'],
  output: 'standalone',
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NODE_ENV === 'production' 
      ? 'https://test.timecommunity.xyz' 
      : 'http://localhost:3000'
  },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      net: false,
      fs: false,
      tls: false
    };
    return config;
  }
}

module.exports = nextConfig