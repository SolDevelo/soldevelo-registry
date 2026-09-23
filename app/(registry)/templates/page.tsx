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
  "Complete React pages for shadcn/ui, installed in one command. Each template ships editable copies of every part it is built from."

export const metadata = createMetadata({
  title: "React Page Templates For shadcn/ui",
  description: DESCRIPTION,
  canonicalUrl: "templates",
  keywords: ["page templates", "shadcn templates", "open source UI"],
})

export default function TemplatesPage() {
  const entries = getEntriesByKind("template")

  return (
    <>
      <JsonLd
        data={[
          catalogBreadcrumbSchema("template", "Templates"),
          collectionSchema({
            name: `${siteConfig.NAME} Page Templates`,
            description: DESCRIPTION,
            url: `${siteConfig.URL}/templates`,
            items: entries.map((entry) => ({
              name: entry.title,
              url: `${siteConfig.URL}${itemPath(entry.kind, entry.name)}`,
            })),
          }),
        ]}
      />
      <RegistryItemList
        entries={entries}
        heading="Templates"
        intro={DESCRIPTION}
      />
    </>
  )
}
