import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/connections/invite",
        destination: "/invite",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
