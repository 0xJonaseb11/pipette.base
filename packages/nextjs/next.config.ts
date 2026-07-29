import type { NextConfig } from "next";

const optionalPeerStubs = [
  "@gemini-wallet/core",
  "@metamask/sdk",
  "@metamask/sdk-analytics",
  "porto",
  "@react-native-async-storage/async-storage",
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  typescript: {
    ignoreBuildErrors: process.env.NEXT_PUBLIC_IGNORE_BUILD_ERROR === "true",
  },
  eslint: {
    ignoreDuringBuilds: process.env.NEXT_PUBLIC_IGNORE_BUILD_ERROR === "true",
  },
  webpack: config => {
    config.resolve.fallback = { fs: false, net: false, tls: false, ...config.resolve.fallback };
    config.externals.push("pino-pretty", "lokijs", "encoding");
    config.resolve.alias = {
      ...config.resolve.alias,
      ...Object.fromEntries(optionalPeerStubs.map(name => [name, false])),
    };
    return config;
  },
};

module.exports = nextConfig;
