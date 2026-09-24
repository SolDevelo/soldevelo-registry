"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import type {
  RightType,
  RoleAssignment,
} from "@/registry/blocks/openlmis/role-assignments-table/role-assignments"

import { AddRoleDialog } from "./add-role-dialog"

const ROLES = [
  {
    id: "storeroom",
    name: "Storeroom Manager",
    rights: [
      { name: "REQUISITION_CREATE", type: "SUPERVISION" as const },
      { name: "REQUISITION_VIEW", type: "SUPERVISION" as const },
    ],
  },
  {
    id: "approver",
    name: "Program Supervisor",
    rights: [
      { name: "REQUISITION_APPROVE", type: "SUPERVISION" as const },
      { name: "REQUISITION_AUTHORIZE", type: "SUPERVISION" as const },
    ],
  },
  {
    id: "warehouse",
    name: "Warehouse Manager",
    rights: [
      { name: "ORDERS_EDIT", type: "ORDER_FULFILLMENT" as const },
      { name: "PODS_MANAGE", type: "ORDER_FULFILLMENT" as const },
    ],
  },
]

const PROGRAMS = [
  { id: "fp", name: "Family Planning" },
  { id: "em", name: "Essential Meds" },
]

const NODES = [
  { id: "n1", name: "FP Approval Point", facility: { id: "dh" } },
  { id: "n2", name: "EM Approval Point", facility: { id: "dh" } },
]

const FACILITIES = [
  { id: "dh", code: "DH01", name: "Balaka District Hospital" },
  { id: "w1", code: "W001", name: "Ntcheu District Warehouse" },
]

export default function Page() {
  // Open on load, so the catalog shows the dialog rather than its triggers.
  const [type, setType] = useState<RightType | undefined>("SUPERVISION")
  const [assigned, setAssigned] = useState<RoleAssignment[]>([])

  return (
    // Tall enough for the open dialog, which is fixed and so adds nothing to the frame's height.
    <div className="flex min-h-132 w-full flex-wrap content-start gap-2 p-8">
      <Button onClick={() => setType("SUPERVISION")}>
        Add Supervision Role
      </Button>
      <Button onClick={() => setType("ORDER_FULFILLMENT")} variant="outline">
        Add Fulfillment Role
      </Button>
      <AddRoleDialog
        assigned={assigned}
        facilities={FACILITIES}
        hasHomeFacility={false}
        nodes={NODES}
        onAdd={(assignment) =>
          setAssigned((current) => [...current, assignment])
        }
        onClose={() => setType(undefined)}
        programs={PROGRAMS}
        roles={ROLES}
        type={type}
        username="divo1"
      />
    </div>
  )
}
