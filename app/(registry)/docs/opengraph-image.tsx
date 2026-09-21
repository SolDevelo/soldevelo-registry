import { OG_CONTENT_TYPE, OG_SIZE, createOgImage } from "@/lib/og"

export const alt = "SolDevelo Registry docs"
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default function Image() {
  return createOgImage({
    title: "Docs",
    eyebrow: "Getting started",
    description:
      "Registry setup, install commands, and where each item lands in your project.",
    cta: "Read The Docs",
  })
}
