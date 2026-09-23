"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"

import type {
  PasswordDialogTarget,
  PasswordUser,
} from "./reset-password-dialog"
import { ResetPasswordDialog } from "./reset-password-dialog"

const USERS: Record<string, PasswordUser> = {
  u1: { username: "divo1", email: "grace.banda@example.org" },
  u2: { username: "srmanager2", email: null },
}

// Kept outside render, so each target keeps its identity while the dialog is open.
const TARGETS = {
  reset: { userId: "u1", created: false },
  noEmail: { userId: "u2", created: false },
  created: { userId: "u1", created: true },
} satisfies Record<string, PasswordDialogTarget>

// Stand-ins for your API, with a delay so the loading states show.
const wait = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms))

export default function Page() {
  // Open on load, so the catalog shows the dialog rather than its triggers.
  const [target, setTarget] = useState<PasswordDialogTarget | undefined>(
    TARGETS.reset
  )

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
      <ResetPasswordDialog
        loadUser={async (userId) => {
          await wait(400)
          const user = USERS[userId]
          if (!user) throw new Error("User not found.")
          return user
        }}
        onClose={() => setTarget(undefined)}
        sendResetEmail={() => wait(800)}
        setPassword={() => wait(800)}
        target={target}
      />
    </div>
  )
}
