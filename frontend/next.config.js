/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'localhost:3001', 'localhost:5000'],
    },
  },
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    domains: ['localhost', 'localhost:5000', 'localhost:3000', 'localhost:3001']
  },
  env: {
    NEXT_PUBLIC_API_URL: 'http://localhost:5000/api',
  }
}

module.exports = nextConfig 