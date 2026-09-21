import { OG_CONTENT_TYPE, OG_SIZE, createOgImage } from "@/lib/og"

export const alt = "SolDevelo Registry changelog"
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default function Image() {
  return createOgImage({
    title: "Changelog",
    eyebrow: "Releases",
    description:
      "Every change to the registry, release by release, in plain language.",
    cta: "Read The Changelog",
  })
}
