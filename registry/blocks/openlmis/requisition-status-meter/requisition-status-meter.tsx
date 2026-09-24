"use client"

import { Bar, BarChart, XAxis, YAxis } from "recharts"

import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton"
import {
  DashboardCard,
  DashboardCardCount,
  DashboardCardError,
  formatCount,
} from "@/registry/components/openlmis/dashboard-card/dashboard-card"

/** A sent requisition's steps, in the order it takes them. */
export const REQUISITION_PIPELINE = [
  "SUBMITTED",
  "AUTHORIZED",
  "IN_APPROVAL",
  "APPROVED",
  "RELEASED",
] as const

export type PipelineStatus = (typeof REQUISITION_PIPELINE)[number]

/** One step of the chart ramp per status, lightest first, so the order of the pipeline reads in the colour. */
const STATUSES = {
  SUBMITTED: { label: "Submitted", fill: "var(--chart-1)", dot: "bg-chart-1" },
  AUTHORIZED: {
    label: "Authorized",
    fill: "var(--chart-2)",
    dot: "bg-chart-2",
  },
  IN_APPROVAL: {
    label: "In Approval",
    fill: "var(--chart-3)",
    dot: "bg-chart-3",
  },
  APPROVED: { label: "Approved", fill: "var(--chart-4)", dot: "bg-chart-4" },
  RELEASED: { label: "Released", fill: "var(--chart-5)", dot: "bg-chart-5" },
} as const satisfies Record<
  PipelineStatus,
  { label: string; fill: string; dot: string }
>

const config = Object.fromEntries(
  REQUISITION_PIPELINE.map((status) => [
    status,
    { label: STATUSES[status].label, color: STATUSES[status].fill },
  ])
) satisfies ChartConfig

type RequisitionStatusMeterProps = {
  /** How many requisitions stand at each step; a placeholder shows until it is set. */
  counts: Record<PipelineStatus, number> | undefined
  failed?: boolean
  onRetry?: () => void
  /** Fills the meter from the right on a right-to-left page. */
  dir?: "ltr" | "rtl"
}

/** Where sent requisitions stand, from submitted to released, as one segmented bar with a legend. */
export function RequisitionStatusMeter({
  counts,
  failed = false,
  onRetry,
  dir = "ltr",
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
        <StatusMeter counts={counts} dir={dir} total={total} />
      )}
    </DashboardCard>
  )
}

function StatusMeter({
  counts,
  total,
  dir,
}: {
  counts: Record<PipelineStatus, number>
  total: number
  dir: "ltr" | "rtl"
}) {
  const share = (count: number) =>
    total === 0 ? 0 : Math.round((count / total) * 100)

  return (
    <div className="flex flex-col gap-4">
      <ChartContainer className="aspect-auto h-3 w-full" config={config}>
        <BarChart
          accessibilityLayer
          barCategoryGap={0}
          data={[counts]}
          layout="vertical"
          margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
        >
          <XAxis
            domain={[0, Math.max(total, 1)]}
            hide
            reversed={dir === "rtl"}
            type="number"
          />
          <YAxis hide type="category" />
          <ChartTooltip
            content={<ChartTooltipContent hideLabel />}
            cursor={false}
          />
          {REQUISITION_PIPELINE.map((status) => (
            <Bar
              dataKey={status}
              fill={`var(--color-${status})`}
              key={status}
              stackId="statuses"
              stroke="var(--card)"
              strokeWidth={2}
            />
          ))}
        </BarChart>
      </ChartContainer>
      <ul className="flex flex-col gap-1.5">
        {REQUISITION_PIPELINE.map((status) => (
          <li className="flex items-center gap-2 text-sm" key={status}>
            <span
              aria-hidden="true"
              className={`size-2.5 shrink-0 rounded-full ${STATUSES[status].dot}`}
            />
            <span className="min-w-0 flex-1 truncate text-muted-foreground">
              {STATUSES[status].label}
            </span>
            <span className="font-medium tabular-nums">
              {formatCount(counts[status])}
            </span>
            <span className="w-10 text-end text-muted-foreground tabular-nums">
              {share(counts[status])}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
