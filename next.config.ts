import type { NextConfig } from "next";
import path from "path";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'https://api.novaride.app';

const nextConfig: NextConfig = {
  output: 'standalone',

  turbopack: {
    root: path.resolve(__dirname),
  },

  images: {
    remotePatterns: [{
      protocol: "https",
      hostname: new URL(apiUrl).hostname,
      pathname: `/uploads/**`,
    }],
  },

  reactCompiler: true,

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https: wss:; frame-ancestors 'none';",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
