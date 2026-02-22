import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prevent Next.js from trying to bundle native Node addons.
  // better-sqlite3 uses native bindings and must be required at runtime.
  serverExternalPackages: ["better-sqlite3"],
};

export default nextConfig;
