import type { RegistryItem } from "shadcn/schema"

// The three things this registry publishes. `kind` is the site's vocabulary; `type` is shadcn's.
export const REGISTRY_KINDS = ["component", "block", "template"] as const

export type RegistryKind = (typeof REGISTRY_KINDS)[number]

export const KIND_LABEL: Record<RegistryKind, string> = {
  component: "Component",
  block: "Block",
  template: "Template",
}

export const KIND_PLURAL: Record<RegistryKind, string> = {
  component: "components",
  block: "blocks",
  template: "templates",
}

const TYPE_TO_KIND: Record<string, RegistryKind> = {
  "registry:ui": "component",
  "registry:component": "component",
  "registry:block": "block",
  "registry:page": "template",
}

export function kindOf(item: RegistryItem): RegistryKind {
  const kind = TYPE_TO_KIND[item.type]
  if (!kind) {
    throw new Error(
      `${item.name}: unsupported registry type "${item.type}". ` +
        `Use registry:ui, registry:component, registry:block or registry:page.`
    )
  }
  return kind
}
