"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import type { FacilityLookups } from "@/registry/blocks/openlmis/facility-general-form/facility-form-fields"

import { FacilityFormDialog } from "./facility-form-dialog"

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

type Demo = "add" | "loading" | "saving" | "error"

const DEMOS: { value: Demo; label: string }[] = [
  { value: "add", label: "Add" },
  { value: "loading", label: "Loading" },
  { value: "saving", label: "Saving" },
  { value: "error", label: "Save Failed" },
]

export default function Page() {
  const [codes, setCodes] = useState(["HC01"])
  // Open on load, so the catalog shows the dialog rather than its triggers.
  const [demo, setDemo] = useState<Demo | undefined>("add")

  return (
    // Tall enough for the open dialog, which is fixed and so adds nothing to the frame's height.
    <div className="flex min-h-224 w-full flex-wrap content-start gap-2 p-8">
      {DEMOS.map((item) => (
        <Button
          key={item.value}
          onClick={() => setDemo(item.value)}
          size="sm"
          variant="outline"
        >
          {item.label}
        </Button>
      ))}
      <FacilityFormDialog
        error={
          demo === "error"
            ? "Something went wrong. Check your connection and try again."
            : undefined
        }
        lookups={demo === "loading" ? undefined : LOOKUPS}
        onClose={() => setDemo(undefined)}
        onSubmit={(values) => {
          setCodes((current) => [...current, values.code])
          setDemo(undefined)
        }}
        open={demo !== undefined}
        pending={demo === "saving"}
        takenCodes={codes}
      />
    </div>
  )
}
