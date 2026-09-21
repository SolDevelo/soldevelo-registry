import { itemSlug } from "@/config/projects"
import type { RegistryKind } from "@/lib/registry-kinds"

// Without a target the CLI derives the path from the basename, so same-named files overwrite
// each other. Everything lands under the item's project so a consumer can see where it came from.
export function installTarget(
  kind: RegistryKind,
  itemName: string,
  project: string,
  filePath: string,
  fileCount: number
): string {
  const base = filePath.split("/").pop() ?? ""
  const extension = base.slice(base.indexOf("."))
  const slug = itemSlug(itemName, project)

  if (kind === "template") {
    // A template ships a route plus the sections it owns, all under its own name.
    return base === "page.tsx"
      ? `app/${slug}/page.tsx`
      : `components/${project}/${slug}/${base}`
  }

  const root =
    kind === "component"
      ? `components/${project}`
      : `components/blocks/${project}`

  return fileCount > 1
    ? `${root}/${slug}/${base}`
    : `${root}/${slug}${extension}`
}
