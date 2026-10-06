"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"

import { ReasonFormDialog } from "./reason-form-dialog"

const TAGS = ["receipts", "consumed", "damaged", "expired"]

type Demo = "add" | "saving" | "error"

const DEMOS: { value: Demo; label: string }[] = [
  { value: "add", label: "Add" },
  { value: "saving", label: "Saving" },
  { value: "error", label: "Save Failed" },
]

export default function Page() {
  const [names, setNames] = useState(["Transfer In", "Damage"])
  // Open on load, so the catalog shows the dialog rather than its triggers.
  const [demo, setDemo] = useState<Demo | undefined>("add")

  return (
    // Tall enough for the open dialog, which is fixed and so adds nothing to the frame's height.
    <div className="flex min-h-176 w-full flex-wrap content-start gap-2 p-8">
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
      <ReasonFormDialog
        error={
          demo === "error"
            ? "Something went wrong. Check your connection and try again."
            : undefined
        }
        lookups={{ tags: TAGS }}
        onClose={() => setDemo(undefined)}
        onSubmit={(values) => {
          setNames((current) => [...current, values.name])
          setDemo(undefined)
        }}
        open={demo !== undefined}
        pending={demo === "saving"}
        takenNames={names}
      />
    </div>
  )
}
