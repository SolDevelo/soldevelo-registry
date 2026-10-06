"use client"

import type { ReactNode } from "react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

type WorkspaceTabsProps = {
  value: string
  onValueChange: (value: string) => void
  children: ReactNode
}

/** Tabs that split one page, e.g. a product's General, Programs and Facility Types. */
export function WorkspaceTabs({
  value,
  onValueChange,
  children,
}: WorkspaceTabsProps) {
  return (
    <Tabs
      className="gap-4"
      onValueChange={(next) => onValueChange(String(next))}
      value={value}
    >
      {children}
    </Tabs>
  )
}

type WorkspaceTabsListProps = {
  /** Names the tab list for screen readers, e.g. "Product Sections". */
  label: string
  /** Narrow: one tab per row, or two by two with `grid`; then a single row once there is room. */
  wrap?: "column" | "grid"
  children: ReactNode
}

export function WorkspaceTabsList({
  label,
  wrap = "column",
  children,
}: WorkspaceTabsListProps) {
  return (
    // Its own container, so the tabs wrap by the room the page gives them, not the window.
    <div className="@container">
      <TabsList
        aria-label={label}
        className={cn(
          "grid w-full group-data-horizontal/tabs:h-auto @lg:inline-flex @lg:w-fit @lg:group-data-horizontal/tabs:h-8",
          wrap === "grid" ? "grid-cols-2" : "grid-cols-1"
        )}
      >
        {children}
      </TabsList>
    </div>
  )
}

export function WorkspaceTabsTrigger({
  value,
  children,
}: {
  value: string
  children: ReactNode
}) {
  return <TabsTrigger value={value}>{children}</TabsTrigger>
}

export function WorkspaceTabsContent({
  value,
  children,
}: {
  value: string
  children: ReactNode
}) {
  return <TabsContent value={value}>{children}</TabsContent>
}
