import { LogoMark } from "@/components/logo"
import { withInlineCode } from "@/components/mono"
import { JsonLd, breadcrumbSchema } from "@/components/structured-data"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { siteConfig } from "@/config/site"
import { formatReleaseDate, getReleases } from "@/lib/changelog"
import { createMetadata } from "@/lib/metadata"

const DESCRIPTION =
  "What changed in the registry, release by release: what was added, what was reworked, and what to check before you take a newer copy of an item."

export const metadata = createMetadata({
  title: "Changelog",
  description: DESCRIPTION,
  canonicalUrl: "changelog",
  keywords: ["registry changelog", "shadcn registry releases", "release notes"],
})

export default async function ChangelogPage() {
  const releases = await getReleases()

  return (
    <>
      <div className="pt-14 sm:pt-20">
        <JsonLd
          data={breadcrumbSchema([
            { name: "Home", url: siteConfig.URL },
            { name: "Changelog", url: `${siteConfig.URL}/changelog` },
          ])}
        />

        <header className="flex flex-col gap-3">
          <h1 className="flex items-center gap-3 font-heading text-3xl leading-tight font-semibold tracking-tighter text-balance sm:text-4xl">
            {/* Decorative: the heading text alone is what a screen reader should announce. */}
            <LogoMark className="size-8 shrink-0 sm:size-9" />
            Changelog
          </h1>
          <p className="max-w-3xl text-sm text-pretty text-muted-foreground">
            {DESCRIPTION}
          </p>
        </header>

        <Separator className="mt-6" />

        <div className="mt-10 flex flex-col gap-12">
          {releases.map((release) => (
            <article
              key={release.version}
              id={release.version}
              className="flex scroll-mt-28 flex-col gap-4 sm:flex-row sm:gap-10"
            >
              {/* The version rail keeps its own column on wide screens, so the
                  entries line up however long a release gets. */}
              <div className="flex items-center gap-3 sm:w-40 sm:shrink-0 sm:flex-col sm:items-start sm:gap-2">
                <Badge variant="secondary">{release.version}</Badge>
                <time
                  dateTime={release.date}
                  className="text-sm text-muted-foreground"
                >
                  {formatReleaseDate(release.date)}
                </time>
              </div>

              <div className="flex min-w-0 flex-1 flex-col gap-6">
                {release.summary ? (
                  <p className="text-sm leading-relaxed text-pretty text-muted-foreground">
                    {withInlineCode(release.summary)}
                  </p>
                ) : null}

                {release.sections.map((section) => (
                  <section key={section.title} className="flex flex-col gap-3">
                    <h2 className="font-heading text-sm font-medium tracking-label text-muted-foreground uppercase">
                      {section.title}
                    </h2>
                    <ul className="flex flex-col gap-2.5">
                      {section.entries.map((entry) => (
                        <li
                          key={entry}
                          className="flex gap-3 text-sm leading-relaxed text-pretty"
                        >
                          <span
                            aria-hidden="true"
                            className="mt-2 size-1.5 shrink-0 rounded-full bg-border"
                          />
                          <span>{withInlineCode(entry)}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </>
  )
}
