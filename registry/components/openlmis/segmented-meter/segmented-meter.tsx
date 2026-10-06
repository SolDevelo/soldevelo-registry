"use client"

import { Bar, BarChart, XAxis, YAxis } from "recharts"

import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { cn } from "@/lib/utils"

export type MeterSegment = {
  /** Stable identity, independent of its label. */
  id: string
  label: string
  value: number
}

/** The chart ramp, lightest first, so the order of the segments reads in the colour. */
const RAMP = [
  { fill: "var(--chart-1)", dot: "bg-chart-1" },
  { fill: "var(--chart-2)", dot: "bg-chart-2" },
  { fill: "var(--chart-3)", dot: "bg-chart-3" },
  { fill: "var(--chart-4)", dot: "bg-chart-4" },
  { fill: "var(--chart-5)", dot: "bg-chart-5" },
] as const

const rampAt = (index: number) => RAMP[index % RAMP.length]

type SegmentedMeterProps = {
  /** In order; each takes the next step of the chart ramp. */
  segments: readonly MeterSegment[]
  /** Fills the meter from the right on a right-to-left page. */
  dir?: "ltr" | "rtl"
  /** Formats counts and shares; fixed so a server render matches the browser. */
  locale?: string
  className?: string
}

/** Parts of a whole as one stacked bar, with a legend giving each part's count and share. */
export function SegmentedMeter({
  segments,
  dir = "ltr",
  locale = "en-US",
  className,
}: SegmentedMeterProps) {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0)
  const count = new Intl.NumberFormat(locale)
  const percent = new Intl.NumberFormat(locale, { style: "percent" })
  const share = (value: number) =>
    percent.format(total === 0 ? 0 : value / total)

  // Index keys, not labels, so any label is a safe data key and CSS variable name.
  const config = Object.fromEntries(
    segments.map((segment, index) => [
      `s${index}`,
      { label: segment.label, color: rampAt(index).fill },
    ])
  ) satisfies ChartConfig
  const datum = Object.fromEntries(
    segments.map((segment, index) => [`s${index}`, segment.value])
  )

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <ChartContainer className="aspect-auto h-3 w-full" config={config}>
        <BarChart
          accessibilityLayer
          barCategoryGap={0}
          data={[datum]}
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
          {segments.map((segment, index) => (
            <Bar
              dataKey={`s${index}`}
              fill={`var(--color-s${index})`}
              key={segment.id}
              stackId="segments"
              stroke="var(--card)"
              strokeWidth={2}
            />
          ))}
        </BarChart>
      </ChartContainer>
      <ul className="flex flex-col gap-1.5">
        {segments.map((segment, index) => (
          <li className="flex items-center gap-2 text-sm" key={segment.id}>
            <span
              aria-hidden="true"
              className={cn(
                "size-2.5 shrink-0 rounded-full",
                rampAt(index).dot
              )}
            />
            <span className="min-w-0 flex-1 truncate text-muted-foreground">
              {segment.label}
            </span>
            <span className="font-medium tabular-nums">
              {count.format(segment.value)}
            </span>
            <span className="w-10 text-end text-muted-foreground tabular-nums">
              {share(segment.value)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
