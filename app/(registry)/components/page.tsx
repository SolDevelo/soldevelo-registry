import {
  JsonLd,
  catalogBreadcrumbSchema,
  collectionSchema,
} from "@/components/structured-data"
import { siteConfig } from "@/config/site"
import { createMetadata } from "@/lib/metadata"
import { getEntriesByKind } from "@/lib/registry-data"
import { itemPath } from "@/lib/registry-kinds"

import { RegistryItemList } from "../_components/registry-item-list"

const DESCRIPTION =
  "Small React primitives from the projects in this registry: status pills, badges and labels that render a domain value with consistent wording and colour wherever it appears."

export const metadata = createMetadata({
  title: "Components",
  description: DESCRIPTION,
  canonicalUrl: "components",
  keywords: [
    "shadcn registry components",
    "React components",
    "open source UI",
  ],
})

export default function ComponentsPage() {
  const entries = getEntriesByKind("component")

  return (
    <>
      <JsonLd
        data={[
          catalogBreadcrumbSchema("component", "Components"),
          collectionSchema({
            name: `${siteConfig.NAME} Components`,
            description: DESCRIPTION,
            url: `${siteConfig.URL}/components`,
            items: entries.map((entry) => ({
              name: entry.title,
              url: `${siteConfig.URL}${itemPath(entry.kind, entry.name)}`,
            })),
          }),
        ]}
      />
      <RegistryItemList
        entries={entries}
        heading="Components"
        intro={DESCRIPTION}
      />
    </>
  )
}
