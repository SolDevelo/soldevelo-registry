"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import type { RoleAssignment } from "@/registry/blocks/openlmis/role-assignments-table/role-assignments"

import { ImportRolesDialog, type ImportSourceUser } from "./import-roles-dialog"

const DRAFT: RoleAssignment[] = [{ roleId: "storeroom", programId: "fp" }]

const USERS: ImportSourceUser[] = [
  {
    id: "u2",
    username: "administrator",
    firstName: "Alan",
    lastName: "Mwale",
    roleAssignments: [
      { roleId: "storeroom", programId: "fp" },
      { roleId: "admin" },
      { roleId: "reports" },
    ],
  },
  {
    id: "u3",
    username: "srmanager2",
    firstName: "Tendai",
    lastName: "Okafor",
    roleAssignments: [{ roleId: "storeroom", programId: "arv" }],
  },
]

export default function Page() {
  // Open on load, so the catalog shows the dialog rather than its trigger.
  const [open, setOpen] = useState(true)
  const [imported, setImported] = useState<string>()

  return (
    // Tall enough for the open dialog, which is fixed and so adds nothing to the frame's height.
    <div className="flex min-h-96 w-full flex-col items-start gap-3 p-8">
      <Button onClick={() => setOpen(true)} variant="outline">
        Import Roles
      </Button>
      {imported && <p className="text-sm text-muted-foreground">{imported}</p>}
      <ImportRolesDialog
        draft={DRAFT}
        onClose={() => setOpen(false)}
        onImport={(assignments, from) =>
          setImported(`${assignments.length} roles copied from ${from}.`)
        }
        open={open}
        userId="u1"
        username="divo1"
        users={USERS}
      />
    </div>
  )
}
