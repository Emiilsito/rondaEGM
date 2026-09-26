import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow Cloudflare quick tunnels + localtunnel when previewing remotely.
  allowedDevOrigins: [
    "*.trycloudflare.com",
    "*.loca.lt",
    "localhost",
    "127.0.0.1",
  ],
};

export default nextConfig;
