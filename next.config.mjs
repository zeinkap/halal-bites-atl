/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  },
  images: {
    remotePatterns: [
      // Known optimised sources
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'maps.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      // AWS S3 (any bucket / region)
      {
        protocol: 'https',
        hostname: '*.amazonaws.com',
      },
      // Community-submitted restaurant images can come from any host
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'Set-Cookie',
            value: '__Host-next-auth.csrf-token=*; Path=/; Secure; HttpOnly; SameSite=Lax'
          },
          {
            key: 'Set-Cookie',
            value: '__Secure-next-auth.callback-url=*; Path=/; Secure; HttpOnly; SameSite=Lax'
          },
          {
            key: 'Set-Cookie',
            value: '__Secure-next-auth.session-token=*; Path=/; Secure; HttpOnly; SameSite=Lax'
          }
        ]
      }
    ];
  }
};

export default nextConfig; 