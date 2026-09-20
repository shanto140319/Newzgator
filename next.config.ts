import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  images: { remotePatterns: [
    { protocol: "https", hostname: "samakal.com" },
    { protocol: "https", hostname: "www.bd-pratidin.com" },
    { protocol: "https", hostname: "cdn.bd-pratidin.com" },
    { protocol: "https", hostname: "cdn.risingbd.com" },
    { protocol: "https", hostname: "dailyinqilab.com" },
    { protocol: "https", hostname: "ecdn.dhakatribune.net" },
    { protocol: "https", hostname: "images.assettype.com" },
    { protocol: "https", hostname: "images.dailyamardesh.com" },
    { protocol: "https", hostname: "www.kalbela.com" },
    { protocol: "https", hostname: "media.prothomalo.com" },
    { protocol: "https", hostname: "www.dhakatimes24.com" },
    { protocol: "https", hostname: "www.thedailystar.net" },
  ], maximumRedirects: 0 },
  async headers() { return [{ source: "/:path*", headers: [
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "X-Frame-Options", value: "DENY" },
    { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  ] }]; },
};
export default nextConfig;
