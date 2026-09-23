import { Hero } from "@/components/hero"
import { RegistryBento } from "@/components/registry-bento"
import { RegistryCta } from "@/components/registry-cta"
import { RegistryFaqs } from "@/components/registry-faqs"
import { RegistryKinds } from "@/components/registry-kinds"
import { SiteFooter } from "@/components/site-footer"
import { stripInlineCode } from "@/components/mono"
import { JsonLd, faqPageSchema } from "@/components/structured-data"
import { FAQS } from "@/config/faqs"
import { resolveProjects } from "@/config/projects"
import { SiteHeader } from "@/components/site-header"
import { REGISTRY_KINDS } from "@/lib/registry-kinds"
import {
  getAllEntries,
  getCounts,
  getEntriesByKind,
  getProjects,
  getSearchIndex,
} from "@/lib/registry-data"

// The growth chart labels months from the render date, so regenerate daily rather than
// waiting for the next deploy.
export const revalidate = 86400

export default function HomePage() {
  const counts = getCounts()
  const entries = getAllEntries()
  const growth = projectGrowth(entries.length)
  // Derived, so the install example cannot name an item that has been renamed away.
  const example = getEntriesByKind("block")[0]?.name ?? "openlmis-workspace"

  return (
    // One plain top-level node, deliberately: on a route change Next calls
    // scrollIntoView on each of them, and resolving that against the sticky
    // header lands the new page below the top of the document.
    <div>
      <SiteHeader entries={getSearchIndex()} />

      <Hero />

      <main className="mx-auto flex w-full max-w-5xl flex-col gap-28 px-4 pt-24 pb-28 sm:gap-36 sm:pt-32">
        {/* Nested, not a sibling of the sections: on a route change Next calls
            scrollIntoView on each top-level node, and a bare script tag has no
            layout box, which leaves the new page parked below the fold. */}
        <JsonLd
          data={faqPageSchema(
            FAQS.map((faq) => ({
              question: faq.question,
              answer: stripInlineCode(faq.answer),
            }))
          )}
        />

        <RegistryKinds counts={counts} />

        <RegistryBento
          counts={counts}
          totalItems={entries.length}
          items={catalogSample().map((entry) => ({
            name: entry.name,
            kind: entry.kind,
            project: entry.project,
            title: entry.title,
          }))}
          growth={growth}
        />

        <RegistryFaqs />

        <RegistryCta exampleItem={example} />
      </main>

      <SiteFooter projects={resolveProjects(getProjects())} />
    </div>
  )
}

// The bento card fits about eight rows; the Total Items line below it carries the full count.
const CATALOG_SAMPLE_SIZE = 8

// Taken a kind at a time, so blocks and templates show even when components outnumber them.
function catalogSample() {
  const byKind = REGISTRY_KINDS.map((kind) => getEntriesByKind(kind))
  const longest = Math.max(...byKind.map((list) => list.length))
  return Array.from({ length: longest }, (_, index) =>
    byKind.flatMap((list) => list[index] ?? [])
  )
    .flat()
    .slice(0, CATALOG_SAMPLE_SIZE)
}

// Illustrative target: 100 items by a fixed month, approached on an ease-in curve so the
// early months stay modest. The page labels the dashed line as a projection.
const PROJECTED_TARGET = 100
const PROJECTED_TARGET_MONTH = new Date(2027, 0, 1)
const PROJECTED_CURVE = 1.6
// Once the target month has passed, keep a short horizon rather than an empty chart.
const MIN_PROJECTED_MONTHS = 3

// The only real point is today's count. Everything after it is a projection, drawn dashed
// and named as such, rather than a history the registry never had.
function projectGrowth(totalItems: number) {
  const now = new Date()
  const monthsToTarget =
    (PROJECTED_TARGET_MONTH.getFullYear() - now.getFullYear()) * 12 +
    (PROJECTED_TARGET_MONTH.getMonth() - now.getMonth())
  const months = Math.max(MIN_PROJECTED_MONTHS, monthsToTarget)
  const target = Math.max(PROJECTED_TARGET, totalItems)

  return Array.from({ length: months + 1 }, (_, offset) => {
    const date = new Date(now.getFullYear(), now.getMonth() + offset, 1)
    const progress = (offset / months) ** PROJECTED_CURVE
    return {
      month: date.toLocaleString("en-US", { month: "short" }),
      actual: offset === 0 ? totalItems : null,
      projected: Math.round(totalItems + (target - totalItems) * progress),
    }
  })
}
