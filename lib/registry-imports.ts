import path from "node:path"

export type ItemFileRef = {
  // Source path relative to the repo root, e.g. `registry/blocks/stock/1/stock-block.tsx`.
  path: string
  // Install path relative to the consumer's project root.
  target: string
}

const IMPORT_SPECIFIER = /(from\s*|import\s*\(\s*)(["'])([^"']+)\2/g

const EXTENSIONS = ["", ".tsx", ".ts", "/index.tsx", "/index.ts"]

function matchFile(candidate: string, files: ItemFileRef[]) {
  return files.find((file) =>
    EXTENSIONS.some((extension) => file.path === `${candidate}${extension}`)
  )
}

function aliasFor(file: ItemFileRef): string {
  return `@/${file.target.replace(/\.(tsx|ts)$/, "")}`
}

// Rewrites an item's imports of its own files to the paths they install to; leaves everything else alone.
export function rewriteItemImports(
  source: string,
  filePath: string,
  files: ItemFileRef[]
): string {
  const dir = path.dirname(filePath)

  return source.replace(
    IMPORT_SPECIFIER,
    (match, prefix: string, quote: string, specifier: string) => {
      const candidate = specifier.startsWith(".")
        ? path.posix.normalize(path.posix.join(dir, specifier))
        : specifier.startsWith("@/registry/")
          ? specifier.slice(2)
          : null

      if (!candidate) return match

      const file = matchFile(candidate, files)
      if (!file) {
        throw new Error(
          `Unresolved import "${specifier}" in ${filePath}. ` +
            `A registry item may only import its own files or an external package.`
        )
      }

      return `${prefix}${quote}${aliasFor(file)}${quote}`
    }
  )
}
