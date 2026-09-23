import Link from "next/link"
import { notFound } from "next/navigation"
import { ChevronRightIcon } from "lucide-react"

import { BlockRenderer } from "@/components/block-renderer"
import { Mono } from "@/components/mono"
import { PackageManagerPicker } from "@/components/package-manager-picker"
import {
  JsonLd,
  breadcrumbSchema,
  itemSourceCodeSchema,
} from "@/components/structured-data"
import { Separator } from "@/components/ui/separator"
import { getProject, itemSlug, projectPath } from "@/config/projects"
import { siteConfig } from "@/config/site"
import { createMetadata, notFoundMetadata } from "@/lib/metadata"
import { createOgImage } from "@/lib/og"
import { getAllEntries, getEntriesByKind } from "@/lib/registry-data"
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
    // The bare title competes with every generic item of that name, so it says whose and for what.
    title: `${entry.title}: ${project ? `${project.name} ` : ""}React ${KIND_LABEL[kind]} For shadcn/ui`,
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

// Another registry item is published as its /r/ URL; anything else is a shadcn primitive name.
function registryItemName(dependency: string): string | null {
  return dependency.match(/\/r\/([^/]+)\.json$/)?.[1] ?? null
}

function ItemLinks({ entries }: { entries: RegistryEntry[] }) {
  return entries.map((entry) => (
    <Link
      key={entry.name}
      href={itemPath(entry.kind, entry.name)}
      className="underline decoration-foreground/30 underline-offset-4 transition-colors hover:decoration-foreground"
    >
      {entry.title}
    </Link>
  ))
}

function DetailRow({
  label,
  children,
}: React.PropsWithChildren<{ label: string }>) {
  return (
    <div className="flex flex-col gap-1.5 sm:flex-row sm:gap-6">
      <dt className="shrink-0 text-muted-foreground sm:w-40">{label}</dt>
      <dd className="flex min-w-0 flex-wrap gap-x-3 gap-y-1.5">{children}</dd>
    </div>
  )
}

// What the item is made of and where it is used, derived from the build so it cannot drift.
function ItemDetails({ entry }: { entry: RegistryEntry }) {
  const project = getProject(entry.project)
  const all = getAllEntries()
  const uses = new Set(
    entry.registryDependencies.map(registryItemName).filter(Boolean)
  )
  const builtWith = all.filter((other) => uses.has(other.name))
  const primitives = entry.registryDependencies.filter(
    (dependency) => registryItemName(dependency) === null
  )
  const usedIn = all.filter((other) =>
    other.registryDependencies.some(
      (dependency) => registryItemName(dependency) === entry.name
    )
  )
  const fileCount = entry.files.filter((file) => file.target !== null).length

  return (
    <section aria-labelledby="details-heading" className="flex flex-col gap-4">
      <h2
        id="details-heading"
        className="font-heading text-lg font-medium tracking-tight"
      >
        Details
      </h2>
      <dl className="flex flex-col gap-4 rounded-lg border p-4 text-sm">
        <DetailRow label="Type">{KIND_LABEL[entry.kind]}</DetailRow>
        {project && (
          <DetailRow label="Project">
            <Link
              href={projectPath(project.id)}
              className="underline decoration-foreground/30 underline-offset-4 transition-colors hover:decoration-foreground"
            >
              {project.name}
            </Link>
          </DetailRow>
        )}
        <DetailRow label="Files">
          {fileCount} {fileCount === 1 ? "file" : "files"}
        </DetailRow>
        {builtWith.length > 0 && (
          <DetailRow label="Built With">
            <ItemLinks entries={builtWith} />
          </DetailRow>
        )}
        {primitives.length > 0 && (
          <DetailRow label="shadcn/ui">
            {primitives.map((name) => (
              <Mono key={name}>{name}</Mono>
            ))}
          </DetailRow>
        )}
        <DetailRow label="npm Packages">
          {entry.dependencies.length > 0
            ? entry.dependencies.map((name) => <Mono key={name}>{name}</Mono>)
            : "None beyond React"}
        </DetailRow>
        {usedIn.length > 0 && (
          <DetailRow label="Used In">
            <ItemLinks entries={usedIn} />
          </DetailRow>
        )}
      </dl>
    </section>
  )
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
            <PackageManagerPicker />
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

      <ItemDetails entry={entry} />
    </article>
  )
}
