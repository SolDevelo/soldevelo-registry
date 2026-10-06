"use client"

import { useState } from "react"

import {
  assignmentKey,
  byId,
  type RoleAssignment,
  ROLE_TABS,
  toRoleRows,
} from "./role-assignments"
import { RoleAssignmentsTable } from "./role-assignments-table"

const lookups = {
  roles: byId([
    {
      id: "storeroom",
      name: "Storeroom Manager",
      rights: [
        { name: "REQUISITION_CREATE", type: "SUPERVISION" as const },
        { name: "REQUISITION_VIEW", type: "SUPERVISION" as const },
      ],
    },
    {
      id: "warehouse",
      name: "Warehouse Manager",
      rights: [{ name: "PODS_MANAGE", type: "ORDER_FULFILLMENT" as const }],
    },
    {
      id: "approver",
      name: "Program Supervisor",
      description: "Approves requisitions for the programs it supervises.",
      rights: [{ name: "REQUISITION_APPROVE", type: "SUPERVISION" as const }],
    },
  ]),
  programs: byId([
    { id: "fp", name: "Family Planning" },
    { id: "em", name: "Essential Meds" },
    { id: "arv", name: "ARV" },
  ]),
  nodes: byId([
    { id: "n1", name: "FP Approval Point", facility: { id: "dh" } },
    { id: "n2", name: "EM Approval Point", facility: { id: "dh" } },
  ]),
  facilities: byId([
    { id: "hc", code: "HC01", name: "Comfort Health Clinic" },
    { id: "dh", code: "DH01", name: "Balaka District Hospital" },
  ]),
}

const SAVED: RoleAssignment[] = [
  { roleId: "storeroom", programId: "fp" },
  { roleId: "storeroom", programId: "em" },
  { roleId: "approver", programId: "fp", supervisoryNodeId: "n1" },
]

const [supervision, fulfillment, reports] = ROLE_TABS
const STATUS = { nodes: "ready", facilities: "ready" } as const
const savedKeys = new Set(SAVED.map(assignmentKey))
const context = { lookups, savedKeys, homeFacilityId: "hc" }
const HELD: RoleAssignment[] = [{ roleId: "warehouse", warehouseId: "dh" }]
const fulfillmentRows = toRoleRows(HELD, fulfillment.type, {
  ...context,
  savedKeys: new Set(HELD.map(assignmentKey)),
})

export default function Page() {
  // One unsaved addition, so the Unsaved badge shows.
  const [draft, setDraft] = useState<RoleAssignment[]>([
    ...SAVED,
    { roleId: "approver", programId: "em", supervisoryNodeId: "n2" },
  ])
  const rows = toRoleRows(draft, supervision.type, context)

  return (
    <div className="flex w-full max-w-4xl flex-col gap-8 p-8">
      <RoleAssignmentsTable
        onAdd={() => undefined}
        onRemove={(row) =>
          setDraft((current) =>
            current.filter((assignment) => assignment !== row.assignment)
          )
        }
        rows={rows}
        status={STATUS}
        tab={supervision}
      />
      {/* Read-only, as on a user's own profile: no Add Role and no row menu. */}
      <RoleAssignmentsTable
        rows={fulfillmentRows}
        status={STATUS}
        tab={fulfillment}
      />
      <RoleAssignmentsTable rows={[]} status={STATUS} tab={reports} />
    </div>
  )
}
