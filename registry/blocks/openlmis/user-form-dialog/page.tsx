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

// Stand-ins for your API, with a delay so the loading states show.
const wait = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms))

export default function Page() {
  // Open on load, so the catalog shows the dialog rather than its triggers.
  const [target, setTarget] = useState<UserFormDialogTarget | undefined>(
    USER.id
  )

  return (
    // Tall enough for the open dialog, which is fixed and so adds nothing to the frame's height.
    <div className="flex min-h-192 w-full gap-2 p-8">
      <Button onClick={() => setTarget("new")}>Add User</Button>
      <Button onClick={() => setTarget(USER.id)} variant="outline">
        Edit User
      </Button>
      <UserFormDialog
        loadFacilities={async () => {
          await wait(600)
          return FACILITIES
        }}
        loadUser={async () => {
          await wait(400)
          return USER
        }}
        onClose={() => setTarget(undefined)}
        saveUser={async (values) => {
          await wait(800)
          // The OpenLMIS server refuses a taken username; try "administrator" to see it.
          if (values.username === "administrator")
            throw new Error("Username administrator is already taken.")
          return USER.id
        }}
        target={target}
      />
    </div>
  )
}
