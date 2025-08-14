/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  transpilePackages: ["@repo/ui", "@repo/shared", "@repo/database", "@repo/auth"],
  experimental: {
    esmExternals: "loose",
  },
  images: {
    domains: ["localhost"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY || "default-value",
  },
};

module.exports = nextConfig;
