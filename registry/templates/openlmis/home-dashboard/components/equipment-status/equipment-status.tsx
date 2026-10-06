"use client"

import {
  CircleCheckIcon,
  CircleXIcon,
  type LucideIcon,
  TriangleAlertIcon,
  WrenchIcon,
} from "lucide-react"

import { Skeleton } from "@/components/ui/skeleton"
import {
  DashboardCard,
  DashboardCardCount,
  DashboardCardError,
  formatCount,
} from "@/registry/components/openlmis/dashboard-card/dashboard-card"
import {
  StatusMeter,
  StatusMeterIcon,
  StatusMeterLabel,
  StatusMeterList,
  StatusMeterValue,
  type StatusMeterTone,
} from "@/registry/components/openlmis/status-meter-list/status-meter-list"

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
  tone: StatusMeterTone
}

/** The colours carry good-to-critical meaning, so each status also has its own icon and label. */
const STATUS_STYLE: Record<EquipmentStatus, StatusStyle> = {
  FUNCTIONING: {
    label: "Functioning",
    icon: CircleCheckIcon,
    tone: "success",
  },
  NEEDS_ATTENTION: {
    label: "Needs Attention",
    icon: TriangleAlertIcon,
    tone: "warning",
  },
  AWAITING_REPAIR: {
    label: "Awaiting Repair",
    icon: WrenchIcon,
    tone: "warning",
  },
  UNSERVICEABLE: {
    label: "Unserviceable",
    icon: CircleXIcon,
    tone: "destructive",
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
        <StatusMeterList>
          {EQUIPMENT_STATUSES.map((status) => {
            const { label, icon, tone } = STATUS_STYLE[status]
            return (
              <StatusMeter
                key={status}
                max={total}
                tone={tone}
                value={counts[status]}
              >
                <StatusMeterIcon icon={icon} />
                <StatusMeterLabel>{label}</StatusMeterLabel>
                <StatusMeterValue>
                  {formatCount(counts[status])}
                </StatusMeterValue>
              </StatusMeter>
            )
          })}
        </StatusMeterList>
      )}
    </DashboardCard>
  )
}
