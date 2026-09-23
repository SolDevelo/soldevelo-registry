import { ChartLineIcon, ChevronRightIcon } from "lucide-react"

import { SectionEyebrow } from "@/components/section-eyebrow"
import { Button } from "@/components/ui/button"
import { siteConfig } from "@/config/site"

function plural(count: number, noun: string): string {
  return `${count} ${noun}${count === 1 ? "" : "s"}`
}

// Asks the maintainers of other open-source projects to get in touch; the counts come from the registry.
export function ProjectCta({
  itemCount,
  projectCount,
}: {
  itemCount: number
  projectCount: number
}) {
  return (
    <section
      aria-labelledby="project-cta-heading"
      className="mx-auto flex max-w-xl flex-col items-center gap-4 pt-12 text-center sm:pt-16"
    >
      <SectionEyebrow
        mark={<ChartLineIcon className="size-4" aria-hidden="true" />}
        lead={`${plural(itemCount, "Item")} From`}
        emphasis={plural(projectCount, "Open Source Project")}
      />
      <h2
        id="project-cta-heading"
        className="font-heading text-3xl font-medium tracking-tighter text-balance sm:text-4xl"
      >
        Building An{" "}
        <span className="pe-1 font-light whitespace-nowrap italic">
          Open Source
        </span>{" "}
        Project?
      </h2>
      <p className="text-pretty text-muted-foreground">
        SolDevelo builds interfaces like these for open-source projects in
        health and public-sector software. Tell us what you are working on.
      </p>
      <div className="mt-4">
        <Button
          size="xl"
          nativeButton={false}
          render={
            <a
              href={siteConfig.CONTACT_URL}
              aria-label="Work With SolDevelo"
              target="_blank"
              rel="noopener noreferrer"
            />
          }
        >
          Work With SolDevelo
          <ChevronRightIcon data-icon="inline-end" aria-hidden="true" />
        </Button>
      </div>
    </section>
  )
}
