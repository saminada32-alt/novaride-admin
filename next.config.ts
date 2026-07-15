import type { NextConfig } from "next";
import path from "path";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'https://api.novaride.app';
const isDev = process.env.NODE_ENV !== 'production';

/** In dev, allow browser calls to the local Nest API (http://localhost:3000). */
const connectSrc = isDev
  ? "connect-src 'self' https: wss: http://localhost:* http://127.0.0.1:*;"
  : "connect-src 'self' https: wss:;";

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
            value: `default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; ${connectSrc} frame-ancestors 'none';`,
          },
        ],
      },
    ];
  },
};

export default nextConfig;
