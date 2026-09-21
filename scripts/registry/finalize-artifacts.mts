// `shadcn build` inlines each file's content straight from disk, so it cannot be hooked the way
// config/*.ts can. This runs after it and replaces that content with the shipped form (imports
// rewritten to install targets, asset paths absolutized), then asserts nothing was missed.
//
//   pnpm exec tsx ./scripts/registry/finalize-artifacts.mts
import { readdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"

const { prepareItems } = await import("@/lib/registry-source")
const { findInterpolatedAssets, findRelativeAssets } =
  await import("@/lib/registry-assets")

const DIR = path.join(process.cwd(), "public/r")

const shipped = new Map<string, Map<string, string>>()
for (const prepared of await prepareItems()) {
  shipped.set(
    prepared.item.name,
    new Map(prepared.files.map((file) => [file.path, file.content]))
  )
}

const files = (await readdir(DIR)).filter((file) => file.endsWith(".json"))
let rewritten = 0

for (const file of files) {
  const full = path.join(DIR, file)
  const json = JSON.parse(await readFile(full, "utf8")) as {
    name?: string
    files?: { path?: string; content?: string }[]
  }

  const byPath = json.name ? shipped.get(json.name) : undefined
  if (!byPath || !Array.isArray(json.files)) continue

  for (const entry of json.files) {
    if (!entry.path) continue
    const content = byPath.get(entry.path)
    if (content === undefined) {
      throw new Error(`${file}: no prepared source for ${entry.path}`)
    }
    if (entry.content !== content) {
      entry.content = content
      rewritten += 1
    }

    const relative = findRelativeAssets(content)
    if (relative.length) {
      throw new Error(
        `${json.name}:${entry.path} ships root-relative assets that will 404 ` +
          `in a consumer project: ${relative.join(", ")}`
      )
    }
    const interpolated = findInterpolatedAssets(content)
    if (interpolated.length) {
      throw new Error(
        `${json.name}:${entry.path} builds an asset path by interpolation ` +
          `(${interpolated.join(", ")}). Write it as a literal so it can be absolutized.`
      )
    }
  }

  await writeFile(full, `${JSON.stringify(json, null, 2)}\n`)
}

console.log(
  `public/r: ${files.length} artifacts finalized, ${rewritten} file(s) rewritten`
)
