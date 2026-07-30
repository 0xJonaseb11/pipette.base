import type { NextConfig } from "next";

const unusedOptionalPeers = [
  "@base-org/account",
  "@gemini-wallet/core",
  "porto",
  "@react-native-async-storage/async-storage",
  "@x402/core",
  "@x402/evm",
  "@x402/svm",
  "@x402/extensions",
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  typescript: {
    ignoreBuildErrors: process.env.NEXT_PUBLIC_IGNORE_BUILD_ERROR === "true",
  },
  webpack: config => {
    config.resolve.fallback = { fs: false, net: false, tls: false, ...config.resolve.fallback };
    config.externals.push("pino-pretty", "lokijs", "encoding");
    config.resolve.alias = {
      ...config.resolve.alias,
      ...Object.fromEntries(unusedOptionalPeers.map(name => [name, false])),
    };
    return config;
  },
};

module.exports = nextConfig;
