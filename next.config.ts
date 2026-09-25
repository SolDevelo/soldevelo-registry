import type { NextConfig } from "next"

const securityHeaders = [
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
]

// Only the production deployment should be indexable; previews and branch deploys must not compete with it.
const isProduction =
  process.env.VERCEL_ENV === "production" ||
  process.env.SITE_ENV === "production"

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  // PostHog's API paths end in a slash, which the default redirect would strip.
  // The redirect below restores it for every other path.
  skipTrailingSlashRedirect: true,
  async redirects() {
    return [
      {
        source: "/:path((?!ingest(?:/|$)).+)/",
        destination: "/:path",
        permanent: true,
      },
    ]
  },
  async rewrites() {
    return [
      {
        source: "/ingest/static/:path*",
        destination: "https://eu-assets.i.posthog.com/static/:path*",
      },
      {
        source: "/ingest/:path*",
        destination: "https://eu.i.posthog.com/:path*",
      },
    ]
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // The registry JSON is fetched by the shadcn CLI, which ignores this, but a crawler
      // following the links would otherwise index a pile of title-less JSON documents.
      {
        source: "/r/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex" }],
      },
      ...(isProduction
        ? []
        : [
            {
              source: "/:path*",
              headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
            },
          ]),
    ]
  },
}

export default nextConfig
