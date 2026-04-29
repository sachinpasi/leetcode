import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@aura/db", "@aura/queue", "@aura/common"],
  experimental: {
    turbopack: {
      root: "../../",
    },
  },
};

export default nextConfig;
