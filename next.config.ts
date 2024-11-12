import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ hostname: "img.clerk.com" }],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: 50000000, // 50MB
    },
  },
};

export default nextConfig;
