"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"

import { AddAssignmentDialog } from "./add-assignment-dialog"
import type { AssignmentChoices } from "./assignment-form"

const CHOICES: AssignmentChoices = {
  programs: [
    { id: "fp", name: "Family Planning" },
    { id: "em", name: "Essential Meds" },
  ],
  facilityTypes: [
    { id: "hc", name: "Health Center" },
    { id: "dh", name: "District Hospital" },
  ],
  facilities: [
    { id: "w1", code: "W001", name: "Ntcheu District Warehouse" },
    { id: "w2", code: "W002", name: "Balaka District Warehouse" },
  ],
  organizations: [{ id: "o1", name: "Malawi Red Cross" }],
  geoLevels: [
    { id: "region", name: "Region", levelNumber: 2 },
    { id: "district", name: "District", levelNumber: 3 },
  ],
}

const LOADING: AssignmentChoices = {
  programs: undefined,
  facilityTypes: undefined,
  facilities: undefined,
  organizations: undefined,
  geoLevels: undefined,
}

type Mode = "ready" | "saving" | "error" | "loading"

export default function Page() {
  // Open on load, so the catalog shows the dialog rather than its triggers.
  const [mode, setMode] = useState<Mode | undefined>("ready")

  return (
    // Tall enough for the open dialog, which is fixed and so adds nothing to the frame's height.
    <div className="flex min-h-160 w-full flex-wrap content-start gap-2 p-8">
      <Button onClick={() => setMode("ready")}>Add Valid Source</Button>
      <Button onClick={() => setMode("saving")} variant="outline">
        Saving
      </Button>
      <Button onClick={() => setMode("error")} variant="outline">
        Save Error
      </Button>
      <Button onClick={() => setMode("loading")} variant="outline">
        Loading Lists
      </Button>
      <AddAssignmentDialog
        canPickOrganizations
        error={
          mode === "error"
            ? "It could not be added. Check your connection and try again."
            : undefined
        }
        kind="sources"
        onClose={() => setMode(undefined)}
        onSubmit={() => setMode(undefined)}
        open={mode !== undefined}
        pending={mode === "saving"}
        {...(mode === "loading" ? LOADING : CHOICES)}
      />
    </div>
  )
}
