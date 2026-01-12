import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/npm/@clerk/clerk-js@:version/:path*',
        destination: 'https://cdn.jsdelivr.net/npm/@clerk/clerk-js@:version/:path*',
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/gigfinder',
        permanent: true,
      },
    ];
  },
  async headers() {
    const isDev = process.env.NODE_ENV === 'development';

    // Base headers for all environments
    const baseHeaders = [
      {
        key: 'X-DNS-Prefetch-Control',
        value: 'on'
      },
      {
        key: 'X-Frame-Options',
        value: 'DENY'
      },
      {
        key: 'X-Content-Type-Options',
        value: 'nosniff'
      },
      {
        key: 'X-XSS-Protection',
        value: '1; mode=block'
      },
      {
        key: 'Referrer-Policy',
        value: 'strict-origin-when-cross-origin'
      },
      {
        key: 'Permissions-Policy',
        value: 'camera=(), microphone=(), geolocation=()'
      }
    ];

    // Production-only security headers
    const productionHeaders = isDev ? [] : [
      {
        key: 'Strict-Transport-Security',
        value: 'max-age=63072000; includeSubDomains; preload'
      }
    ];

    // CSP directives
    const cspDirectives = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://challenges.cloudflare.com https://*.clerk.accounts.dev https://clerk.gig-finder.co.uk https://vercel.live",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: https: blob:",
      "font-src 'self' https://fonts.gstatic.com",
      "connect-src 'self' https://api.stripe.com https://checkout.stripe.com https://*.clerk.accounts.dev https://clerk.gig-finder.co.uk https://vercel.live",
      "frame-src 'self' https://js.stripe.com https://challenges.cloudflare.com",
      "worker-src 'self' blob:",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'"
    ];

    // Only add upgrade-insecure-requests in production
    if (!isDev) {
      cspDirectives.push("upgrade-insecure-requests");
    }

    return [
      {
        source: '/:path*',
        headers: [
          ...baseHeaders,
          ...productionHeaders,
          {
            key: 'Content-Security-Policy',
            value: cspDirectives.join('; ')
          }
        ],
      },
    ];
  },
  // API route body size limits
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb', // Limit request body size to 2MB
    },
  },
};

export default nextConfig;
