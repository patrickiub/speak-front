import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // A v2 virou a /sala principal; mantém links antigos funcionando.
      { source: "/sala-v2", destination: "/sala", permanent: true },
    ];
  },
};

export default nextConfig;
