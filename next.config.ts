import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: { serverActions: { bodySizeLimit: "6mb" } },
  poweredByHeader: false,
  outputFileTracingIncludes: {
    "/api/portraits/[id]": ["./private/portraits/**/*"],
  },
};
export default nextConfig;
