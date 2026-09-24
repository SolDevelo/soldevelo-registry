"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"

import { DiscardChangesDialog } from "./discard-changes-dialog"

export default function Page() {
  // Open on load, so the catalog shows the dialog rather than its trigger.
  const [open, setOpen] = useState(true)
  const [left, setLeft] = useState(false)

  return (
    // Tall enough for the open dialog, which is fixed and so adds nothing to the frame's height.
    <div className="flex min-h-72 w-full flex-col items-start gap-3 p-8">
      <Button onClick={() => setOpen(true)} variant="outline">
        Cancel
      </Button>
      {left && (
        <p className="text-sm text-muted-foreground">Changes discarded.</p>
      )}
      <DiscardChangesDialog
        changes={3}
        onDiscard={() => {
          setOpen(false)
          setLeft(true)
        }}
        onKeepEditing={() => setOpen(false)}
        open={open}
        subject="the roles of divo1"
      />
    </div>
  )
}
