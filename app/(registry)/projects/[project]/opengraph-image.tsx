import { getProject } from "@/config/projects"
import { siteConfig } from "@/config/site"
import { OG_CONTENT_TYPE, OG_SIZE, createOgImage } from "@/lib/og"
import { getProjects } from "@/lib/registry-data"

export const alt = "A project in the SolDevelo Registry"
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export function generateStaticParams() {
  return getProjects().map((project) => ({ project }))
}

export default async function Image({
  params,
}: {
  params: Promise<{ project: string }>
}) {
  const project = getProject((await params).project)

  return createOgImage({
    title: project ? `${project.name} UI Components` : siteConfig.NAME,
    eyebrow: "Project",
    description: project?.description,
    cta: "Browse Items",
  })
}
