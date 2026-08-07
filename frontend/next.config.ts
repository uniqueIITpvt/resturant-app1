import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: [
      'res.cloudinary.com',
      'images.unsplash.com',
      'example.com',
      'i.vimeocdn.com',
    ],
  },
  // Disable type checking during build
  typescript: {
    ignoreBuildErrors: true,
  },
  // Disable ESLint during build
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Add security headers
  async headers() {
    return [
      {
        // Apply these headers to all routes
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value:
              'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
          // {
          //   key: 'Content-Security-Policy',
          //   value:
          //     "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://*.cloudinary.com https://images.unsplash.com https://example.com https://i.vimeocdn.com; font-src 'self'; connect-src 'self' https://resturant-bussiness-api.vercel.app https://resturant-app-backend-red.vercel.app http://localhost:5000;",
          // },
        ],
      },
    ];
  },
};

export default nextConfig;
