import createNextIntlPlugin from "next-intl/plugin";
import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  images: {
    // Publisher images load directly; the hosting plan's optimizer quota is too small for a news feed.
    unoptimized: true,
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
export default createNextIntlPlugin()(nextConfig);
