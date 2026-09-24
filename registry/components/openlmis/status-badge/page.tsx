import { StatusBadge } from "./status-badge"

export default function Page() {
  return (
    <div className="flex w-full flex-wrap items-center justify-center gap-2 p-8">
      <StatusBadge tone="success">Active</StatusBadge>
      <StatusBadge tone="warning">Ignored</StatusBadge>
      <StatusBadge tone="info">Unsaved</StatusBadge>
      <StatusBadge tone="destructive">Inactive</StatusBadge>
    </div>
  )
}
