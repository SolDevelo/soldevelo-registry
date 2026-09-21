export type RegistryContractItem = {
  name: string
  registryDependencies?: string[]
  files?: { path: string; content?: string; target?: string }[]
}

type RegistryInvariantOptions = {
  requireContent?: boolean
}

const VALID_ITEM_NAME = /^[a-z0-9]+(?:-[a-z0-9]+)+$/

// Everything `shadcn build` will happily emit but that only fails later, in someone else's project.
export function assertRegistryInvariants(
  items: RegistryContractItem[],
  { requireContent = false }: RegistryInvariantOptions = {}
): void {
  const names = new Set<string>()

  for (const item of items) {
    if (!VALID_ITEM_NAME.test(item.name)) {
      throw new Error(
        `Invalid registry item name: "${item.name}". ` +
          `Use "{project}-{item}", lowercase kebab-case.`
      )
    }
    if (names.has(item.name)) {
      throw new Error(`Duplicate registry item name: ${item.name}`)
    }
    names.add(item.name)

    const paths = new Set<string>()
    const targets = new Set<string>()

    for (const file of item.files ?? []) {
      if (!file.path || paths.has(file.path)) {
        throw new Error(
          `Duplicate or empty file path: ${item.name}:${file.path}`
        )
      }
      paths.add(file.path)

      // Two files on one target means the second silently replaces the first.
      if (file.target) {
        if (targets.has(file.target)) {
          throw new Error(
            `Duplicate install target in ${item.name}: ${file.target}`
          )
        }
        targets.add(file.target)
      }

      if (
        requireContent &&
        (!file.content?.trim() || file.content.includes("// Code Not Found"))
      ) {
        throw new Error(
          `Missing registry source: ${item.name}:${file.path}. ` +
            `Check the path in registry/registry-items.ts.`
        )
      }
    }
  }

  // Catch a typo here rather than at `shadcn add` time in a consumer's project.
  for (const item of items) {
    for (const dependency of item.registryDependencies ?? []) {
      const match = dependency.match(/^@soldevelo\/(.+)$/)
      if (!match) continue
      if (!match[1] || !names.has(match[1])) {
        throw new Error(
          `Unresolved registry dependency: ${item.name} -> ${dependency}`
        )
      }
    }
  }
}
