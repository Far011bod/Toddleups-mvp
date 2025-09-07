/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove output: 'export' for Netlify deployment
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // Ensure proper handling of client components
  experimental: {
    esmExternals: 'loose'
  }
}

module.exports = nextConfig