import { OG_CONTENT_TYPE, OG_SIZE, createOgImage } from "@/lib/og"

export const alt = "SolDevelo Registry components"
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default function Image() {
  return createOgImage({
    title: "Components",
    eyebrow: "Catalog",
    description:
      "Primitives that render a domain value consistently everywhere it appears.",
    cta: "Browse Components",
  })
}
