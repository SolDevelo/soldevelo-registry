import { RequisitionStatusMeter } from "./requisition-status-meter"

export default function Page() {
  return (
    <div className="w-full max-w-sm p-8">
      <RequisitionStatusMeter
        counts={{
          SUBMITTED: 9,
          AUTHORIZED: 6,
          IN_APPROVAL: 4,
          APPROVED: 18,
          RELEASED: 31,
        }}
      />
    </div>
  )
}
