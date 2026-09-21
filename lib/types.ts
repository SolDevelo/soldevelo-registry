import type { BundledLanguage } from "shiki/bundle/web"

import type { RegistryKind } from "@/lib/registry-kinds"

export type RegistryFileType = "page" | "component" | "ui" | "hook" | "lib"

export type RegistryFile = {
  type: RegistryFileType
  name: string
  code: string
  lang: BundledLanguage
  // Where `shadcn add` writes this file, or null for the preview-only entry point.
  target: string | null
}

export type RegistryEntry = {
  kind: RegistryKind
  // The installable item name, scoped by project: `openlmis/stock-summary`.
  name: string
  // The project id from `name`, resolved against config/projects.ts.
  project: string
  title: string
  description: string
  files: RegistryFile[]
  // Iframe height for the catalog preview, e.g. `"640px"`.
  height: string
  registryDependencies: string[]
  dependencies: string[]
}

export type RendererMode = "preview" | "code"
