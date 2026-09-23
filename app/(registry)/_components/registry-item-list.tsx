import Link from "next/link"

import { BlockRenderer } from "@/components/block-renderer"
import { LogoMark, ProjectMark } from "@/components/logo"
import { PackageManagerPicker } from "@/components/package-manager-picker"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { getProject, projectPath } from "@/config/projects"
import { itemPath } from "@/lib/registry-kinds"
import type { RegistryEntry } from "@/lib/types"

// A flat catalog puts the item title at h2; a grouped page pushes it to h3.
type HeadingLevel = "h2" | "h3"

export function ProjectBadge({ project }: { project: string }) {
  const entry = getProject(project)
  if (!entry) return null

  return (
    <Badge
      variant="secondary"
      render={
        <Link
          href={projectPath(entry.id)}
          aria-label={`All ${entry.name} items`}
          title={entry.description}
        />
      }
    >
      <ProjectMark project={project} className="size-3.5" />
      {entry.name}
    </Badge>
  )
}

export function RegistryItemEntry({
  entry,
  headingAs: Heading = "h2",
  priority = false,
}: {
  entry: RegistryEntry
  headingAs?: HeadingLevel
  priority?: boolean
}) {
  return (
    <article id={entry.name} className="flex scroll-mt-24 flex-col gap-4">
      <div className="flex flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          {/* The registry title is the heading: it carries the keywords, where the slug does not. */}
          <Heading className="text-base font-semibold tracking-tight">
            <Link href={itemPath(entry.kind, entry.name)}>{entry.title}</Link>
          </Heading>
          <ProjectBadge project={entry.project} />
        </div>
        <p className="max-w-2xl text-sm text-pretty text-muted-foreground">
          {entry.description}
        </p>
      </div>

      <BlockRenderer
        name={entry.name}
        title={entry.title}
        height={entry.height}
        files={entry.files}
        priority={priority}
      />
    </article>
  )
}

export function CatalogHeader({
  heading,
  intro,
  mark = <LogoMark className="size-8 sm:size-9" />,
  withPicker = true,
  children,
}: React.PropsWithChildren<{
  heading: string
  intro: string
  mark?: React.ReactNode
  // Only pages with Install buttons need it.
  withPicker?: boolean
}>) {
  return (
    <div className="flex flex-col gap-6 pt-14 sm:pt-20">
      <div className="flex flex-col items-start gap-3">
        <div className="flex w-full flex-wrap items-center justify-between gap-3">
          <h1
            id="catalog-heading"
            className="flex items-center gap-3 text-3xl leading-tight font-semibold tracking-tighter text-balance sm:text-4xl"
          >
            {/* Decorative: the heading text alone is what a screen reader should announce. */}
            {mark}
            {heading}
          </h1>
          {/* Sets the package manager every Install button on the page copies. */}
          {withPicker && <PackageManagerPicker />}
        </div>
        <p className="max-w-3xl text-sm text-pretty text-muted-foreground">
          {intro}
        </p>
        {children}
      </div>
      <Separator />
    </div>
  )
}

export function RegistryItemList({
  entries,
  heading,
  intro,
}: {
  entries: RegistryEntry[]
  heading: string
  intro: string
}) {
  return (
    <section
      className="mx-auto flex w-full flex-col gap-8"
      aria-labelledby="catalog-heading"
    >
      <CatalogHeader heading={heading} intro={intro} />

      <div className="flex flex-col gap-12">
        {entries.map((entry, index) => (
          <RegistryItemEntry
            key={entry.name}
            entry={entry}
            priority={index < 2}
          />
        ))}
      </div>
    </section>
  )
}
