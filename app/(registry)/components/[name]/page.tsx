import {
  RegistryItemPage,
  itemMetadata,
  itemStaticParams,
} from "../../_components/registry-item-page"

export const dynamicParams = false

export function generateStaticParams() {
  return itemStaticParams("component")
}

export async function generateMetadata({
  params,
}: PageProps<"/components/[name]">) {
  const { name } = await params
  return itemMetadata("component", name)
}

export default async function ComponentPage({
  params,
}: PageProps<"/components/[name]">) {
  const { name } = await params
  return <RegistryItemPage kind="component" name={name} />
}
