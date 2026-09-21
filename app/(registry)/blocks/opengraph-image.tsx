import { OG_CONTENT_TYPE, OG_SIZE, createOgImage } from "@/lib/og"

export const alt = "SolDevelo Registry blocks"
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default function Image() {
  return createOgImage({
    title: "Blocks",
    eyebrow: "Catalog",
    description:
      "Whole screen regions, previewed live and installed with one command.",
    cta: "Browse Blocks",
  })
}
