"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export type TocItem = { id: string; label: string }

export function DocsToc({
  items,
  className,
}: {
  items: TocItem[]
  className?: string
}) {
  const [activeId, setActiveId] = React.useState(items[0]?.id ?? "")

  React.useEffect(() => {
    const headings = items
      .map((item) => document.getElementById(item.id))
      .filter((element) => element !== null)

    // The top band only: a heading counts as current once it reaches the header,
    // which is what the reader perceives as "the section I am in".
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting)
        if (visible.length > 0) setActiveId(visible[0].target.id)
      },
      { rootMargin: "-88px 0px -70% 0px", threshold: 0 }
    )

    for (const heading of headings) observer.observe(heading)
    return () => observer.disconnect()
  }, [items])

  return (
    <nav aria-label="On this page" className={className}>
      <p className="font-heading text-xs font-medium tracking-label text-muted-foreground uppercase">
        On This Page
      </p>
      <ul className="mt-3 flex flex-col gap-0.5 border-l">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              aria-current={activeId === item.id ? "location" : undefined}
              className={cn(
                "-ml-px block border-l py-1 pl-3 text-sm transition-colors",
                activeId === item.id
                  ? "border-foreground font-medium text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
