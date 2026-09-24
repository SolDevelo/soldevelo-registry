import { AlertCircleIcon } from "lucide-react"
import type { ReactNode } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

/** Counts in the reader's locale, e.g. 1,204. */
export const formatCount = (value: number) =>
  new Intl.NumberFormat().format(value)

type DashboardCardProps = {
  title: ReactNode
  /** Beside the title, usually a `DashboardCardCount`. */
  badge?: ReactNode
  /** One line on what the card shows; pass a `Skeleton` while it loads. */
  description: ReactNode
  children: ReactNode
}

/** A dashboard card's chrome: title with its count, a line on what it shows, then the body. */
export function DashboardCard({
  title,
  badge,
  description,
  children,
}: DashboardCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <span className="flex items-center gap-2">
            {title}
            {badge}
          </span>
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

/** The card's total beside its title; a placeholder while it loads, nothing when it failed. */
export function DashboardCardCount({
  value,
  failed = false,
}: {
  value: number | undefined
  failed?: boolean
}) {
  if (failed) return null
  if (value === undefined) {
    // A plain element, since Skeleton owns its corner radius and a badge is a pill.
    return (
      <span className="block h-5 w-8 animate-pulse rounded-full bg-muted" />
    )
  }
  return <Badge variant="secondary">{formatCount(value)}</Badge>
}

type DashboardCardErrorProps = {
  onRetry: () => void
  message?: ReactNode
  retryLabel?: ReactNode
}

/** A card body that failed to load, with a Try Again of its own so the rest of the page stays. */
export function DashboardCardError({
  onRetry,
  message = "This could not be loaded.",
  retryLabel = "Try Again",
}: DashboardCardErrorProps) {
  return (
    <div
      className="flex items-center gap-2 text-sm text-muted-foreground"
      role="alert"
    >
      <AlertCircleIcon
        aria-hidden="true"
        className="size-4 shrink-0 text-destructive"
      />
      <span className="min-w-0 flex-1">{message}</span>
      <Button onClick={onRetry} size="sm" type="button" variant="outline">
        {retryLabel}
      </Button>
    </div>
  )
}

/** The description's placeholder while a card's data loads. */
export function DashboardCardDescriptionSkeleton() {
  return <Skeleton className="my-0.5 h-4 w-48" />
}

/** A wide card beside a narrow one when the row has room, stacked otherwise; each fills the row's height. */
export function DashboardRow({
  wide,
  narrow,
}: {
  wide?: ReactNode
  narrow?: ReactNode
}) {
  return (
    // Its own container, so the split follows the room the row has, not the window.
    <div className="@container/dashboard-row">
      <div className="grid grid-cols-1 gap-4 @4xl/dashboard-row:grid-cols-3">
        {wide && (
          <div className="grid @4xl/dashboard-row:col-span-2">{wide}</div>
        )}
        {narrow && <div className="grid">{narrow}</div>}
      </div>
    </div>
  )
}
