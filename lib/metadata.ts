import type { Metadata } from "next"

import { siteConfig } from "@/config/site"

type OpenGraphType = "website" | "article"

export type CreateMetadataOptions = {
  title: string
  description: string
  // Path relative to the site root, without a leading slash. "" for the home page.
  canonicalUrl: string
  noIndex?: boolean
  keywords?: string[]
  type?: OpenGraphType
}

export function createMetadata({
  title,
  description,
  canonicalUrl,
  noIndex = false,
  keywords = [],
  type = "website",
}: CreateMetadataOptions): Metadata {
  return {
    title: title === siteConfig.NAME ? title : `${title} - ${siteConfig.NAME}`,
    description,
    keywords: [...siteConfig.KEYWORDS, ...keywords],
    authors: siteConfig.AUTHORS.map((author) => ({
      name: author.NAME,
      url: author.URL,
    })),
    creator: siteConfig.AUTHORS[0].NAME,
    publisher: siteConfig.AUTHORS[0].NAME,
    metadataBase: new URL(siteConfig.URL),

    openGraph: {
      title,
      description,
      type,
      locale: "en_US",
      siteName: siteConfig.NAME,
      // Omitted when there is nothing to point at, or Next resolves "" to the home page.
      ...(canonicalUrl && { url: canonicalUrl }),
    },

    twitter: { card: "summary_large_image", title, description },

    robots: {
      index: !noIndex,
      follow: !noIndex,
      googleBot: { index: !noIndex, follow: !noIndex },
    },

    // "" would be dropped rather than resolved, leaving the home page with no canonical at all.
    alternates: { canonical: noIndex ? null : canonicalUrl || "/" },
  }
}

// Without this a 404 inherits the root layout's title and a canonical pointing at the home page.
export const notFoundMetadata: Metadata = createMetadata({
  title: "Page Not Found",
  description: "The page you are looking for does not exist or has moved.",
  canonicalUrl: "",
  noIndex: true,
})
