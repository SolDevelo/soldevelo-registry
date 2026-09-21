import { REQUISITION_STATUSES, StatusPill } from "./status-pill"

export default function Page() {
  return (
    <div className="flex w-full flex-wrap items-center justify-center gap-2 p-8">
      {REQUISITION_STATUSES.map((status) => (
        <StatusPill key={status} status={status} />
      ))}
    </div>
  )
}
