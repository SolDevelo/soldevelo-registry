"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"

import type {
  PasswordDialogTarget,
  PasswordUser,
} from "./reset-password-dialog"
import { ResetPasswordDialog } from "./reset-password-dialog"

const USERS: Record<string, PasswordUser> = {
  u1: {
    id: "u1",
    username: "divo1",
    email: "grace.banda@example.org",
    firstName: "Grace",
    lastName: "Banda",
  },
  u2: {
    id: "u2",
    username: "srmanager2",
    email: null,
    firstName: "Chikondi",
    lastName: "Phiri",
  },
}

// Kept outside render, so each target keeps its identity while the dialog is open.
const TARGETS = {
  reset: { userId: "u1", created: false },
  noEmail: { userId: "u2", created: false },
  created: { userId: "u1", created: true },
  failed: { userId: "u2", created: true },
} satisfies Record<string, PasswordDialogTarget>

export default function Page() {
  // Open on load, so the catalog shows the dialog rather than its triggers.
  const [target, setTarget] = useState<PasswordDialogTarget | undefined>(
    TARGETS.reset
  )
  // Shows how a refused password reads, as the auth service words it.
  const error =
    target === TARGETS.failed
      ? "This password is too easy to guess. Make it longer, or add a less common word."
      : undefined

  return (
    // Tall enough for the open dialog, which is fixed and so adds nothing to the frame's height.
    <div className="flex min-h-112 w-full flex-wrap content-start gap-2 p-8">
      <Button onClick={() => setTarget(TARGETS.reset)}>Reset Password</Button>
      <Button onClick={() => setTarget(TARGETS.noEmail)} variant="outline">
        User Without Email
      </Button>
      <Button onClick={() => setTarget(TARGETS.created)} variant="outline">
        New User
      </Button>
      <Button onClick={() => setTarget(TARGETS.failed)} variant="outline">
        Save Error
      </Button>
      <ResetPasswordDialog
        error={error}
        onClose={() => setTarget(undefined)}
        // Stands in for sending the change; wire it to your own call.
        onSubmit={() => setTarget(undefined)}
        target={target}
        user={target && USERS[target.userId]}
      />
    </div>
  )
}
