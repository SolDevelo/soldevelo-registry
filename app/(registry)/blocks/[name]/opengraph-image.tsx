import { OG_CONTENT_TYPE, OG_SIZE } from "@/lib/og"

import {
  itemOgImage,
  itemStaticParams,
} from "../../_components/registry-item-page"

export const alt = "A SolDevelo Registry block"
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export function generateStaticParams() {
  return itemStaticParams("block")
}

export default async function Image({
  params,
}: {
  params: Promise<{ name: string }>
}) {
  const { name } = await params
  return itemOgImage("block", name)
}
