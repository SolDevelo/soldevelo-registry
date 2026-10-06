"use client"

import { useMemo, useState } from "react"

import {
  ROLE_TABS,
  byId,
  type RoleAssignment,
  type RoleRow,
  assignmentKey,
  toRoleRows,
} from "./role-assignments"
import { RoleAssignmentsTable } from "./role-assignments-table"

const lookups = {
  roles: byId([
    {
      id: "storeroom",
      name: "Storeroom Manager",
      description: "Creates and submits requisitions for a facility.",
      rights: [
        { name: "REQUISITION_CREATE", type: "SUPERVISION" as const },
        { name: "REQUISITION_VIEW", type: "SUPERVISION" as const },
      ],
    },
    {
      id: "approver",
      name: "Program Supervisor",
      description: "Authorizes and approves requisitions under a node.",
      rights: [
        { name: "REQUISITION_AUTHORIZE", type: "SUPERVISION" as const },
        { name: "REQUISITION_APPROVE", type: "SUPERVISION" as const },
      ],
    },
  ]),
  programs: byId([
    { id: "fp", name: "Family Planning" },
    { id: "em", name: "Essential Meds" },
  ]),
  nodes: byId([
    { id: "fp-node", name: "FP Approval Point", facility: { id: "dh" } },
  ]),
  facilities: byId([
    { id: "hc", code: "HC01", name: "Comfort Health Clinic" },
    { id: "dh", code: "DH01", name: "Balaka District Hospital" },
  ]),
}

const SAVED: RoleAssignment[] = [
  { roleId: "storeroom", programId: "fp" },
  { roleId: "approver", programId: "fp", supervisoryNodeId: "fp-node" },
]
const UNSAVED: RoleAssignment = { roleId: "storeroom", programId: "em" }
const savedKeys = new Set(SAVED.map(assignmentKey))
const status = { nodes: "ready", facilities: "ready" } as const

export default function Page() {
  const [assignments, setAssignments] = useState([...SAVED, UNSAVED])
  const rows = useMemo(
    () =>
      toRoleRows(assignments, "SUPERVISION", {
        lookups,
        savedKeys,
        homeFacilityId: "hc",
      }),
    [assignments]
  )
  const remove = (row: RoleRow) =>
    setAssignments((current) =>
      current.filter((assignment) => assignmentKey(assignment) !== row.id)
    )

  return (
    <div className="w-full max-w-5xl p-8">
      <RoleAssignmentsTable
        // The preview has no add dialog, so Add Role brings back removed rows.
        onAdd={() => setAssignments([...SAVED, UNSAVED])}
        onRemove={remove}
        rows={rows}
        status={status}
        tab={ROLE_TABS[0]}
      />
    </div>
  )
}
