import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

import { ApprovalFilters } from "./components/approval-filters"
import { ApprovalTable } from "./components/approval-table"

export default function Page() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10">
      <header className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">
            Approve requisition
          </h1>
          <Badge variant="secondary">In approval</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Kankao Health Facility · Essential Medicines · March 2026 · Submitted
          4 Mar 2026 by A. Phiri
        </p>
      </header>

      <Separator />

      <ApprovalFilters />

      <ApprovalTable />
    </main>
  )
}
