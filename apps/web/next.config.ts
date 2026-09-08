import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL;
    if (
      apiUrl &&
      apiUrl.startsWith("http") &&
      !apiUrl.includes("localhost") &&
      !apiUrl.includes("127.0.0.1")
    ) {
      return [
        {
          source: "/api/v1/:path*",
          destination: `${apiUrl.replace(/\/+$/, "")}/api/v1/:path*`,
        },
      ];
    }
    return [];
  },
};

export default nextConfig;
