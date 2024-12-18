/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@test-app/shared', '@tonconnect/ui-react'],
  output: 'standalone',
  webpack: (config) => {
    // Только необходимые fallbacks
    config.resolve.fallback = {
      ...config.resolve.fallback,
      net: false,
      fs: false,
      tls: false
    };

    // Сохраняем оригинальные правила
    const rules = config.module.rules;

    // Очищаем module
    config.module = {
      ...config.module,
      rules
    };

    return config;
  },
  // Отключаем некоторые оптимизации
  experimental: {
    optimizeCss: false,
    optimizePackageImports: []
  }
}

module.exports = nextConfig