/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  poweredByHeader: false,
  env: {
    NODE_ENV: process.env.NODE_ENV,
  },
};

module.exports = nextConfig;
