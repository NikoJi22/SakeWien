import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/menu", destination: "/order-online", permanent: true },
      { source: "/menu/bestsellers", destination: "/order-online", permanent: true },
      { source: "/menu/new", destination: "/order-online", permanent: true }
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com"
      },
      {
        protocol: "https",
        hostname: "api.qrserver.com"
      }
    ]
  }
};

export default nextConfig;
