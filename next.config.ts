import { imageHosts } from "./app/lib/image-hosts";
import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  images: {
    remotePatterns: imageHosts.map(hostname => ({ protocol: "https" as const, hostname })),
    maximumRedirects: 0,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};
export default nextConfig;
