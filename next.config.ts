import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ hostname: "img.clerk.com" }],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: 10000000, // 10MB
    },
  },
};

export default nextConfig;
