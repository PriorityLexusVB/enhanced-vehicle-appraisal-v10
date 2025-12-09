/** @type {import('next').NextConfig} */
const nextConfig = {
  // Build configuration
  // Note: Enable linting and type checking for better code quality
  eslint: {
    ignoreDuringBuilds: true, // TODO: Fix ESLint errors and remove this
  },
  typescript: {
    ignoreBuildErrors: true, // TODO: Fix TypeScript errors and remove this
  },
  
  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        pathname: '**',
      },
    ],
    // TODO: Remove unoptimized and use Next.js image optimization
    unoptimized: true,
  },
}

export default nextConfig
