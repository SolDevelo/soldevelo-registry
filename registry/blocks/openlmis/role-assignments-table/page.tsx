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
      rights: [{ name: "REQUISITION_CREATE", type: "SUPERVISION" as const }],
    },
    {
      id: "approver",
      name: "Program Supervisor",
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

const tab = ROLE_TABS[0]

export default function Page() {
  // One unsaved addition, so the Unsaved badge shows.
  const [draft, setDraft] = useState<RoleAssignment[]>([
    ...SAVED,
    { roleId: "approver", programId: "em", supervisoryNodeId: "n2" },
  ])
  const rows = toRoleRows(draft, tab.type, {
    lookups,
    savedKeys: new Set(SAVED.map(assignmentKey)),
    homeFacilityId: "hc",
  })

  return (
    <div className="w-full max-w-4xl p-8">
      <RoleAssignmentsTable
        onAdd={() => undefined}
        onRemove={(row) =>
          setDraft((current) =>
            current.filter((assignment) => assignment !== row.assignment)
          )
        }
        onViewRights={() => undefined}
        rows={rows}
        status={{ nodes: "ready", facilities: "ready" }}
        tab={tab}
      />
    </div>
  )
}
