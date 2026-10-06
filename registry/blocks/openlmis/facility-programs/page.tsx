"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import type {
  FacilityProgram,
  ProgramOption,
} from "@/registry/blocks/openlmis/facility-program-dialog/facility-program"

import { FacilityPrograms } from "./facility-programs"

const PROGRAMS: ProgramOption[] = [
  { id: "family-planning", code: "PRG001", name: "Family Planning" },
  { id: "essential-meds", code: "PRG002", name: "Essential Meds" },
  { id: "new-program", code: "PRG003", name: "New Program" },
  { id: "epi", code: "PRG004", name: "EPI" },
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
  {
    id: "essential-meds",
    code: "PRG002",
    name: "Essential Meds",
    supportActive: true,
    supportLocallyFulfilled: true,
    supportStartDate: "",
    saved: true,
  },
  {
    id: "epi",
    code: "PRG004",
    name: "EPI",
    supportActive: false,
    supportLocallyFulfilled: false,
    supportStartDate: "",
    saved: false,
  },
]

type Scenario = "ready" | "invalid" | "read-only" | "empty" | "loading"

const SCENARIOS: { value: Scenario; label: string }[] = [
  { value: "ready", label: "Ready" },
  { value: "invalid", label: "Missing Start Date" },
  { value: "read-only", label: "Read Only" },
  { value: "empty", label: "Empty" },
  { value: "loading", label: "Loading" },
]

export default function Page() {
  const [rows, setRows] = useState(ROWS)
  const [scenario, setScenario] = useState<Scenario>("ready")

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
      <FacilityPrograms
        onRowsChange={setRows}
        programs={PROGRAMS}
        readOnly={scenario === "read-only"}
        rows={
          scenario === "loading" ? undefined : scenario === "empty" ? [] : rows
        }
        showErrors={scenario === "invalid"}
      />
    </div>
  )
}
