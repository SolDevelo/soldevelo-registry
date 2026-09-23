import Link from "next/link"
import { notFound } from "next/navigation"
import { ChevronRightIcon } from "lucide-react"

import { BlockRenderer } from "@/components/block-renderer"
import { GitHubIcon } from "@/components/icons"
import { PackageManagerPicker } from "@/components/package-manager-picker"
import {
  JsonLd,
  breadcrumbSchema,
  itemSourceCodeSchema,
} from "@/components/structured-data"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { getProject, itemSlug } from "@/config/projects"
import { siteConfig } from "@/config/site"
import { createMetadata, notFoundMetadata } from "@/lib/metadata"
import { createOgImage } from "@/lib/og"
import { getEntriesByKind } from "@/lib/registry-data"
import {
  KIND_LABEL,
  KIND_PLURAL,
  itemPath,
  type RegistryKind,
} from "@/lib/registry-kinds"
import type { RegistryEntry } from "@/lib/types"

import { ProjectBadge } from "./registry-item-list"

function findEntry(kind: RegistryKind, name: string): RegistryEntry | null {
  return getEntriesByKind(kind).find((entry) => entry.name === name) ?? null
}

function sourceUrl(entry: RegistryEntry): string {
  const slug = itemSlug(entry.name, entry.project)
  return `${siteConfig.REPO}/tree/master/registry/${KIND_PLURAL[entry.kind]}/${entry.project}/${slug}`
}

export function itemStaticParams(kind: RegistryKind) {
  return getEntriesByKind(kind).map((entry) => ({ name: entry.name }))
}

export function itemMetadata(kind: RegistryKind, name: string) {
  const entry = findEntry(kind, name)
  if (!entry) return notFoundMetadata

  const project = getProject(entry.project)
  return createMetadata({
    title: entry.title,
    description: entry.description,
    canonicalUrl: itemPath(kind, name).slice(1),
    keywords: [
      entry.title,
      ...(project ? [project.name, `${project.name} ${KIND_LABEL[kind]}`] : []),
      `shadcn ${KIND_LABEL[kind].toLowerCase()}`,
    ],
  })
}

export function itemOgImage(kind: RegistryKind, name: string) {
  const entry = findEntry(kind, name)
  const project = entry ? getProject(entry.project) : null

  return createOgImage({
    title: entry?.title ?? siteConfig.NAME,
    eyebrow: project ? `${project.name} ${KIND_LABEL[kind]}` : KIND_LABEL[kind],
    description: entry?.description,
    cta: "Install It",
  })
}

export function RegistryItemPage({
  kind,
  name,
}: {
  kind: RegistryKind
  name: string
}) {
  const entry = findEntry(kind, name)
  if (!entry) notFound()

  const project = getProject(entry.project)
  const kindUrl = `${siteConfig.URL}/${KIND_PLURAL[kind]}`
  const url = `${siteConfig.URL}${itemPath(kind, name)}`
  return (
    <article className="flex flex-col gap-10 pt-10 sm:pt-14">
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "Home", url: siteConfig.URL },
            { name: `${KIND_LABEL[kind]}s`, url: kindUrl },
            { name: entry.title, url },
          ]),
          itemSourceCodeSchema({
            name: entry.title,
            description: entry.description,
            url,
            codeRepository: sourceUrl(entry),
            keywords: [
              ...(project ? [project.name] : []),
              KIND_LABEL[kind],
              "shadcn/ui",
            ],
          }),
        ]}
      />

      <div className="flex flex-col gap-6">
        <nav aria-label="Breadcrumb">
          <ol className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <li>
              <Link href={`/${KIND_PLURAL[kind]}`}>{KIND_LABEL[kind]}s</Link>
            </li>
            <li aria-hidden="true">
              <ChevronRightIcon className="size-3.5" />
            </li>
            <li aria-current="page" className="truncate text-foreground">
              {entry.title}
            </li>
          </ol>
        </nav>

        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-heading text-3xl leading-tight font-semibold tracking-tighter text-balance sm:text-4xl">
                {entry.title}
              </h1>
              <ProjectBadge project={entry.project} />
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                nativeButton={false}
                render={
                  <a
                    href={sourceUrl(entry)}
                    aria-label={`${entry.title} source on GitHub`}
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                }
              >
                <GitHubIcon data-icon="inline-start" aria-hidden="true" />
                Source
              </Button>
              <PackageManagerPicker />
            </div>
          </div>
          <p className="max-w-3xl text-sm text-pretty text-muted-foreground">
            {entry.description}
          </p>
        </div>

        <Separator />
      </div>

      <BlockRenderer
        name={entry.name}
        title={entry.title}
        height={entry.height}
        files={entry.files}
        priority
      />
    </article>
  )
}
