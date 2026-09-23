import { notFound } from "next/navigation"

import { ProjectMark } from "@/components/logo"
import {
  JsonLd,
  breadcrumbSchema,
  collectionSchema,
} from "@/components/structured-data"
import { Button } from "@/components/ui/button"
import { getProject, projectPath, type Project } from "@/config/projects"
import { siteConfig } from "@/config/site"
import { createMetadata, notFoundMetadata } from "@/lib/metadata"
import { getAllEntries, getProjects } from "@/lib/registry-data"
import { KIND_LABEL, REGISTRY_KINDS, itemPath } from "@/lib/registry-kinds"

import {
  CatalogHeader,
  RegistryItemEntry,
} from "../../_components/registry-item-list"

export const dynamicParams = false

export function generateStaticParams() {
  return getProjects().map((project) => ({ project }))
}

function projectTitle(project: Project): string {
  return `${project.name} UI Components For React And shadcn/ui`
}

// Leads with what the page offers, so a cut-off search snippet still says it.
function projectIntro(project: Project): string {
  return `${project.name} React components, blocks and page templates for shadcn/ui, previewed live and installed with one command. ${project.description}`
}

export async function generateMetadata({
  params,
}: PageProps<"/projects/[project]">) {
  const project = getProject((await params).project)
  if (!project) return notFoundMetadata

  return createMetadata({
    title: projectTitle(project),
    description: projectIntro(project),
    canonicalUrl: projectPath(project.id).slice(1),
    keywords: [
      project.name,
      `${project.name} UI`,
      `${project.name} components`,
      `${project.name} React`,
    ],
  })
}

export default async function ProjectPage({
  params,
}: PageProps<"/projects/[project]">) {
  const project = getProject((await params).project)
  if (!project) notFound()

  const entries = getAllEntries().filter(
    (entry) => entry.project === project.id
  )
  const url = `${siteConfig.URL}${projectPath(project.id)}`

  return (
    <section
      className="mx-auto flex w-full flex-col gap-12"
      aria-labelledby="catalog-heading"
    >
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "Home", url: siteConfig.URL },
            { name: "Projects", url: `${siteConfig.URL}/projects` },
            { name: project.name, url },
          ]),
          collectionSchema({
            name: projectTitle(project),
            description: projectIntro(project),
            url,
            items: entries.map((entry) => ({
              name: entry.title,
              url: `${siteConfig.URL}${itemPath(entry.kind, entry.name)}`,
            })),
          }),
        ]}
      />

      <CatalogHeader
        heading={`${project.name} UI Components`}
        intro={projectIntro(project)}
        mark={<ProjectMark project={project.id} className="size-8 sm:size-9" />}
      >
        <Button
          variant="outline"
          size="sm"
          nativeButton={false}
          render={
            <a
              href={project.url}
              aria-label={`${project.name} website`}
              target="_blank"
              rel="noopener noreferrer"
            />
          }
        >
          <ProjectMark project={project.id} className="size-3.5" />
          Website
        </Button>
      </CatalogHeader>

      {REGISTRY_KINDS.map((kind) => {
        const ofKind = entries.filter((entry) => entry.kind === kind)
        if (ofKind.length === 0) return null

        return (
          <section
            key={kind}
            aria-labelledby={`${kind}-heading`}
            className="flex flex-col gap-8"
          >
            <h2
              id={`${kind}-heading`}
              className="text-xl font-semibold tracking-tight"
            >
              {KIND_LABEL[kind]}s
            </h2>
            <div className="flex flex-col gap-12">
              {ofKind.map((entry) => (
                <RegistryItemEntry
                  key={entry.name}
                  entry={entry}
                  headingAs="h3"
                />
              ))}
            </div>
          </section>
        )
      })}
    </section>
  )
}
