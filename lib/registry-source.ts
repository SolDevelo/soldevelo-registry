import path from "node:path"

import { loadCode } from "@/lib/code"
import { registry } from "@/registry/index"
import { absolutizeAssets } from "@/lib/registry-assets"
import { rewriteItemImports, type SharedFileRef } from "@/lib/registry-imports"
import { installTarget } from "@/lib/registry-targets"
import { KIND_PLURAL, kindOf, type RegistryKind } from "@/lib/registry-kinds"
import { getProject, itemSlug } from "@/config/projects"
import { registryAddress } from "@/config/site"

// Item file paths are relative to `registry/` unless they use the `@/` alias.
export function resolveFilePath(filePath: string): string {
  return filePath.startsWith("@/")
    ? filePath.replace("@/", "")
    : `registry/${filePath}`
}

export function getLang(fileName: string): string {
  return path.extname(fileName).slice(1) || "tsx"
}

// The preview entry point. Source groups by project, so the flat name is split back apart.
export function previewPath(
  kind: RegistryKind,
  name: string,
  project: string
): string {
  return `registry/${KIND_PLURAL[kind]}/${project}/${itemSlug(name, project)}/page.tsx`
}

// `meta.project` is the source of truth; the name prefix has to agree with it.
export function projectOf(item: { name: string; meta?: unknown }): string {
  const project = (item.meta as { project?: string } | undefined)?.project

  if (!project) {
    throw new Error(`${item.name}: meta.project is required.`)
  }
  if (!getProject(project)) {
    throw new Error(
      `${item.name}: unknown project "${project}". Add it to config/projects.ts.`
    )
  }
  if (!item.name.startsWith(`${project}-`)) {
    throw new Error(
      `${item.name}: name must start with "${project}-" to match meta.project.`
    )
  }

  return project
}

// The CLI writes a registry:page only for some frameworks, so the screen must live in a component.
async function assertTemplateRendersComponent(
  name: string,
  files: { path: string; type: string }[]
) {
  const page = files.find((file) => file.type === "registry:page")
  const source = page ? await loadCode(page.path) : ""
  if (!/from\s+["']\.\/components\//.test(source)) {
    throw new Error(
      `${name}: its registry:page must only render a component imported from ./components/, ` +
        `or a Vite consumer installs the template without its screen.`
    )
  }
}

// One derivation of every item's targets and shipped source, shared by the build and the finalize step.
export async function prepareItems() {
  const laidOut = registry.items.map((item) => {
    const kind = kindOf(item)
    const project = projectOf(item)
    const declared = item.files ?? []

    const files = declared.map((file) => ({
      ...file,
      path: resolveFilePath(file.path),
      target:
        file.target ??
        installTarget(kind, item.name, project, file.path, declared.length),
    }))

    return { item, kind, project, files }
  })

  // Every item's files, so one item can build on another.
  const shared: SharedFileRef[] = laidOut.flatMap(({ item, files }) =>
    files.map((file) => ({
      path: file.path,
      target: file.target,
      item: item.name,
    }))
  )

  return Promise.all(
    laidOut.map(async ({ item, kind, project, files }) => {
      const imported = new Set<string>()
      const ship = async (filePath: string) =>
        absolutizeAssets(
          rewriteItemImports(
            await loadCode(filePath),
            filePath,
            files,
            shared,
            (name) => imported.add(name)
          )
        )

      const withSource = await Promise.all(
        files.map(async (file) => ({ ...file, content: await ship(file.path) }))
      )
      if (kind === "template")
        await assertTemplateRendersComponent(item.name, files)
      // The preview is shown as how to mount the item, so what it imports installs with it too.
      const previewCode = await ship(previewPath(kind, item.name, project))

      // Derived from the imports, like cssVars, so the published dependencies cannot drift.
      const registryDependencies = [
        ...new Set([
          ...(item.registryDependencies ?? []),
          ...[...imported].toSorted().map(registryAddress),
        ]),
      ]

      return {
        item: { ...item, registryDependencies },
        kind,
        project,
        files: withSource,
        previewCode,
      }
    })
  )
}

export type PreparedItem = Awaited<ReturnType<typeof prepareItems>>[number]
