import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

// Page layout. Parts take only `children`, which keeps padding and heading scale equal across pages.

type WorkspaceProps = {
  children: ReactNode
}

type WorkspaceWidthProps = WorkspaceProps & {
  /** `narrow` for a page of settings, which reads better as one short column. */
  width?: "default" | "narrow"
}

const MAX_WIDTH = { default: "max-w-6xl", narrow: "max-w-4xl" } as const

export function Workspace({
  children,
  width = "default",
}: WorkspaceWidthProps) {
  return (
    <div
      className={cn(
        "@container/main mx-auto flex w-full flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6",
        MAX_WIDTH[width]
      )}
    >
      {children}
    </div>
  )
}

export function WorkspaceHeader({ children }: WorkspaceProps) {
  return (
    <div className="flex flex-col gap-3 @2xl/main:flex-row @2xl/main:items-start @2xl/main:justify-between">
      {children}
    </div>
  )
}

// With an icon, the text leaves room for it beside both lines; without one, it starts at the edge.
export function WorkspaceHeading({ children }: WorkspaceProps) {
  return (
    <div className="relative flex min-w-0 flex-col justify-center gap-1 has-data-[slot=workspace-icon]:min-h-10 has-data-[slot=workspace-icon]:ps-13">
      {children}
    </div>
  )
}

export function WorkspaceIcon({ children }: WorkspaceProps) {
  return (
    <div
      className="absolute inset-y-0 start-0 my-auto flex size-10 items-center justify-center rounded-lg border bg-card text-muted-foreground shadow-xs [&_svg]:size-5"
      data-slot="workspace-icon"
    >
      {children}
    </div>
  )
}

export function WorkspaceTitle({ children }: WorkspaceProps) {
  return (
    <h1 className="text-xl leading-none font-semibold tracking-tight">
      {children}
    </h1>
  )
}

export function WorkspaceDescription({ children }: WorkspaceProps) {
  // One line at most, so every header keeps the same height; longer text is cut with an ellipsis.
  return (
    <p className="min-w-0 truncate text-sm text-muted-foreground">{children}</p>
  )
}

// Under a stacked header the actions share the full width; beside it they take their own.
export function WorkspaceActions({ children }: WorkspaceProps) {
  return (
    <div className="flex w-full shrink-0 flex-wrap items-center gap-2 *:flex-1 @2xl/main:w-auto @2xl/main:*:flex-none">
      {children}
    </div>
  )
}

export function WorkspaceContent({ children }: WorkspaceProps) {
  return <div className="flex flex-1 flex-col gap-4 lg:gap-6">{children}</div>
}

/** Rendered after `Workspace`: full width, stuck to the bottom, its buttons in line with the page. */
export function WorkspaceFooter({
  children,
  width = "default",
}: WorkspaceWidthProps) {
  return (
    <div
      className="sticky bottom-0 z-10 border-t bg-muted/80 backdrop-blur-sm"
      data-slot="workspace-footer"
    >
      <div
        className={cn(
          "mx-auto flex w-full items-center justify-between gap-2 px-4 py-3 lg:px-6",
          MAX_WIDTH[width]
        )}
      >
        {children}
      </div>
    </div>
  )
}
