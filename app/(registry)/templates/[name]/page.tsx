import {
  RegistryItemPage,
  itemMetadata,
  itemStaticParams,
} from "../../_components/registry-item-page"

export const dynamicParams = false

export function generateStaticParams() {
  return itemStaticParams("template")
}

export async function generateMetadata({
  params,
}: PageProps<"/templates/[name]">) {
  const { name } = await params
  return itemMetadata("template", name)
}

export default async function TemplatePage({
  params,
}: PageProps<"/templates/[name]">) {
  const { name } = await params
  return <RegistryItemPage kind="template" name={name} />
}
