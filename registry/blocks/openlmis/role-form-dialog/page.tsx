"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import type {
  Right,
  Role,
} from "@/registry/blocks/openlmis/role-assignments-table/role-assignments"

import { RoleFormDialog, type RoleFormDialogTarget } from "./role-form-dialog"

const RIGHTS: Right[] = [
  { name: "REQUISITION_APPROVE", type: "SUPERVISION" },
  { name: "REQUISITION_AUTHORIZE", type: "SUPERVISION" },
  { name: "REQUISITION_CREATE", type: "SUPERVISION" },
  { name: "REQUISITION_DELETE", type: "SUPERVISION" },
  { name: "REQUISITION_VIEW", type: "SUPERVISION" },
  { name: "STOCK_CARDS_VIEW", type: "SUPERVISION" },
  { name: "ORDERS_EDIT", type: "ORDER_FULFILLMENT" },
  { name: "ORDERS_VIEW", type: "ORDER_FULFILLMENT" },
  { name: "PODS_MANAGE", type: "ORDER_FULFILLMENT" },
  { name: "REPORTS_VIEW", type: "REPORTS" },
  { name: "USERS_MANAGE", type: "GENERAL_ADMIN" },
  { name: "USER_ROLES_MANAGE", type: "GENERAL_ADMIN" },
]

const IN_USE: Role = {
  id: "role-approver",
  name: "Program Supervisor",
  description: "Authorizes and approves requisitions under a node.",
  rights: [
    { name: "REQUISITION_AUTHORIZE", type: "SUPERVISION" },
    { name: "REQUISITION_APPROVE", type: "SUPERVISION" },
    { name: "REQUISITION_VIEW", type: "SUPERVISION" },
  ],
}

// Saved before roles held one type, so the form warns that a save drops the extra right.
const MIXED: Role = {
  id: "role-mixed",
  name: "District Pharmacist",
  description: "Approves requisitions and views reports.",
  rights: [
    { name: "REQUISITION_APPROVE", type: "SUPERVISION" },
    { name: "REPORTS_VIEW", type: "REPORTS" },
  ],
}

const ROLES = [IN_USE, MIXED]
const HOLDERS: Record<string, number> = { [IN_USE.id]: 12, [MIXED.id]: 0 }

type Scenario = "ready" | "loading" | "no-access" | "not-found" | "pending"

export default function Page() {
  // Open on load, so the catalog shows the dialog rather than its triggers.
  const [target, setTarget] = useState<RoleFormDialogTarget | undefined>(
    IN_USE.id
  )
  const [scenario, setScenario] = useState<Scenario>("ready")
  const [error, setError] = useState<string>()
  const open = (next: RoleFormDialogTarget, nextScenario: Scenario) => {
    setScenario(nextScenario)
    setError(undefined)
    setTarget(next)
  }
  const close = () => {
    setTarget(undefined)
    setError(undefined)
  }

  return (
    // Tall enough for the open dialog, which is fixed and so adds nothing to the frame's height.
    <div className="flex min-h-192 w-full flex-wrap content-start gap-2 p-8">
      <Button onClick={() => open("new", "ready")}>Create Role</Button>
      <Button onClick={() => open(IN_USE.id, "ready")} variant="outline">
        Edit Role In Use
      </Button>
      <Button onClick={() => open(MIXED.id, "ready")} variant="outline">
        Rights Of Another Type
      </Button>
      <Button onClick={() => open(IN_USE.id, "loading")} variant="outline">
        Loading
      </Button>
      <Button onClick={() => open(IN_USE.id, "pending")} variant="outline">
        Saving
      </Button>
      <Button onClick={() => open("new", "no-access")} variant="outline">
        No Access
      </Button>
      <Button onClick={() => open("gone", "not-found")} variant="outline">
        Not Found
      </Button>
      <RoleFormDialog
        canEdit={scenario !== "no-access"}
        error={error}
        holders={target ? (HOLDERS[target] ?? 0) : 0}
        notFound={scenario === "not-found"}
        onClose={close}
        onSubmit={(result) => {
          // Stands in for a save; a role named Fail shows how an error reads.
          if (result.name.toLowerCase() === "fail") {
            setError(
              "Something went wrong. Check your connection and try again."
            )
            return
          }
          close()
        }}
        pending={scenario === "pending"}
        rights={scenario === "loading" ? undefined : RIGHTS}
        role={
          scenario === "loading"
            ? undefined
            : ROLES.find((role) => role.id === target)
        }
        roles={ROLES}
        target={target}
      />
    </div>
  )
}
