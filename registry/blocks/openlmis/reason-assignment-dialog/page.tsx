"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"

import type { AssignmentOption, ReasonAssignment } from "./reason-assignment"
import { ReasonAssignmentDialog } from "./reason-assignment-dialog"

const PROGRAMS: AssignmentOption[] = [
  { id: "family-planning", name: "Family Planning" },
  { id: "essential-meds", name: "Essential Meds" },
  { id: "epi", name: "EPI" },
]

const FACILITY_TYPES: AssignmentOption[] = [
  { id: "health-center", name: "Health Center" },
  { id: "district-hospital", name: "District Hospital" },
  { id: "warehouse", name: "Warehouse" },
]

const ROWS: ReasonAssignment[] = [
  { programId: "family-planning", facilityTypeId: "health-center", show: true },
]

type Demo = "ready" | "loading"

export default function Page() {
  const [rows, setRows] = useState(ROWS)
  // Open on load, so the catalog shows the dialog rather than its triggers.
  const [demo, setDemo] = useState<Demo | undefined>("ready")

  return (
    // Tall enough for the open dialog, which is fixed and so adds nothing to the frame's height.
    <div className="flex min-h-128 w-full flex-col gap-4 p-8">
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => setDemo("ready")} size="sm" variant="outline">
          Add Program And Facility Type
        </Button>
        <Button onClick={() => setDemo("loading")} size="sm" variant="outline">
          Loading
        </Button>
      </div>
      <p className="text-sm text-muted-foreground">
        {rows.length === 1 ? "1 place" : `${rows.length} places`} listed. Family
        Planning at a Health Center is already one of them.
      </p>
      <ReasonAssignmentDialog
        facilityTypes={demo === "loading" ? undefined : FACILITY_TYPES}
        onAdd={(row) => {
          setRows((current) => [...current, row])
          setDemo(undefined)
        }}
        onClose={() => setDemo(undefined)}
        open={demo !== undefined}
        programs={demo === "loading" ? undefined : PROGRAMS}
        rows={rows}
      />
    </div>
  )
}
