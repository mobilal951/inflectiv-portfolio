import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  serverExternalPackages: ["firebase-admin", "pg", "pg-pool", "pg-protocol", "pg-types", "postgres"],
};

export default nextConfig;
