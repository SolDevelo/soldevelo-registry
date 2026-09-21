import { itemSlug } from "@/config/projects"
import type { RegistryKind } from "@/lib/registry-kinds"

// One arm per kind, each keeping a statically analysable prefix so the bundler
// can build the chunk map. The path shape is otherwise identical.
export function importPreview(entry: {
  kind: RegistryKind
  name: string
  project: string
}) {
  const slug = itemSlug(entry.name, entry.project)

  if (entry.kind === "block") {
    return () => import(`@/registry/blocks/${entry.project}/${slug}/page`)
  }
  if (entry.kind === "component") {
    return () => import(`@/registry/components/${entry.project}/${slug}/page`)
  }
  return () => import(`@/registry/templates/${entry.project}/${slug}/page`)
}
