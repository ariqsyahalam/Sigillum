import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prevent Next.js from trying to bundle native Node addons or WASM modules.
  // better-sqlite3 and blake3 use native bindings/WASM and must be required at runtime.
  serverExternalPackages: ["better-sqlite3", "blake3"],
};

export default nextConfig;
