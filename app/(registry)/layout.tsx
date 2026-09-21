import type { PropsWithChildren } from "react"

import { SiteFooter } from "@/components/site-footer"
import { resolveProjects } from "@/config/projects"
import { SiteHeader } from "@/components/site-header"
import { getProjects, getSearchIndex } from "@/lib/registry-data"

export default function RegistryLayout({ children }: PropsWithChildren) {
  return (
    <>
      <SiteHeader entries={getSearchIndex()} />
      <div className="mx-auto w-full max-w-5xl px-4 pb-24">{children}</div>
      <SiteFooter projects={resolveProjects(getProjects())} />
    </>
  )
}
