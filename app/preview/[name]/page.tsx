import { notFound } from "next/navigation"

import { siteConfig } from "@/config/site"
import { createMetadata, notFoundMetadata } from "@/lib/metadata"
import { importPreview } from "@/lib/preview-imports"
import { findEntryByName, getAllEntries } from "@/lib/registry-data"

export const revalidate = false
export const dynamic = "force-static"

export function generateStaticParams() {
  return getAllEntries().map((entry) => ({ name: entry.name }))
}

export async function generateMetadata({
  params,
}: PageProps<"/preview/[name]">) {
  const { name } = await params
  const entry = findEntryByName(name)

  if (!entry) return notFoundMetadata

  return createMetadata({
    title: `${entry.title} Preview`,
    description: `Live preview of ${entry.title}, a ${entry.kind} in the ${siteConfig.NAME}. See it in action and install it with the shadcn CLI.`,
    canonicalUrl: `preview/${entry.name}`,
    // These pages exist to be framed by the catalog, never landed on from search.
    noIndex: true,
  })
}

export default async function PreviewPage({
  params,
}: PageProps<"/preview/[name]">) {
  const { name } = await params
  const entry = findEntryByName(name)

  if (!entry) notFound()

  const { default: Preview } = await importPreview(entry)()

  return <Preview />
}
