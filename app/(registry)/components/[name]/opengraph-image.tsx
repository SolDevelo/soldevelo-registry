import { OG_CONTENT_TYPE, OG_SIZE } from "@/lib/og"

import {
  itemOgImage,
  itemStaticParams,
} from "../../_components/registry-item-page"

export const alt = "A SolDevelo Registry component"
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export function generateStaticParams() {
  return itemStaticParams("component")
}

export default async function Image({
  params,
}: {
  params: Promise<{ name: string }>
}) {
  const { name } = await params
  return itemOgImage("component", name)
}
