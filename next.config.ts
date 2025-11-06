import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // Don't fail build on ESLint warnings/errors
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Don't fail build on TypeScript errors (optional, but helpful during development)
    ignoreBuildErrors: false, // Keep this false to catch actual TypeScript errors
  },
};

export default nextConfig;
