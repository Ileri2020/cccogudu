import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Keep production builds separate from the `.next` directory used by `next dev`.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "http",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "static.vecteezy.com",
      },
    ],
  },
  // webpack5: false,

  // serverExternalPackages: ["mongoose"],

  // experimental: {
  //   // appDir: true,
  //   esmExternals: "loose", // <-- add this
  //   serverComponentsExternalPackages: ["mongoose"] // <-- and this
  // },

  // and the following to enable top-level await support for Webpack
  // webpack: (config) => {
  //   config.experiments = {
  //     ...config.experiments,
  //     topLevelAwait: true
  //   };
  //   return config;
  // },
};

export default nextConfig;
