import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/',
        destination: '/gigfinder.html',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
