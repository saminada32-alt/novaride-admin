import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Fix: Turbopack was scanning ~/ (home) due to stray package-lock.json there
  turbopack: {
    root: path.resolve(__dirname),
  },

  images: {
    remotePatterns: [{
      protocol: "http",
      hostname: "localhost",
      port: "3000",
      pathname: `/uploads/**`,
    }],
  },

  reactCompiler: true,
};

export default nextConfig;
