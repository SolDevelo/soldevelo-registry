import { readFile } from "node:fs/promises"
import { join } from "node:path"

export type ChangelogSection = { title: string; entries: string[] }

export type ChangelogRelease = {
  version: string
  date: string
  summary: string
  sections: ChangelogSection[]
}

// CHANGELOG.md is the source of truth, so the page cannot drift from the file
// reviewers read. Parsed rather than duplicated as data.
const RELEASE_HEADING = /^##\s+\[([^\]]+)\]\s*-\s*(\S+)\s*$/
const SECTION_HEADING = /^###\s+(.+?)\s*$/

export async function getReleases(): Promise<ChangelogRelease[]> {
  const source = await readFile(join(process.cwd(), "CHANGELOG.md"), "utf8")
  const releases: ChangelogRelease[] = []

  let release: ChangelogRelease | null = null
  let section: ChangelogSection | null = null

  for (const line of source.split("\n")) {
    const releaseMatch = RELEASE_HEADING.exec(line)
    if (releaseMatch) {
      release = {
        version: releaseMatch[1],
        date: releaseMatch[2],
        summary: "",
        sections: [],
      }
      section = null
      releases.push(release)
      continue
    }

    if (!release) continue

    const sectionMatch = SECTION_HEADING.exec(line)
    if (sectionMatch) {
      section = { title: sectionMatch[1], entries: [] }
      release.sections.push(section)
      continue
    }

    if (line.startsWith("- ")) {
      section?.entries.push(line.slice(2).trim())
      continue
    }

    // A bullet wrapped onto the next line, or the prose under a release heading.
    const text = line.trim()
    if (text.length === 0) continue

    if (section) {
      const last = section.entries.at(-1)
      if (last !== undefined) {
        section.entries[section.entries.length - 1] = `${last} ${text}`
      }
      continue
    }

    release.summary = release.summary ? `${release.summary} ${text}` : text
  }

  return releases
}

export function formatReleaseDate(date: string): string {
  const parsed = new Date(`${date}T00:00:00Z`)
  if (Number.isNaN(parsed.getTime())) return date

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(parsed)
}
