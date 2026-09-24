// Mock users, roles and reference data, so the page runs with no backend. Pass your own instead.

import type {
  Facility,
  Program,
  Role,
  RoleAssignment,
  SupervisoryNode,
} from "@/registry/blocks/openlmis/role-assignments-table/role-assignments"

export type RolesUser = {
  id: string
  username: string
  firstName: string
  lastName: string
  homeFacilityId: string | null
  roleAssignments: RoleAssignment[]
}

export const MOCK_ROLES: Role[] = [
  {
    id: "role-storeroom",
    name: "Storeroom Manager",
    description: "Creates and submits requisitions for a facility.",
    rights: [
      { name: "REQUISITION_CREATE", type: "SUPERVISION" },
      { name: "REQUISITION_VIEW", type: "SUPERVISION" },
      { name: "REQUISITION_DELETE", type: "SUPERVISION" },
    ],
  },
  {
    id: "role-approver",
    name: "Program Supervisor",
    description: "Authorizes and approves requisitions under a node.",
    rights: [
      { name: "REQUISITION_AUTHORIZE", type: "SUPERVISION" },
      { name: "REQUISITION_APPROVE", type: "SUPERVISION" },
      { name: "REQUISITION_VIEW", type: "SUPERVISION" },
    ],
  },
  {
    id: "role-warehouse",
    name: "Warehouse Manager",
    description: "Fulfills orders and records proofs of delivery.",
    rights: [
      { name: "ORDERS_VIEW", type: "ORDER_FULFILLMENT" },
      { name: "ORDERS_EDIT", type: "ORDER_FULFILLMENT" },
      { name: "PODS_MANAGE", type: "ORDER_FULFILLMENT" },
      { name: "SHIPMENTS_EDIT", type: "ORDER_FULFILLMENT" },
    ],
  },
  {
    id: "role-reports",
    name: "Report Viewer",
    description: "Views reporting rate and stock reports.",
    rights: [{ name: "REPORTS_VIEW", type: "REPORTS" }],
  },
  {
    id: "role-admin",
    name: "System Administrator",
    description: "Manages users, facilities and reference data.",
    rights: [
      { name: "USERS_MANAGE", type: "GENERAL_ADMIN" },
      { name: "USER_ROLES_MANAGE", type: "GENERAL_ADMIN" },
      { name: "FACILITIES_MANAGE", type: "GENERAL_ADMIN" },
      { name: "CCE_MANAGE", type: "GENERAL_ADMIN" },
    ],
  },
]

export const MOCK_PROGRAMS: Program[] = [
  { id: "program-fp", name: "Family Planning" },
  { id: "program-em", name: "Essential Meds" },
  { id: "program-arv", name: "ARV" },
]

export const MOCK_FACILITIES: Facility[] = [
  { id: "facility-1", code: "HC01", name: "Comfort Health Clinic" },
  { id: "facility-2", code: "HC02", name: "Nandumbo Health Center" },
  { id: "facility-3", code: "DH01", name: "Balaka District Hospital" },
  { id: "facility-4", code: "W001", name: "Ntcheu District Warehouse" },
  { id: "facility-5", code: "W002", name: "Balaka District Warehouse" },
]

export const MOCK_NODES: SupervisoryNode[] = [
  { id: "node-1", name: "FP Approval Point", facility: { id: "facility-3" } },
  { id: "node-2", name: "EM Approval Point", facility: { id: "facility-3" } },
  { id: "node-3", name: "ARV Approval Point", facility: { id: "facility-2" } },
]

export const MOCK_USERS: RolesUser[] = [
  {
    id: "user-1",
    username: "divo1",
    firstName: "Grace",
    lastName: "Banda",
    homeFacilityId: "facility-1",
    roleAssignments: [
      { roleId: "role-storeroom", programId: "program-fp" },
      { roleId: "role-storeroom", programId: "program-em" },
      {
        roleId: "role-approver",
        programId: "program-fp",
        supervisoryNodeId: "node-1",
      },
      { roleId: "role-warehouse", warehouseId: "facility-4" },
      { roleId: "role-reports" },
    ],
  },
  {
    id: "user-2",
    username: "administrator",
    firstName: "Alan",
    lastName: "Mwale",
    homeFacilityId: "facility-3",
    roleAssignments: [
      { roleId: "role-admin" },
      { roleId: "role-reports" },
      {
        roleId: "role-approver",
        programId: "program-em",
        supervisoryNodeId: "node-2",
      },
      { roleId: "role-warehouse", warehouseId: "facility-5" },
    ],
  },
  {
    id: "user-3",
    username: "srmanager2",
    firstName: "Tendai",
    lastName: "Okafor",
    homeFacilityId: null,
    roleAssignments: [{ roleId: "role-storeroom", programId: "program-arv" }],
  },
]

export const MOCK_USER_ID = "user-1"
