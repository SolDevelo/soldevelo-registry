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
  "Whole screen regions for React and shadcn/ui apps, built for real open-source projects and previewed live. Install any block with one command."

export const metadata = createMetadata({
  title: "React Blocks For shadcn/ui",
  description: DESCRIPTION,
  canonicalUrl: "blocks",
  keywords: ["shadcn blocks", "React UI blocks", "open source UI"],
})

export default function BlocksPage() {
  const entries = getEntriesByKind("block")

  return (
    <>
      <JsonLd
        data={[
          catalogBreadcrumbSchema("block", "Blocks"),
          collectionSchema({
            name: `${siteConfig.NAME} Blocks`,
            description: DESCRIPTION,
            url: `${siteConfig.URL}/blocks`,
            items: entries.map((entry) => ({
              name: entry.title,
              url: `${siteConfig.URL}${itemPath(entry.kind, entry.name)}`,
            })),
          }),
        ]}
      />

      <RegistryItemList
        entries={entries}
        heading="Blocks"
        intro={DESCRIPTION}
      />
    </>
  )
}
