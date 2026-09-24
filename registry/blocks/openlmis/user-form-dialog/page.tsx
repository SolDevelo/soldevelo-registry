"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"

import type { Facility, UserDetails } from "./user-form"
import { UserFormDialog, type UserFormDialogTarget } from "./user-form-dialog"

const FACILITIES: Facility[] = [
  { id: "f1", code: "HC01", name: "Balaka District Hospital" },
  { id: "f2", code: "HC02", name: "Comfort Health Clinic" },
  { id: "f3", code: "HC03", name: "Kankao Health Facility" },
  { id: "f4", code: "HC04", name: "Nandumbo Health Center" },
]

const USER: UserDetails = {
  id: "u1",
  username: "divo1",
  firstName: "Grace",
  lastName: "Banda",
  email: "grace.banda@example.org",
  emailVerified: true,
  jobTitle: "Storeroom Manager",
  phoneNumber: "+265 999 123 456",
  active: true,
  homeFacilityId: "f2",
  allowNotify: true,
  homeFacilityRoleCount: 3,
}

export default function Page() {
  // Open on load, so the catalog shows the dialog rather than its triggers.
  const [target, setTarget] = useState<UserFormDialogTarget | undefined>(
    USER.id
  )
  const [error, setError] = useState<string>()
  const close = () => {
    setTarget(undefined)
    setError(undefined)
  }

  return (
    // Tall enough for the open dialog, which is fixed and so adds nothing to the frame's height.
    <div className="flex min-h-192 w-full gap-2 p-8">
      <Button onClick={() => setTarget("new")}>Add User</Button>
      <Button onClick={() => setTarget(USER.id)} variant="outline">
        Edit User
      </Button>
      <UserFormDialog
        error={error}
        facilities={FACILITIES}
        onClose={close}
        onSubmit={(values) => {
          // Stands in for a save; a taken username shows how an error reads.
          if (values.username === "administrator") {
            setError("Username administrator is already taken.")
            return
          }
          close()
        }}
        target={target}
        user={USER}
      />
    </div>
  )
}
