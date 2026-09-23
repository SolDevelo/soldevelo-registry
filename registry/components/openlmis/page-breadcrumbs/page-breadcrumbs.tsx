import { Fragment, type ReactElement } from "react"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export type BreadcrumbTrailItem = {
  label: string
  /** Leave out for a step with no page of its own, such as a menu section. */
  href?: string
}

type PageBreadcrumbsProps = {
  /** Outermost first; the last item is the current page. */
  items: BreadcrumbTrailItem[]
  /** Renders a link for a step, e.g. a router's Link; a plain anchor by default. */
  renderLink?: (item: BreadcrumbTrailItem & { href: string }) => ReactElement
  label?: string
}

export function PageBreadcrumbs({
  items,
  renderLink,
  label = "Breadcrumb",
}: PageBreadcrumbsProps) {
  if (items.length === 0) return null

  return (
    <Breadcrumb aria-label={label}>
      <BreadcrumbList>
        {items.map((item, index) => {
          const isCurrent = index === items.length - 1
          const href = item.href

          return (
            <Fragment key={item.href ?? item.label}>
              {index > 0 && <BreadcrumbSeparator />}
              <BreadcrumbItem>
                {isCurrent ? (
                  <BreadcrumbPage>{item.label}</BreadcrumbPage>
                ) : href ? (
                  <BreadcrumbLink
                    href={href}
                    render={renderLink?.({ ...item, href })}
                  >
                    {item.label}
                  </BreadcrumbLink>
                ) : (
                  <span>{item.label}</span>
                )}
              </BreadcrumbItem>
            </Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
