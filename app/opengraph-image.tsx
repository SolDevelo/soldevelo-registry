import { siteConfig } from "@/config/site"
import { OG_CONTENT_TYPE, OG_SIZE, createOgImage } from "@/lib/og"

export const alt = `${siteConfig.NAME}: ${siteConfig.SHORT_DESCRIPTION}`
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default function Image() {
  return createOgImage({
    title: "UI for open source, ready to install",
    description:
      "Components, blocks and page templates for the projects SolDevelo builds.",
    cta: "Browse The Registry",
  })
}
