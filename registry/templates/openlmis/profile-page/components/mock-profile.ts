// A mock signed-in user, their roles and notification settings, so the page runs with no backend.

import type { Profile } from "./profile-basic-information/profile"
import type {
  DigestConfiguration,
  DigestSubscription,
} from "./profile-notification-settings/digest"
import type {
  Facility,
  Program,
  Role,
  RoleAssignment,
  SupervisoryNode,
} from "@/registry/templates/openlmis/user-roles-page/components/role-assignments-table/role-assignments"

export const MOCK_PROFILE: Profile = {
  user: {
    id: "user-divo1",
    username: "divo1",
    firstName: "Grace",
    lastName: "Banda",
    jobTitle: "District Immunization Officer",
    homeFacility: "HC02 - Comfort Health Clinic",
  },
  contact: {
    email: "grace.banda@example.org",
    emailVerified: true,
    phoneNumber: "+265 999 123 456",
    allowNotify: true,
  },
}

export const MOCK_HOME_FACILITY_ID = "facility-hc02"

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
    ],
  },
  {
    id: "role-reports",
    name: "Report Viewer",
    description: "Views reporting rate and stock reports.",
    rights: [{ name: "REPORTS_VIEW", type: "REPORTS" }],
  },
]

export const MOCK_PROGRAMS: Program[] = [
  { id: "program-family", name: "Family Planning" },
  { id: "program-epi", name: "EPI" },
  { id: "program-essential", name: "Essential Meds" },
]

export const MOCK_FACILITIES: Facility[] = [
  { id: "facility-hc02", code: "HC02", name: "Comfort Health Clinic" },
  { id: "facility-dh01", code: "DH01", name: "Balaka District Hospital" },
  { id: "facility-ww01", code: "WH01", name: "Ninitall Warehouse" },
  { id: "facility-ww02", code: "WH02", name: "Balaka District Warehouse" },
]

export const MOCK_NODES: SupervisoryNode[] = [
  {
    id: "node-fp-approval",
    name: "FP Approval Point",
    facility: { id: "facility-dh01" },
  },
  {
    id: "node-epi-southern",
    name: "EPI Southern Region",
    facility: { id: "facility-dh01" },
  },
]

export const MOCK_ASSIGNMENTS: RoleAssignment[] = [
  { roleId: "role-storeroom", programId: "program-family" },
  { roleId: "role-storeroom", programId: "program-essential" },
  {
    roleId: "role-approver",
    programId: "program-family",
    supervisoryNodeId: "node-fp-approval",
  },
  {
    roleId: "role-approver",
    programId: "program-epi",
    supervisoryNodeId: "node-epi-southern",
  },
  { roleId: "role-warehouse", warehouseId: "facility-ww01" },
  { roleId: "role-warehouse", warehouseId: "facility-ww02" },
  { roleId: "role-reports" },
]

export const MOCK_DIGEST_CONFIGURATIONS: DigestConfiguration[] = [
  { id: "digest-action-required", tag: "requisition-actionRequired" },
  { id: "digest-status-update", tag: "requisition-statusUpdate" },
  { id: "digest-order-shipped", tag: "order-shipped" },
  { id: "digest-low-stock", tag: "stockEvent-lowStock" },
]

export const MOCK_SUBSCRIPTIONS: DigestSubscription[] = [
  {
    digestConfiguration: { id: "digest-action-required" },
    preferredChannel: "EMAIL",
    useDigest: true,
    cronExpression: "0 0 8 * * 1",
  },
  {
    digestConfiguration: { id: "digest-status-update" },
    preferredChannel: "SMS",
    useDigest: false,
  },
  {
    digestConfiguration: { id: "digest-order-shipped" },
    preferredChannel: "EMAIL",
    useDigest: true,
    cronExpression: "0 0 7 * * *",
  },
]
