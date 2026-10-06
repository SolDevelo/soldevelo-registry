"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import type {
  AssignmentOption,
  ReasonAssignment,
} from "@/registry/blocks/openlmis/reason-assignment-dialog/reason-assignment"

import { ReasonAssignments } from "./reason-assignments"

const PROGRAMS: AssignmentOption[] = [
  { id: "family-planning", name: "Family Planning" },
  { id: "essential-meds", name: "Essential Meds" },
  { id: "epi", name: "EPI" },
]

const FACILITY_TYPES: AssignmentOption[] = [
  { id: "health-center", name: "Health Center" },
  { id: "district-hospital", name: "District Hospital" },
  { id: "warehouse", name: "Warehouse" },
  { id: "dispensary", name: "Dispensary" },
]

const ACTIVE_FACILITY_TYPES = FACILITY_TYPES.filter(
  (type) => type.id !== "dispensary"
)

const ROWS: ReasonAssignment[] = [
  { programId: "family-planning", facilityTypeId: "health-center", show: true },
  { programId: "family-planning", facilityTypeId: "dispensary", show: false },
  {
    programId: "essential-meds",
    facilityTypeId: "district-hospital",
    show: true,
  },
]

type Scenario = "ready" | "read-only" | "empty" | "loading"

const SCENARIOS: { value: Scenario; label: string }[] = [
  { value: "ready", label: "Ready" },
  { value: "read-only", label: "Read Only" },
  { value: "empty", label: "Empty" },
  { value: "loading", label: "Loading" },
]

export default function Page() {
  const [rows, setRows] = useState(ROWS)
  const [scenario, setScenario] = useState<Scenario>("ready")
  const loading = scenario === "loading"

  return (
    <div className="flex w-full max-w-4xl flex-col gap-4 p-8">
      <div className="flex flex-wrap gap-2">
        {SCENARIOS.map((item) => (
          <Button
            key={item.value}
            onClick={() => setScenario(item.value)}
            size="sm"
            variant={scenario === item.value ? "default" : "outline"}
          >
            {item.label}
          </Button>
        ))}
      </div>
      <ReasonAssignments
        activeFacilityTypes={ACTIVE_FACILITY_TYPES}
        facilityTypes={loading ? undefined : FACILITY_TYPES}
        onRowsChange={setRows}
        programs={loading ? undefined : PROGRAMS}
        readOnly={scenario === "read-only"}
        rows={scenario === "empty" ? [] : rows}
      />
    </div>
  )
}
