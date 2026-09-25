import type { MetadataRoute } from "next"

import { siteConfig } from "@/config/site"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // /preview/* exists to be framed, never landed on. It is noindex either way; disallowing it
      // spends the crawl budget on pages that can actually rank.
      disallow: ["/api/", "/preview/", "/ingest/"],
    },
    sitemap: `${siteConfig.URL}/sitemap.xml`,
  }
}
