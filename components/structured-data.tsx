import { siteConfig } from "@/config/site"
import { KIND_PLURAL, type RegistryKind } from "@/lib/registry-kinds"

export function JsonLd({
  data,
}: {
  data: Record<string, unknown> | Record<string, unknown>[]
}) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  )
}

// The company is the Organization; the registry is a WebSite it publishes. Its social profiles
// belong to the company, so they sit here rather than on the registry.
const publisher = {
  "@type": "Organization",
  "@id": `${siteConfig.AUTHORS[0].URL}/#organization`,
  name: siteConfig.AUTHORS[0].NAME,
  url: siteConfig.AUTHORS[0].URL,
}

export const organizationSchema = {
  "@context": "https://schema.org",
  ...publisher,
  // Google wants a logo of at least 112px square; the wordmark is 180x37.
  logo: `${siteConfig.URL}/icon-512.png`,
  sameAs: Object.values(siteConfig.SOCIALS),
}

export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: siteConfig.NAME,
  url: siteConfig.URL,
  description: siteConfig.SHORT_DESCRIPTION,
  publisher: { "@id": publisher["@id"] },
}

export const softwareSourceCodeSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  name: siteConfig.NAME,
  description: siteConfig.DESCRIPTION,
  codeRepository: siteConfig.REPO,
  programmingLanguage: "TypeScript",
  runtimePlatform: "React",
  url: siteConfig.URL,
  author: { "@id": publisher["@id"] },
}

export function itemSourceCodeSchema({
  name,
  description,
  url,
  codeRepository,
  keywords,
}: {
  name: string
  description: string
  url: string
  codeRepository: string
  keywords: string[]
}) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    name,
    description,
    url,
    codeRepository,
    keywords: keywords.join(", "),
    programmingLanguage: "TypeScript",
    runtimePlatform: "React",
    license: "https://opensource.org/licenses/MIT",
    isPartOf: {
      "@type": "WebSite",
      name: siteConfig.NAME,
      url: siteConfig.URL,
    },
    author: { "@id": publisher["@id"] },
  }
}

export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

export function catalogBreadcrumbSchema(kind: RegistryKind, kindLabel: string) {
  return breadcrumbSchema([
    { name: "Home", url: siteConfig.URL },
    { name: kindLabel, url: `${siteConfig.URL}/${KIND_PLURAL[kind]}` },
  ])
}

export function collectionSchema({
  name,
  description,
  url,
  items,
}: {
  name: string
  description: string
  url: string
  items: { name: string; url: string }[]
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    description,
    url,
    isPartOf: {
      "@type": "WebSite",
      name: siteConfig.NAME,
      url: siteConfig.URL,
    },
    ...(items.length > 0 && {
      mainEntity: {
        "@type": "ItemList",
        numberOfItems: items.length,
        itemListElement: items.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.name,
          url: item.url,
        })),
      },
    }),
  }
}

export function faqPageSchema(items: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  }
}
