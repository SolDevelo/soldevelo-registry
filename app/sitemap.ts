import type { MetadataRoute } from "next"

import { projectPath } from "@/config/projects"
import { siteConfig } from "@/config/site"
import { getAllEntries, getProjects } from "@/lib/registry-data"
import { itemPath } from "@/lib/registry-kinds"

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
    {
      url: `${siteConfig.URL}/projects`,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...getProjects().map((project) => ({
      url: `${siteConfig.URL}${projectPath(project)}`,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    })),
    ...getAllEntries().map((entry) => ({
      url: `${siteConfig.URL}${itemPath(entry.kind, entry.name)}`,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ]
}
