// Mock roles and rights, so the page runs with no backend. Pass your own instead.

import type {
  Right,
  Role,
} from "@/registry/blocks/openlmis/role-assignments-table/role-assignments"

/** A role as the list shows it, with how many users hold it. */
export type ListedRole = Role & { count: number }

export const MOCK_RIGHTS: Right[] = [
  { name: "REQUISITION_APPROVE", type: "SUPERVISION" },
  { name: "REQUISITION_AUTHORIZE", type: "SUPERVISION" },
  { name: "REQUISITION_CREATE", type: "SUPERVISION" },
  { name: "REQUISITION_DELETE", type: "SUPERVISION" },
  { name: "REQUISITION_VIEW", type: "SUPERVISION" },
  { name: "STOCK_CARDS_VIEW", type: "SUPERVISION" },
  { name: "STOCK_ADJUST", type: "SUPERVISION" },
  { name: "CCE_INVENTORY_VIEW", type: "SUPERVISION" },
  { name: "ORDERS_EDIT", type: "ORDER_FULFILLMENT" },
  { name: "ORDERS_VIEW", type: "ORDER_FULFILLMENT" },
  { name: "PODS_MANAGE", type: "ORDER_FULFILLMENT" },
  { name: "SHIPMENTS_EDIT", type: "ORDER_FULFILLMENT" },
  { name: "REPORTS_VIEW", type: "REPORTS" },
  { name: "REPORT_TEMPLATES_EDIT", type: "REPORTS" },
  { name: "USERS_MANAGE", type: "GENERAL_ADMIN" },
  { name: "USER_ROLES_MANAGE", type: "GENERAL_ADMIN" },
  { name: "FACILITIES_MANAGE", type: "GENERAL_ADMIN" },
  { name: "PRODUCTS_MANAGE", type: "GENERAL_ADMIN" },
]

const rights = (...names: string[]) =>
  MOCK_RIGHTS.filter((right) => names.includes(right.name))

export const MOCK_ROLES: ListedRole[] = [
  {
    id: "role-storeroom",
    name: "Storeroom Manager",
    description: "Creates and submits requisitions for a facility.",
    rights: rights(
      "REQUISITION_CREATE",
      "REQUISITION_VIEW",
      "REQUISITION_DELETE"
    ),
    count: 48,
  },
  {
    id: "role-approver",
    name: "Program Supervisor",
    description: "Authorizes and approves requisitions under a node.",
    rights: rights(
      "REQUISITION_AUTHORIZE",
      "REQUISITION_APPROVE",
      "REQUISITION_VIEW"
    ),
    count: 12,
  },
  {
    id: "role-stock",
    name: "Stock Manager",
    description: "Keeps stock cards up to date and records adjustments.",
    rights: rights("STOCK_CARDS_VIEW", "STOCK_ADJUST"),
    count: 31,
  },
  {
    id: "role-cce",
    name: "Cold Chain Technician",
    description: "Checks the cold chain equipment inventory.",
    rights: rights("CCE_INVENTORY_VIEW"),
    count: 6,
  },
  {
    id: "role-warehouse",
    name: "Warehouse Manager",
    description: "Fulfills orders and records proofs of delivery.",
    rights: rights(
      "ORDERS_VIEW",
      "ORDERS_EDIT",
      "PODS_MANAGE",
      "SHIPMENTS_EDIT"
    ),
    count: 4,
  },
  {
    id: "role-dispatcher",
    name: "Dispatcher",
    description: "Views orders waiting to ship.",
    rights: rights("ORDERS_VIEW"),
    count: 0,
  },
  {
    id: "role-reports",
    name: "Report Viewer",
    description: "Views reporting rate and stock reports.",
    rights: rights("REPORTS_VIEW"),
    count: 22,
  },
  {
    id: "role-report-author",
    name: "Report Author",
    description: "Edits the templates reports are built from.",
    rights: rights("REPORTS_VIEW", "REPORT_TEMPLATES_EDIT"),
    count: 2,
  },
  {
    id: "role-admin",
    name: "System Administrator",
    description: "Manages users, roles, facilities and products.",
    rights: rights(
      "USERS_MANAGE",
      "USER_ROLES_MANAGE",
      "FACILITIES_MANAGE",
      "PRODUCTS_MANAGE"
    ),
    count: 3,
  },
  {
    id: "role-user-admin",
    name: "User Administrator",
    description: "Adds users and gives them roles.",
    rights: rights("USERS_MANAGE", "USER_ROLES_MANAGE"),
    count: 5,
  },
  // Saved before roles held one type, so editing it warns that the report right is dropped.
  {
    id: "role-district-pharmacist",
    name: "District Pharmacist",
    description: "Approves requisitions and views reports.",
    rights: rights("REQUISITION_APPROVE", "REPORTS_VIEW"),
    count: 9,
  },
  // Saved without rights, so it has no type yet.
  {
    id: "role-draft",
    name: "Data Clerk",
    description: null,
    rights: [],
    count: 0,
  },
]
