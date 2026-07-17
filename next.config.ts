import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  turbopack: {},
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        ignored: [
          "**/node_modules/**",
          "**/.next/**",
          "**/.git/**",
          "**/.codegraph/**",
          "**/scratch_*",
          "**/assets.json",
          "**/assets_clean.json",
          "**/assets_utf8.txt"
        ]
      };
    }
    return config;
  }
};

export default nextConfig;
