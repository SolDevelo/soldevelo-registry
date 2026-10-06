"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"

import {
  type AssignmentTargets,
  DeleteAssignmentsDialog,
} from "./delete-assignments-dialog"

const ONE: AssignmentTargets = new Map([
  ["a1", "Ntcheu District Warehouse for Health Center in Family Planning"],
])

const THREE: AssignmentTargets = new Map([
  ["a1", "Ntcheu District Warehouse for Health Center in Family Planning"],
  ["a2", "Balaka District Warehouse for Health Center in Family Planning"],
  ["a3", "Malawi Red Cross for District Hospital in Essential Meds"],
])

type Shown = {
  targets: AssignmentTargets
  mode: "ready" | "deleting" | "error"
}

export default function Page() {
  // Open on load, so the catalog shows the dialog rather than its triggers.
  const [shown, setShown] = useState<Shown | undefined>({
    targets: ONE,
    mode: "ready",
  })

  return (
    // Tall enough for the open dialog, which is fixed and so adds nothing to the frame's height.
    <div className="flex min-h-96 w-full flex-wrap content-start gap-2 p-8">
      <Button
        onClick={() => setShown({ targets: ONE, mode: "ready" })}
        variant="destructive"
      >
        Delete One
      </Button>
      <Button
        onClick={() => setShown({ targets: THREE, mode: "ready" })}
        variant="outline"
      >
        Delete Three
      </Button>
      <Button
        onClick={() => setShown({ targets: THREE, mode: "deleting" })}
        variant="outline"
      >
        Deleting
      </Button>
      <Button
        onClick={() => setShown({ targets: ONE, mode: "error" })}
        variant="outline"
      >
        Nothing Deleted
      </Button>
      <DeleteAssignmentsDialog
        error={
          shown?.mode === "error"
            ? "Nothing was deleted. Check your connection and try again."
            : undefined
        }
        kind="sources"
        onClose={() => setShown(undefined)}
        onConfirm={() => setShown(undefined)}
        pending={shown?.mode === "deleting"}
        targets={shown?.targets}
      />
    </div>
  )
}
