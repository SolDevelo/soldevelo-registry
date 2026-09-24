"use client"

import { BarChartIcon } from "lucide-react"
import { useMemo } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  Rectangle,
  type RectangleProps,
  XAxis,
  YAxis,
} from "recharts"

import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"
import {
  DashboardCard,
  DashboardCardCount,
  DashboardCardError,
  formatCount,
} from "@/registry/components/openlmis/dashboard-card/dashboard-card"

import {
  type MonthTotals,
  type PeriodRequisition,
  showsYear,
  totalsByMonth,
} from "./periods"

const TITLE = "Requisitions By Period"

const config = {
  inProgress: { label: "In Progress", color: "var(--chart-2)" },
  approved: { label: "Approved", color: "var(--chart-4)" },
} satisfies ChartConfig

/** Month and year from a `YYYY-MM` key, read in UTC so a period never slips into the month before. */
const monthFormat = (options: Intl.DateTimeFormatOptions) => {
  const formatter = new Intl.DateTimeFormat(undefined, {
    ...options,
    timeZone: "UTC",
  })
  return (key: string) => formatter.format(new Date(`${key}-01T00:00:00Z`))
}
const formatMonthYear = monthFormat({ month: "short", year: "numeric" })
const formatMonth = monthFormat({ month: "short" })
const formatYear = monthFormat({ year: "numeric" })

type RequisitionsByPeriodProps = {
  /** A placeholder shows until it is set. */
  requisitions: readonly PeriodRequisition[] | undefined
  failed?: boolean
  onRetry?: () => void
  /** Mirrors the axes for a right-to-left page. */
  dir?: "ltr" | "rtl"
}

/** Sent requisitions in each of the latest months, split into still in progress and approved. */
export function RequisitionsByPeriod({
  requisitions,
  failed = false,
  onRetry,
  dir = "ltr",
}: RequisitionsByPeriodProps) {
  const months = useMemo(
    () => (requisitions ? totalsByMonth(requisitions) : undefined),
    [requisitions]
  )
  const total = months?.reduce(
    (sum, month) => sum + month.inProgress + month.approved,
    0
  )

  return (
    <DashboardCard
      badge={<DashboardCardCount failed={failed} value={total} />}
      description="Sent requisitions by the month their period starts."
      title={TITLE}
    >
      {failed && onRetry ? (
        <DashboardCardError onRetry={onRetry} />
      ) : months === undefined ? (
        <Skeleton className="h-64 w-full" />
      ) : months.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <BarChartIcon />
            </EmptyMedia>
            <EmptyTitle>No Requisitions Yet</EmptyTitle>
            <EmptyDescription>
              Requisitions appear here once they are submitted.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <MonthChart dir={dir} months={months} />
      )}
    </DashboardCard>
  )
}

function MonthChart({
  months,
  dir,
}: {
  months: MonthTotals[]
  dir: "ltr" | "rtl"
}) {
  const isRtl = dir === "rtl"

  return (
    <>
      {/* Sized by height, so the plot fills whatever width the card has. */}
      <ChartContainer className="aspect-auto h-64 w-full" config={config}>
        <BarChart accessibilityLayer data={months} margin={{ top: 20 }}>
          <CartesianGrid vertical={false} />
          {/* Every month is labelled; there are at most six, so none is skipped. */}
          <XAxis
            axisLine={false}
            dataKey="month"
            height={36}
            interval={0}
            reversed={isRtl}
            tick={<MonthTick months={months} />}
            tickLine={false}
            tickMargin={4}
          />
          <YAxis
            allowDecimals={false}
            axisLine={false}
            orientation={isRtl ? "right" : "left"}
            tickFormatter={formatCount}
            tickLine={false}
            width={32}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                labelFormatter={(month) => formatMonthYear(String(month))}
              />
            }
            cursor={false}
          />
          {/* Recharts sorts the legend by name; the stacking order reads better. */}
          <ChartLegend content={<ChartLegendContent />} itemSorter={null} />
          {/* The card-coloured stroke is the 2px gap that keeps stacked segments apart. */}
          <Bar
            dataKey="inProgress"
            fill="var(--color-inProgress)"
            maxBarSize={24}
            shape={InProgressSegment}
            stackId="month"
            stroke="var(--card)"
            strokeWidth={2}
          />
          <Bar
            dataKey="approved"
            fill="var(--color-approved)"
            maxBarSize={24}
            radius={[4, 4, 0, 0]}
            stackId="month"
            stroke="var(--card)"
            strokeWidth={2}
          >
            <LabelList
              className="fill-muted-foreground"
              formatter={(value) =>
                typeof value === "number" ? formatCount(value) : value
              }
              position="top"
              valueAccessor={(entry: { payload: MonthTotals }) =>
                entry.payload.inProgress + entry.payload.approved
              }
            />
          </Bar>
        </BarChart>
      </ChartContainer>
      <table className="sr-only">
        <caption>{TITLE}</caption>
        <thead>
          <tr>
            <th scope="col">Month</th>
            <th scope="col">{config.inProgress.label}</th>
            <th scope="col">{config.approved.label}</th>
          </tr>
        </thead>
        <tbody>
          {months.map((month) => (
            <tr key={month.month}>
              <th scope="row">{formatMonthYear(month.month)}</th>
              <td>{formatCount(month.inProgress)}</td>
              <td>{formatCount(month.approved)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}

type MonthTickProps = {
  x?: number
  y?: number
  index?: number
  payload?: { value: string }
  months: readonly MonthTotals[]
}

/** The month, with its year beneath where the year starts or changes, so six ticks fit a phone. */
function MonthTick({
  x = 0,
  y = 0,
  index = 0,
  payload,
  months,
}: MonthTickProps) {
  if (!payload) return null
  return (
    <text
      className="fill-muted-foreground text-xs"
      textAnchor="middle"
      x={x}
      y={y}
    >
      <tspan dy="0.8em" x={x}>
        {formatMonth(payload.value)}
      </tspan>
      {showsYear(months, index) && (
        <tspan dy="1.3em" x={x}>
          {formatYear(payload.value)}
        </tspan>
      )}
    </text>
  )
}

/** The lower segment, rounded on top only when nothing is stacked above it. */
function InProgressSegment(props: RectangleProps & { payload?: MonthTotals }) {
  return (
    <Rectangle {...props} radius={props.payload?.approved ? 0 : [4, 4, 0, 0]} />
  )
}
