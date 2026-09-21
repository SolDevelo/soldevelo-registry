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

const publisher = {
  "@type": "Organization",
  name: siteConfig.AUTHORS[0].NAME,
  url: siteConfig.AUTHORS[0].URL,
}

export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: siteConfig.NAME,
  url: siteConfig.URL,
  logo: `${siteConfig.URL}/soldevelo.png`,
  description: siteConfig.SHORT_DESCRIPTION,
  parentOrganization: publisher,
  sameAs: [siteConfig.REPO, ...Object.values(siteConfig.SOCIALS)],
}

export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: siteConfig.NAME,
  url: siteConfig.URL,
  description: siteConfig.SHORT_DESCRIPTION,
  publisher,
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
  author: publisher,
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
