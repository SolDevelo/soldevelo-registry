import Link from "next/link"
import { ChevronRightIcon } from "lucide-react"

import { ProjectMark } from "@/components/logo"
import {
  JsonLd,
  breadcrumbSchema,
  collectionSchema,
} from "@/components/structured-data"
import { projectPath, resolveProjects } from "@/config/projects"
import { siteConfig } from "@/config/site"
import { createMetadata } from "@/lib/metadata"
import { getAllEntries, getProjects } from "@/lib/registry-data"
import { KIND_LABEL, REGISTRY_KINDS } from "@/lib/registry-kinds"

import { CatalogHeader } from "../_components/registry-item-list"

const DESCRIPTION =
  "The open-source projects this registry publishes for, each with its own React components, blocks and page templates for shadcn/ui."

export const metadata = createMetadata({
  title: "Open Source Projects Using shadcn/ui",
  description: DESCRIPTION,
  canonicalUrl: "projects",
  keywords: ["open source projects", "shadcn/ui projects"],
})

// "6 components, 3 blocks, 1 template", leaving out kinds the project has none of.
function itemCounts(project: string): string {
  const entries = getAllEntries().filter((entry) => entry.project === project)
  return REGISTRY_KINDS.map((kind) => {
    const count = entries.filter((entry) => entry.kind === kind).length
    const label = KIND_LABEL[kind].toLowerCase()
    return count > 0 ? `${count} ${label}${count === 1 ? "" : "s"}` : null
  })
    .filter(Boolean)
    .join(", ")
}

export default function ProjectsPage() {
  const projects = resolveProjects(getProjects())
  const url = `${siteConfig.URL}/projects`

  return (
    <section
      className="mx-auto flex w-full flex-col gap-8"
      aria-labelledby="catalog-heading"
    >
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "Home", url: siteConfig.URL },
            { name: "Projects", url },
          ]),
          collectionSchema({
            name: `${siteConfig.NAME} Projects`,
            description: DESCRIPTION,
            url,
            items: projects.map((project) => ({
              name: project.name,
              url: `${siteConfig.URL}${projectPath(project.id)}`,
            })),
          }),
        ]}
      />

      <CatalogHeader
        heading="Projects"
        intro={DESCRIPTION}
        withPicker={false}
      />

      <ul className="grid gap-4 sm:grid-cols-2">
        {projects.map((project) => (
          <li key={project.id}>
            <Link
              href={projectPath(project.id)}
              className="group flex h-full items-start gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50"
            >
              <ProjectMark project={project.id} className="size-10 shrink-0" />
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <h2 className="text-base font-semibold tracking-tight">
                  {project.name}
                </h2>
                <p className="text-sm text-pretty text-muted-foreground">
                  {project.description}
                </p>
                <p className="pt-1 text-xs text-muted-foreground">
                  {itemCounts(project.id)}
                </p>
              </div>
              <ChevronRightIcon
                aria-hidden="true"
                className="size-4 shrink-0 self-center text-muted-foreground transition-transform group-hover:translate-x-0.5 rtl:rotate-180"
              />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
