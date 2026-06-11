// Modified by konlyzx (2026) - Removed hardcoded R2 URLs; should be configured via environment variables
// Base project structure under Apache License 2.0 (Copyright 2025 Kartik Labhshetwar)

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,

  images: {
    remotePatterns: [
      {
        // R2 custom domain - configure via NEXT_PUBLIC_R2_CUSTOM_DOMAIN
        protocol: "https",
        hostname: process.env.NEXT_PUBLIC_R2_CUSTOM_DOMAIN || "localhost",
      },
      {
        // R2 dev bucket - configure via NEXT_PUBLIC_R2_PUBLIC_URL
        protocol: "https",
        hostname: process.env.NEXT_PUBLIC_R2_PUBLIC_URL?.replace("https://", "") || "localhost",
      },
    ],
    // Disable image optimization for R2 backgrounds to avoid validation errors
    unoptimized: true,
  },

  // Enable SharedArrayBuffer for multi-threaded FFmpeg WASM
  // Requires Cross-Origin-Opener-Policy and Cross-Origin-Embedder-Policy
  // Only applied to editor routes
  async headers() {
    return [
      // Security and SEO headers for all pages
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
      // COOP/COEP for editor routes (FFmpeg WASM)
      {
        source: "/editor/:path*",
        headers: [
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Cross-Origin-Embedder-Policy", value: "credentialless" },
        ],
      },
      {
        source: "/home",
        headers: [
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Cross-Origin-Embedder-Policy", value: "credentialless" },
        ],
      },
    ];
  },

  // Permanent redirects for SEO (301)
  async redirects() {
    return [
      // Old /home editor URL → new / root
      {
        source: "/home",
        destination: "/",
        permanent: true,
      },
    ];
  },

  // Proxy PostHog through same origin to bypass ad blockers
  async rewrites() {
    return [
      {
        source: "/svc/static/:path*",
        destination: "https://us-assets.i.posthog.com/static/:path*",
      },
      {
        source: "/svc/:path*",
        destination: "https://us.i.posthog.com/:path*",
      },
    ];
  },

  // REQUIRED for react-konva
  webpack: (config) => {
    config.externals = [...(config.externals || []), { canvas: "canvas" }];
    return config;
  },

  // Turbopack configuration (Next.js 16+ default bundler)
  turbopack: {},

};

export default nextConfig;
