import type { PeriodRequisition } from "./periods"
import { RequisitionsByPeriod } from "./requisitions-by-period"

const STATUSES: PeriodRequisition["status"][] = [
  "APPROVED",
  "RELEASED",
  "SUBMITTED",
  "AUTHORIZED",
  "IN_APPROVAL",
  "INITIATED",
]

// Six months of requisitions, more of them still in progress in the latest months.
const REQUISITIONS: PeriodRequisition[] = [
  "2025-08",
  "2025-09",
  "2025-10",
  "2025-11",
  "2025-12",
  "2026-01",
].flatMap((month, index) =>
  Array.from({ length: 6 + index * 2 }, (_, count) => ({
    status: STATUSES[(count + index) % STATUSES.length] ?? "APPROVED",
    processingPeriod: { startDate: `${month}-01` },
  }))
)

export default function Page() {
  return (
    <div className="w-full max-w-3xl p-8">
      <RequisitionsByPeriod requisitions={REQUISITIONS} />
    </div>
  )
}
