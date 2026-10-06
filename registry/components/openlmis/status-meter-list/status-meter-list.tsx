"use client"

import { Meter } from "@base-ui/react/meter"
import type { LucideIcon } from "lucide-react"
import { type ComponentProps, createContext, type ReactNode, use } from "react"

import { cn } from "@/lib/utils"

export type StatusMeterTone = "success" | "warning" | "destructive" | "info"

const TONES = {
  success: { icon: "text-success", bar: "bg-success" },
  warning: { icon: "text-warning", bar: "bg-warning" },
  destructive: { icon: "text-destructive", bar: "bg-destructive" },
  info: { icon: "text-info", bar: "bg-info" },
} as const satisfies Record<StatusMeterTone, { icon: string; bar: string }>

const ToneContext = createContext<StatusMeterTone>("info")

/** A list of status rows, each with its own meter. */
export function StatusMeterList({ className, ...props }: ComponentProps<"ul">) {
  return <ul className={cn("flex flex-col gap-3", className)} {...props} />
}

type StatusMeterProps = {
  /** The row's share; read against `max`. */
  value: number
  max?: number
  tone?: StatusMeterTone
  /** Formats the percentage read aloud; fixed by default, so a server render and the browser agree. */
  locale?: string
  /** The header line: `StatusMeterIcon`, `StatusMeterLabel`, `StatusMeterValue`. */
  children: ReactNode
  className?: string
}

/** One status: a header line over a thin bar filled to `value / max`. */
export function StatusMeter({
  value,
  max = 100,
  tone = "info",
  locale = "en-US",
  children,
  className,
}: StatusMeterProps) {
  return (
    <li className={className}>
      <ToneContext value={tone}>
        {/* A meter, not a progress bar: it is a share of the whole, not a task underway. */}
        <Meter.Root
          className="flex flex-col gap-1.5"
          locale={locale}
          max={Math.max(max, 1)}
          value={value}
        >
          <div className="flex items-center gap-2 text-sm">{children}</div>
          <Meter.Track className="h-1 w-full overflow-hidden rounded-full bg-muted">
            <Meter.Indicator
              className={cn("h-full transition-all", TONES[tone].bar)}
            />
          </Meter.Track>
        </Meter.Root>
      </ToneContext>
    </li>
  )
}

/** Tinted by the row's tone; pair it with a label so the colour is never the only cue. */
export function StatusMeterIcon({
  icon: Icon,
  className,
}: {
  icon: LucideIcon
  className?: string
}) {
  const tone = use(ToneContext)
  return (
    <Icon
      aria-hidden="true"
      className={cn("size-4 shrink-0", TONES[tone].icon, className)}
    />
  )
}

export function StatusMeterLabel({
  className,
  ...props
}: ComponentProps<typeof Meter.Label>) {
  return (
    <Meter.Label
      className={cn("min-w-0 flex-1 truncate", className)}
      {...props}
    />
  )
}

export function StatusMeterValue({
  className,
  ...props
}: ComponentProps<"span">) {
  return (
    <span className={cn("font-medium tabular-nums", className)} {...props} />
  )
}
