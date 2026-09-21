import { OG_CONTENT_TYPE, OG_SIZE, createOgImage } from "@/lib/og"

export const alt = "SolDevelo Registry page templates"
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default function Image() {
  return createOgImage({
    title: "Templates",
    eyebrow: "Catalog",
    description: "Complete pages you can install in one command.",
    cta: "Browse Templates",
  })
}
