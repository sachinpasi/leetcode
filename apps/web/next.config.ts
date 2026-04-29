import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@aura/db", "@aura/queue", "@aura/common"],
};

export default nextConfig;
