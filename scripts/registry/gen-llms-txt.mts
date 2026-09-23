// Writes public/llms.txt from live registry data, so the counts and item names cannot rot the way
// a hand-maintained file does.
//
//   pnpm exec tsx ./scripts/registry/gen-llms-txt.mts
import { writeFile } from "node:fs/promises"

const { siteConfig, registryAddress } = await import("@/config/site")
const { KIND_LABEL, KIND_PLURAL, REGISTRY_KINDS, kindOf } =
  await import("@/lib/registry-kinds")
const { registry } = await import("@/registry/index")
const { PROJECTS } = await import("@/config/projects")
const { projectOf } = await import("@/lib/registry-source")

const url = siteConfig.URL
const items = registry.items
const counts = Object.fromEntries(
  REGISTRY_KINDS.map((kind) => [
    kind,
    items.filter((item) => kindOf(item) === kind).length,
  ])
) as Record<(typeof REGISTRY_KINDS)[number], number>

const firstItem = items[0]?.name ?? "openlmis-stock-summary"
const projectIds = [...new Set(items.map(projectOf))]

const plural = (count: number, word: string) =>
  `${count} ${count === 1 ? word : `${word}s`}`

const lines: string[] = []
const p = (line = "") => lines.push(line)

p(`# ${siteConfig.NAME}`)
p()
p(`> ${siteConfig.SHORT_DESCRIPTION}`)
p()
p(
  `${siteConfig.NAME} publishes ${plural(items.length, "installable item")} across ${plural(projectIds.length, "open-source project")} (${projectIds.map((id) => PROJECTS[id]?.name ?? id).join(", ")}): ${plural(counts.component, "component")}, ${plural(counts.block, "block")}, and ${plural(counts.template, "page template")}. Everything is open source and maintained by ${siteConfig.AUTHORS[0].NAME} at ${siteConfig.REPO}.`
)
p()
p(
  "Items are consumed with the shadcn CLI, which copies the source into the consumer's repository. There is no wrapper package and no runtime dependency on this site."
)
p()
p("## Pages")
p()
p(`- [Home](${url}/): What the registry contains and how to wire it up.`)
for (const kind of REGISTRY_KINDS) {
  p(
    `- [${KIND_LABEL[kind]}s](${url}/${KIND_PLURAL[kind]}): ${plural(counts[kind], kind)}, with live previews and full source.`
  )
}
p(
  `- [Docs](${url}/docs): Registry setup, install commands, where each kind lands, and the theme tokens items ship with.`
)
p(
  `- [Changelog](${url}/changelog): What changed in each release, generated from CHANGELOG.md.`
)
p()
p("## Item names")
p()
p(
  "Every item is prefixed with the project it belongs to, so two projects cannot collide. Each item also declares `meta.project`, which the build checks against the name."
)
for (const id of projectIds) {
  p(
    `- ${PROJECTS[id]?.name ?? id}: \`${id}-{item}\`, from ${PROJECTS[id]?.url ?? ""}.`
  )
}
p()
p("## URLs")
p()
p(
  `- Item pages: \`${url}/{components|blocks|templates}/{item-name}\`, with the preview, install command, files and dependencies.`
)
p(`- Standalone previews: \`${url}/preview/{item-name}\`.`)
p(`- Registry item JSON: \`${url}/r/{item-name}.json\`.`)
p(`- Registry index: \`${url}/r/registry.json\`.`)
p()
p("## Installation")
p()
p(
  `Register the namespace once in \`components.json\`, then install any item by name:`
)
p()
p("```json")
p(
  JSON.stringify(
    { registries: { [`@${siteConfig.SLUG}`]: `${url}/r/{name}.json` } },
    null,
    2
  )
)
p("```")
p()
p("```sh")
p(`pnpm dlx shadcn@latest add ${registryAddress(firstItem)}`)
p(`npx shadcn@latest add ${registryAddress(firstItem)}`)
p("```")
p()
p("## Catalog")
p()
for (const item of items) {
  p(
    `- [${item.title}](${url}/${KIND_PLURAL[kindOf(item)]}/${item.name}) \`${registryAddress(item.name)}\` (${KIND_LABEL[kindOf(item)].toLowerCase()}): ${item.description}`
  )
}
p()
p("## Technology")
p()
p(
  "React 19, Tailwind CSS v4, shadcn/ui on Base UI primitives, and TypeScript. Items target a `base-*` style in components.json (the `shadcn init` default); legacy `new-york`/`radix-*` styles install Radix primitives, which reject the `render` prop some items use."
)
p()

await writeFile("public/llms.txt", lines.join("\n"))
console.log(`public/llms.txt: ${items.length} items described`)
