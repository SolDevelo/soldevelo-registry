"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"

import { FacilityGeneralForm } from "./facility-general-form"
import { EMPTY_FACILITY, type FacilityValues } from "./facility-form"
import type { FacilityLookups } from "./facility-form-fields"

const LOOKUPS: FacilityLookups = {
  types: [
    { id: "health-center", name: "Health Center" },
    { id: "district-hospital", name: "District Hospital" },
    { id: "warehouse", name: "Warehouse" },
  ],
  zones: [
    { id: "balaka", name: "Balaka", description: "District" },
    { id: "southern", name: "Southern Region", description: "Region" },
    { id: "malawi", name: "Malawi", description: "Country" },
  ],
  operators: [
    { id: "moh", name: "Ministry of Health" },
    { id: "chai", name: "CHAI" },
  ],
}

const FACILITY: FacilityValues = {
  name: "Comfort Health Clinic",
  code: "HC01",
  typeId: "health-center",
  zoneId: "balaka",
  goLiveDate: "2017-01-01",
  description: "",
  operatorId: "moh",
  active: true,
  enabled: true,
}

type Scenario = "edit" | "add" | "managed" | "read-only" | "loading"

const SCENARIOS: { value: Scenario; label: string }[] = [
  { value: "edit", label: "Edit" },
  { value: "add", label: "Add" },
  { value: "managed", label: "Managed Externally" },
  { value: "read-only", label: "Read Only" },
  { value: "loading", label: "Loading" },
]

export default function Page() {
  const [scenario, setScenario] = useState<Scenario>("edit")
  const [facility, setFacility] = useState(FACILITY)
  const adding = scenario === "add"

  return (
    <div className="@container/main flex w-full max-w-4xl flex-col gap-6 p-8">
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
      <FacilityGeneralForm
        facility={
          scenario === "loading"
            ? undefined
            : adding
              ? EMPTY_FACILITY
              : facility
        }
        formId="facility-general-form"
        goLiveDateRequired={!adding}
        key={scenario}
        locked={scenario === "managed"}
        lookups={LOOKUPS}
        onSubmit={setFacility}
        readOnly={scenario === "read-only"}
        takenCodes={adding ? ["HC01"] : []}
      />
      {scenario !== "read-only" && (
        <div className="flex justify-end">
          <Button form="facility-general-form" type="submit">
            {adding ? "Create" : "Save"}
          </Button>
        </div>
      )}
    </div>
  )
}
