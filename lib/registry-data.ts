// Derives everything from the generated config/*, which embed full source. Server-only: that is a
// large module with no business in a client bundle. Client components take the computed data as props.
import "server-only"

import { blocks } from "@/config/blocks"
import { components } from "@/config/components"
import { templates } from "@/config/templates"
import type { RegistryKind } from "@/lib/registry-kinds"
import type { RegistryEntry } from "@/lib/types"

const BY_KIND: Record<RegistryKind, RegistryEntry[]> = {
  component: components,
  block: blocks,
  template: templates,
}

export function getEntriesByKind(kind: RegistryKind): RegistryEntry[] {
  return BY_KIND[kind]
}

export function getAllEntries(): RegistryEntry[] {
  return [...components, ...blocks, ...templates]
}

export type SearchEntry = {
  name: string
  kind: RegistryKind
  project: string
  title: string
  description: string
}

// Only what the palette needs: the full entries carry every item's source.
export function getSearchIndex(): SearchEntry[] {
  return getAllEntries().map((entry) => ({
    name: entry.name,
    kind: entry.kind,
    project: entry.project,
    title: entry.title,
    description: entry.description,
  }))
}

export function findEntryByName(name: string): RegistryEntry | null {
  return getAllEntries().find((entry) => entry.name === name) ?? null
}

export function getProjects(): string[] {
  return [...new Set(getAllEntries().map((entry) => entry.project))]
}

export function getCounts(): Record<RegistryKind, number> {
  return {
    component: components.length,
    block: blocks.length,
    template: templates.length,
  }
}
