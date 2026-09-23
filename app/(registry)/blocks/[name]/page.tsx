import {
  RegistryItemPage,
  itemMetadata,
  itemStaticParams,
} from "../../_components/registry-item-page"

export const dynamicParams = false

export function generateStaticParams() {
  return itemStaticParams("block")
}

export async function generateMetadata({
  params,
}: PageProps<"/blocks/[name]">) {
  const { name } = await params
  return itemMetadata("block", name)
}

export default async function BlockPage({
  params,
}: PageProps<"/blocks/[name]">) {
  const { name } = await params
  return <RegistryItemPage kind="block" name={name} />
}
