import path from "node:path"

export type ItemFileRef = {
  // Source path relative to the repo root, e.g. `registry/blocks/stock/1/stock-block.tsx`.
  path: string
  // Install path relative to the consumer's project root.
  target: string
}

// A file that belongs to another registry item, which an item may import by declaring it.
export type SharedFileRef = ItemFileRef & { item: string }

const IMPORT_SPECIFIER = /(from\s*|import\s*\(\s*)(["'])([^"']+)\2/g

const EXTENSIONS = ["", ".tsx", ".ts", "/index.tsx", "/index.ts"]

function matchFile<T extends ItemFileRef>(candidate: string, files: T[]) {
  return files.find((file) =>
    EXTENSIONS.some((extension) => file.path === `${candidate}${extension}`)
  )
}

function aliasFor(file: ItemFileRef): string {
  return `@/${file.target.replace(/\.(tsx|ts)$/, "")}`
}

// Rewrites imports of the item's own files, and of other items' files, to the paths they install to.
export function rewriteItemImports(
  source: string,
  filePath: string,
  files: ItemFileRef[],
  shared: SharedFileRef[] = [],
  onShared?: (item: string) => void
): string {
  const dir = path.dirname(filePath)

  return source.replace(
    IMPORT_SPECIFIER,
    (match, prefix: string, quote: string, specifier: string) => {
      const isRelative = specifier.startsWith(".")
      const candidate = isRelative
        ? path.posix.normalize(path.posix.join(dir, specifier))
        : specifier.startsWith("@/registry/")
          ? specifier.slice(2)
          : null

      if (!candidate) return match

      const own = matchFile(candidate, files)
      if (own) return `${prefix}${quote}${aliasFor(own)}${quote}`

      // Another item is reached through the `@/registry/` alias, never a relative path.
      const other = isRelative ? undefined : matchFile(candidate, shared)
      if (other) {
        onShared?.(other.item)
        return `${prefix}${quote}${aliasFor(other)}${quote}`
      }

      throw new Error(
        `Unresolved import "${specifier}" in ${filePath}. ` +
          `A registry item may import its own files, another item's files through ` +
          `"@/registry/...", or an external package.`
      )
    }
  )
}
