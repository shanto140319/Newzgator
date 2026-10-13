import createNextIntlPlugin from "next-intl/plugin";
import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  images: {
    // Publishers serve images from many hosts, so any HTTPS host is allowed.
    remotePatterns: [{ protocol: "https", hostname: "**" }],
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
export default createNextIntlPlugin()(nextConfig);
