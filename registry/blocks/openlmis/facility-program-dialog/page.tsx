"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"

import type { FacilityProgram, ProgramOption } from "./facility-program"
import { FacilityProgramDialog } from "./facility-program-dialog"

const PROGRAMS: ProgramOption[] = [
  { id: "family-planning", code: "PRG001", name: "Family Planning" },
  { id: "essential-meds", code: "PRG002", name: "Essential Meds" },
  { id: "epi", code: "PRG004", name: "EPI" },
  { id: "tb", code: "PRG005", name: null },
]

const ROWS: FacilityProgram[] = [
  {
    id: "family-planning",
    code: "PRG001",
    name: "Family Planning",
    supportActive: true,
    supportLocallyFulfilled: false,
    supportStartDate: "2017-01-01",
    saved: true,
  },
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
          Add Program
        </Button>
        <Button onClick={() => setDemo("loading")} size="sm" variant="outline">
          Loading
        </Button>
      </div>
      <p className="text-sm text-muted-foreground">
        Supported: {rows.map((row) => row.name ?? row.code).join(", ")}
      </p>
      <FacilityProgramDialog
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
