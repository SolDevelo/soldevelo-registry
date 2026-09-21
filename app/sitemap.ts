import type { MetadataRoute } from "next"

import { siteConfig } from "@/config/site"

// lastModified is deliberately omitted: there is no per-URL change timestamp, and stamping every
// route with the build time makes the whole sitemap look freshly modified on each deploy, which
// trains crawlers to ignore the signal.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    // No trailing slash, so this matches the canonical createMetadata resolves for "/".
    { url: siteConfig.URL, changeFrequency: "weekly", priority: 1 },
    {
      url: `${siteConfig.URL}/components`,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${siteConfig.URL}/blocks`,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${siteConfig.URL}/templates`,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${siteConfig.URL}/docs`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${siteConfig.URL}/changelog`,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ]
}
