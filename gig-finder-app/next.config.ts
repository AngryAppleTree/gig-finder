import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/',
        destination: '/gigfinder',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
