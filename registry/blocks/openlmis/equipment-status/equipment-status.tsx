"use client"

import { Meter } from "@base-ui/react/meter"
import {
  CircleCheckIcon,
  CircleXIcon,
  type LucideIcon,
  TriangleAlertIcon,
  WrenchIcon,
} from "lucide-react"

import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import {
  DashboardCard,
  DashboardCardCount,
  DashboardCardError,
  formatCount,
} from "@/registry/components/openlmis/dashboard-card/dashboard-card"

/** Cold chain equipment's functional statuses, best first. */
export const EQUIPMENT_STATUSES = [
  "FUNCTIONING",
  "NEEDS_ATTENTION",
  "AWAITING_REPAIR",
  "UNSERVICEABLE",
] as const

export type EquipmentStatus = (typeof EQUIPMENT_STATUSES)[number]

type StatusStyle = {
  label: string
  icon: LucideIcon
  iconClass: string
  barClass: string
}

/** The colours carry good-to-critical meaning, so each status also has its own icon and label. */
const STATUS_STYLE: Record<EquipmentStatus, StatusStyle> = {
  FUNCTIONING: {
    label: "Functioning",
    icon: CircleCheckIcon,
    iconClass: "text-success",
    barClass: "bg-success",
  },
  NEEDS_ATTENTION: {
    label: "Needs Attention",
    icon: TriangleAlertIcon,
    iconClass: "text-warning",
    barClass: "bg-warning",
  },
  AWAITING_REPAIR: {
    label: "Awaiting Repair",
    icon: WrenchIcon,
    iconClass: "text-warning",
    barClass: "bg-warning",
  },
  UNSERVICEABLE: {
    label: "Unserviceable",
    icon: CircleXIcon,
    iconClass: "text-destructive",
    barClass: "bg-destructive",
  },
}

type EquipmentStatusCardProps = {
  /** How much equipment is in each status; a placeholder shows until it is set. */
  counts: Record<EquipmentStatus, number> | undefined
  failed?: boolean
  onRetry?: () => void
}

/** How much cold chain equipment works, needs work or is out of service. */
export function EquipmentStatusCard({
  counts,
  failed = false,
  onRetry,
}: EquipmentStatusCardProps) {
  const total = counts
    ? EQUIPMENT_STATUSES.reduce((sum, status) => sum + counts[status], 0)
    : undefined

  return (
    <DashboardCard
      badge={<DashboardCardCount failed={failed} value={total} />}
      description="Cold chain equipment by functional status."
      title="Cold Chain Equipment"
    >
      {failed && onRetry ? (
        <DashboardCardError onRetry={onRetry} />
      ) : counts === undefined || total === undefined ? (
        <Skeleton className="h-40 w-full" />
      ) : (
        <ul className="flex flex-col gap-3">
          {EQUIPMENT_STATUSES.map((status) => {
            const {
              label,
              icon: Icon,
              iconClass,
              barClass,
            } = STATUS_STYLE[status]
            return (
              <li key={status}>
                {/* A meter, not a progress bar: it is a share of the whole, not a task underway. */}
                <Meter.Root
                  className="flex flex-col gap-1.5"
                  value={total === 0 ? 0 : (counts[status] / total) * 100}
                >
                  <div className="flex items-center gap-2 text-sm">
                    <Icon
                      aria-hidden="true"
                      className={cn("size-4 shrink-0", iconClass)}
                    />
                    <Meter.Label className="min-w-0 flex-1 truncate">
                      {label}
                    </Meter.Label>
                    <span className="font-medium tabular-nums">
                      {formatCount(counts[status])}
                    </span>
                  </div>
                  <Meter.Track className="h-1 w-full overflow-hidden rounded-full bg-muted">
                    <Meter.Indicator
                      className={cn("h-full transition-all", barClass)}
                    />
                  </Meter.Track>
                </Meter.Root>
              </li>
            )
          })}
        </ul>
      )}
    </DashboardCard>
  )
}
