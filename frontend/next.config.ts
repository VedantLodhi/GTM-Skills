import type { NextConfig } from "next";

// Standalone demo project — proxies relative /api/* calls to the local
// FastAPI backend so the browser never needs CORS or a hardcoded backend
// origin. Mirrors the "frontend proxies /api/* to backend" pattern used by
// larger Next.js + FastAPI apps, reimplemented independently here.
const BACKEND_ORIGIN = process.env.BACKEND_ORIGIN || "http://127.0.0.1:8000";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${BACKEND_ORIGIN}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
