import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/password-history",
        destination: "/activity",
        permanent: true,
      },
      {
        source: "/history",
        destination: "/activity",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
