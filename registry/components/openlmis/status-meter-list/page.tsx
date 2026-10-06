"use client"

import {
  CircleCheckIcon,
  CircleXIcon,
  InfoIcon,
  TriangleAlertIcon,
} from "lucide-react"

import {
  StatusMeter,
  StatusMeterIcon,
  StatusMeterLabel,
  StatusMeterList,
  StatusMeterValue,
} from "./status-meter-list"

const ROWS = [
  { label: "Healthy", value: 42, tone: "success", icon: CircleCheckIcon },
  { label: "Degraded", value: 7, tone: "warning", icon: TriangleAlertIcon },
  { label: "Down", value: 3, tone: "destructive", icon: CircleXIcon },
  { label: "Unknown", value: 0, tone: "info", icon: InfoIcon },
] as const

const total = ROWS.reduce((sum, row) => sum + row.value, 0)

export default function Page() {
  return (
    <div className="w-full max-w-md p-8">
      <StatusMeterList>
        {ROWS.map((row) => (
          <StatusMeter
            key={row.label}
            max={total}
            tone={row.tone}
            value={row.value}
          >
            <StatusMeterIcon icon={row.icon} />
            <StatusMeterLabel>{row.label}</StatusMeterLabel>
            <StatusMeterValue>{row.value}</StatusMeterValue>
          </StatusMeter>
        ))}
      </StatusMeterList>
    </div>
  )
}
