"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import type { Role } from "@/registry/blocks/openlmis/role-assignments-table/role-assignments"

import { RoleRightsDialog } from "./role-rights-dialog"

const ROLE: Role = {
  id: "warehouse",
  name: "Warehouse Manager",
  description: "Fulfills orders and records proofs of delivery.",
  rights: [
    { name: "ORDERS_VIEW", type: "ORDER_FULFILLMENT" },
    { name: "ORDERS_EDIT", type: "ORDER_FULFILLMENT" },
    { name: "PODS_MANAGE", type: "ORDER_FULFILLMENT" },
    { name: "SHIPMENTS_EDIT", type: "ORDER_FULFILLMENT" },
  ],
}

export default function Page() {
  // Open on load, so the catalog shows the dialog rather than its trigger.
  const [role, setRole] = useState<Role | undefined>(ROLE)

  return (
    // Tall enough for the open dialog, which is fixed and so adds nothing to the frame's height.
    <div className="min-h-96 w-full p-8">
      <Button onClick={() => setRole(ROLE)} variant="outline">
        View Rights
      </Button>
      <RoleRightsDialog onClose={() => setRole(undefined)} role={role} />
    </div>
  )
}
