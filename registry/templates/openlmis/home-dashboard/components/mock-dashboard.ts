// Mock numbers for the dashboard, so the page runs with no backend. Pass your own data instead.

import type { ApprovalRequisition } from "@/registry/blocks/openlmis/approvals-table/approvals-table"
import type { EquipmentStatus } from "@/registry/blocks/openlmis/equipment-status/equipment-status"
import type { PipelineStatus } from "@/registry/blocks/openlmis/requisition-status-meter/requisition-status-meter"
import type { PeriodRequisition } from "@/registry/blocks/openlmis/requisitions-by-period/periods"

/** What the signed-in user's rights let the dashboard show; work it out from their rights. */
export type DashboardAccess = {
  approve: boolean
  convert: boolean
  orders: boolean
  equipment: boolean
  requisitions: boolean
  manageUsers: boolean
}

export type SystemNotification = {
  id: string
  title: string | null
  message: string
}

export const MOCK_USER = { firstName: "Grace" }

export const MOCK_ACCESS: DashboardAccess = {
  approve: true,
  convert: true,
  orders: true,
  equipment: true,
  requisitions: true,
  manageUsers: true,
}

export const MOCK_NOTIFICATIONS: SystemNotification[] = [
  {
    id: "n1",
    title: "Scheduled Maintenance",
    message: "OpenLMIS will be unavailable on Saturday from 22:00 to 23:00.",
  },
]

export const MOCK_APPROVALS: ApprovalRequisition[] = [
  {
    id: "r1",
    emergency: true,
    program: { name: "Essential Meds" },
    facility: { code: "HC02", name: "Nandumbo Health Center" },
    processingPeriod: { name: "Jan 2026" },
    waitingSince: "2026-02-03T09:12:00Z",
  },
  {
    id: "r2",
    emergency: false,
    program: { name: "Family Planning" },
    facility: { code: "HC01", name: "Comfort Health Clinic" },
    processingPeriod: { name: "Jan 2026" },
    waitingSince: "2026-02-04T13:40:00Z",
  },
  {
    id: "r3",
    emergency: false,
    program: { name: "Essential Meds" },
    facility: { code: "HC03", name: "Kankao Health Facility" },
    processingPeriod: { name: "Jan 2026" },
    waitingSince: "2026-02-05T08:05:00Z",
  },
  {
    id: "r4",
    emergency: false,
    program: { name: "ARV" },
    facility: { code: "DH01", name: "Balaka District Hospital" },
    processingPeriod: { name: "Q4 2025" },
    waitingSince: "2026-01-12T10:30:00Z",
  },
]

export const MOCK_CONVERT_COUNT = 2

export const MOCK_OPEN_ORDERS_COUNT = 14

export const MOCK_EQUIPMENT_COUNTS: Record<EquipmentStatus, number> = {
  FUNCTIONING: 42,
  NEEDS_ATTENTION: 6,
  AWAITING_REPAIR: 3,
  UNSERVICEABLE: 2,
}

const STATUS_CYCLE: PeriodRequisition["status"][] = [
  "APPROVED",
  "RELEASED",
  "SUBMITTED",
  "APPROVED",
  "AUTHORIZED",
  "IN_APPROVAL",
  "RELEASED",
  "INITIATED",
]

// Six months of requisitions, more of them still in progress in the latest months.
export const MOCK_RECENT_REQUISITIONS: PeriodRequisition[] = [
  "2025-08",
  "2025-09",
  "2025-10",
  "2025-11",
  "2025-12",
  "2026-01",
].flatMap((month, index) =>
  Array.from({ length: 6 + index * 2 }, (_, count) => ({
    status: STATUS_CYCLE[(count + index) % STATUS_CYCLE.length] ?? "APPROVED",
    processingPeriod: { startDate: `${month}-01` },
  }))
)

export const MOCK_STATUS_COUNTS: Record<PipelineStatus, number> = {
  SUBMITTED: 9,
  AUTHORIZED: 6,
  IN_APPROVAL: 4,
  APPROVED: 18,
  RELEASED: 31,
}

/** Everything the dashboard shows; pass your own, leaving out what the user's rights hide. */
export type DashboardData = {
  notifications: SystemNotification[]
  approvals: ApprovalRequisition[]
  convertCount: number
  openOrdersCount: number
  equipmentCounts: Record<EquipmentStatus, number>
  recentRequisitions: PeriodRequisition[]
  statusCounts: Record<PipelineStatus, number>
}

export const MOCK_DASHBOARD: DashboardData = {
  notifications: MOCK_NOTIFICATIONS,
  approvals: MOCK_APPROVALS,
  convertCount: MOCK_CONVERT_COUNT,
  openOrdersCount: MOCK_OPEN_ORDERS_COUNT,
  equipmentCounts: MOCK_EQUIPMENT_COUNTS,
  recentRequisitions: MOCK_RECENT_REQUISITIONS,
  statusCounts: MOCK_STATUS_COUNTS,
}
