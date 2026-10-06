"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"

import { ChangePasswordDialog } from "./change-password-dialog"

const USER = { username: "divo1", firstName: "Grace", lastName: "Banda" }

type Scenario = "ready" | "pending" | "error"

export default function Page() {
  // Open on load, so the catalog shows the dialog rather than its trigger.
  const [open, setOpen] = useState(true)
  const [scenario, setScenario] = useState<Scenario>("ready")
  const [changed, setChanged] = useState(false)
  const show = (next: Scenario) => {
    setScenario(next)
    setChanged(false)
    setOpen(true)
  }

  return (
    // Tall enough for the open dialog, which is fixed and so adds nothing to the frame's height.
    <div className="flex min-h-160 w-full flex-col items-start gap-4 p-8">
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => show("ready")}>Change Password</Button>
        <Button onClick={() => show("pending")} variant="outline">
          Changing
        </Button>
        <Button onClick={() => show("error")} variant="outline">
          Refused
        </Button>
      </div>
      {changed && (
        <p className="text-sm text-muted-foreground">
          Password changed. A real app signs out here.
        </p>
      )}
      <ChangePasswordDialog
        error={
          scenario === "error"
            ? "This password is too easy to guess. Make it longer, or add a less common word."
            : undefined
        }
        onClose={() => setOpen(false)}
        onSubmit={() => {
          setChanged(true)
          setOpen(false)
        }}
        open={open}
        pending={scenario === "pending"}
        user={USER}
      />
    </div>
  )
}
