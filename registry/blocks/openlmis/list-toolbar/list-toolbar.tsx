import type { ReactNode } from "react"

// Controls above a list: one row with room, else search on its own row; sized by its own width.

type ListToolbarProps = {
  children: ReactNode
}

export function ListToolbar({ children }: ListToolbarProps) {
  return (
    <div className="@container/toolbar w-full">
      <div className="flex flex-wrap items-center gap-2">{children}</div>
    </div>
  )
}

export function ListToolbarSearch({ children }: ListToolbarProps) {
  return <div className="w-full @2xl/toolbar:w-72">{children}</div>
}

/** A filter beside the search; it takes the spare width while the toolbar is narrow. */
export function ListToolbarFilter({ children }: ListToolbarProps) {
  return (
    <div className="min-w-0 flex-1 @2xl/toolbar:w-48 @2xl/toolbar:flex-none">
      {children}
    </div>
  )
}

/** Pushed to the far end: the View menu, then the create action, which always ends the toolbar. */
export function ListToolbarEnd({ children }: ListToolbarProps) {
  return (
    <div className="flex items-center gap-2 @2xl/toolbar:ms-auto">
      {children}
    </div>
  )
}
