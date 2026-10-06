"use client"

import { Skeleton } from "@/components/ui/skeleton"
import {
  DashboardCard,
  DashboardCardCount,
  DashboardCardError,
} from "@/registry/components/openlmis/dashboard-card/dashboard-card"
import { SegmentedMeter } from "@/registry/components/openlmis/segmented-meter/segmented-meter"

/** A sent requisition's steps, in the order it takes them. */
export const REQUISITION_PIPELINE = [
  "SUBMITTED",
  "AUTHORIZED",
  "IN_APPROVAL",
  "APPROVED",
  "RELEASED",
] as const

export type PipelineStatus = (typeof REQUISITION_PIPELINE)[number]

const LABELS = {
  SUBMITTED: "Submitted",
  AUTHORIZED: "Authorized",
  IN_APPROVAL: "In Approval",
  APPROVED: "Approved",
  RELEASED: "Released",
} as const satisfies Record<PipelineStatus, string>

type RequisitionStatusMeterProps = {
  /** How many requisitions stand at each step; a placeholder shows until it is set. */
  counts: Record<PipelineStatus, number> | undefined
  failed?: boolean
  onRetry?: () => void
  /** Fills the meter from the right on a right-to-left page. */
  dir?: "ltr" | "rtl"
  /** Formats each share, e.g. "43%"; fixed so a server render matches the browser. */
  locale?: string
}

/** Where sent requisitions stand, from submitted to released, as one segmented bar with a legend. */
export function RequisitionStatusMeter({
  counts,
  failed = false,
  onRetry,
  dir = "ltr",
  locale = "en-US",
}: RequisitionStatusMeterProps) {
  const total = counts
    ? REQUISITION_PIPELINE.reduce((sum, status) => sum + counts[status], 0)
    : undefined

  return (
    <DashboardCard
      badge={<DashboardCardCount failed={failed} value={total} />}
      description="Where sent requisitions stand today."
      title="Requisitions By Status"
    >
      {failed && onRetry ? (
        <DashboardCardError onRetry={onRetry} />
      ) : counts === undefined || total === undefined ? (
        <Skeleton className="h-36 w-full" />
      ) : (
        <SegmentedMeter
          dir={dir}
          locale={locale}
          segments={REQUISITION_PIPELINE.map((status) => ({
            id: status,
            label: LABELS[status],
            value: counts[status],
          }))}
        />
      )}
    </DashboardCard>
  )
}
