import { type ApprovalRequisition, ApprovalsTable } from "./approvals-table"

const REQUISITIONS: ApprovalRequisition[] = [
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
    program: { name: "Family Planning And Reproductive Health Commodities" },
    facility: { code: "HC01", name: "Comfort Health Clinic" },
    processingPeriod: { name: "Jan 2026" },
    waitingSince: "2026-02-04T13:40:00Z",
  },
  {
    id: "r3",
    emergency: false,
    program: { name: "ARV" },
    facility: { code: "DH01", name: "Balaka District Hospital" },
    processingPeriod: { name: "Q4 2025" },
    waitingSince: "2026-01-12T10:30:00Z",
  },
]

export default function Page() {
  return (
    <div className="flex w-full max-w-3xl flex-col gap-6 p-8">
      <ApprovalsTable requisitions={REQUISITIONS} />
      {/* Narrow, two lines each: a long program gives way, the period stays whole. */}
      <div className="w-full max-w-sm">
        <ApprovalsTable requisitions={REQUISITIONS} />
      </div>
    </div>
  )
}
