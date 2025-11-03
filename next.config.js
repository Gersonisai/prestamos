/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    // Agrega soporte para importar archivos .ts en archivos .js/.jsx
    config.resolve.extensions.push('.ts', '.tsx');
    return config;
  },
}

module.exports = nextConfig
