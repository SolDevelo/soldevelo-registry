import { Children, type ReactNode } from "react"

import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import {
  DashboardCardError,
  formatCount,
} from "@/registry/components/openlmis/dashboard-card/dashboard-card"

/** As many columns as there are stats, so a user who sees fewer never gets an empty cell. */
const COLUMNS = [
  "grid-cols-1",
  "grid-cols-1",
  "grid-cols-2",
  "grid-cols-1 @2xl/stat-strip:grid-cols-3",
  "grid-cols-2 @4xl/stat-strip:grid-cols-4",
] as const

/** One panel of headline numbers split by hairlines; the gaps let the border colour show through. */
export function StatStrip({ children }: { children: ReactNode }) {
  const count = Math.min(Children.toArray(children).length, COLUMNS.length - 1)
  return (
    <div className="@container/stat-strip">
      <div
        className={cn(
          "grid gap-px overflow-hidden rounded-xl bg-border ring-1 ring-foreground/10",
          COLUMNS[count]
        )}
      >
        {children}
      </div>
    </div>
  )
}

type StatProps = {
  label: ReactNode
  /** A placeholder shows until it is set. */
  value: number | undefined
  /** Shows the error with Try Again in place of the value. */
  onRetry?: () => void
  failed?: boolean
}

export function Stat({ label, value, failed = false, onRetry }: StatProps) {
  return (
    <div className="flex flex-col gap-1 bg-card px-4 py-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      {failed && onRetry ? (
        <DashboardCardError onRetry={onRetry} />
      ) : value === undefined ? (
        <Skeleton className="my-1 h-6 w-16" />
      ) : (
        <span className="text-2xl leading-8 font-semibold tracking-tight tabular-nums">
          {formatCount(value)}
        </span>
      )}
    </div>
  )
}
