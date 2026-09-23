import { OG_CONTENT_TYPE, OG_SIZE, createOgImage } from "@/lib/og"

export const alt = "SolDevelo Registry projects"
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default function Image() {
  return createOgImage({
    title: "Projects",
    eyebrow: "Catalog",
    description:
      "The open-source projects this registry publishes React components for.",
    cta: "Browse Projects",
  })
}
