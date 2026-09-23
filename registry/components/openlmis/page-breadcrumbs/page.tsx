import { PageBreadcrumbs } from "./page-breadcrumbs"

export default function Page() {
  return (
    <div className="flex w-full justify-center p-8">
      <PageBreadcrumbs
        items={[
          { label: "Home", href: "#" },
          { label: "Administration" },
          { label: "Users" },
        ]}
      />
    </div>
  )
}
