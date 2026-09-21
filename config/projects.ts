// The open-source projects this registry publishes for. Every item declares its project in
// `meta.project` and repeats it as a name prefix, so a name can never drift from its metadata.
export type Project = {
  id: string
  name: string
  description: string
  // The project's own site, not a page on this one.
  url: string
  // Square mark under public/projects/, shown beside every item from the project.
  logo: string
}

export const PROJECTS: Record<string, Project> = {
  openlmis: {
    id: "openlmis",
    name: "OpenLMIS",
    description:
      "An open-source electronic logistics management information system for public health supply chains.",
    url: "https://openlmis.org",
    logo: "/projects/openlmis.png",
  },
}

export function getProject(id: string): Project | null {
  return PROJECTS[id] ?? null
}

// The item's own slug: `openlmis-stock-summary` in project `openlmis` is `stock-summary`.
export function itemSlug(itemName: string, project: string): string {
  return itemName.startsWith(`${project}-`)
    ? itemName.slice(project.length + 1)
    : itemName
}

// Resolves ids to entries, skipping any the config no longer knows about.
export function resolveProjects(ids: string[]): Project[] {
  return ids
    .map((id) => PROJECTS[id])
    .filter((project) => project !== undefined)
}
