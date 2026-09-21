import {
  JsonLd,
  catalogBreadcrumbSchema,
  collectionSchema,
} from "@/components/structured-data"
import { siteConfig } from "@/config/site"
import { createMetadata } from "@/lib/metadata"
import { getEntriesByKind } from "@/lib/registry-data"

import { RegistryItemList } from "../_components/registry-item-list"

const DESCRIPTION =
  "Complete pages you can install in one command. Each template ships its route plus editable copies of every section it is built from, so nothing is hidden behind a package."

export const metadata = createMetadata({
  title: "Page Templates",
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
              url: `${siteConfig.URL}/templates#${entry.name}`,
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
