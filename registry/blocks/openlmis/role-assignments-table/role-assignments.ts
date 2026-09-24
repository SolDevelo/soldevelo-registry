/** What a right is about; a role's rights all share one type, which is the role's type. */
export type RightType =
  | "SUPERVISION"
  | "ORDER_FULFILLMENT"
  | "REPORTS"
  | "GENERAL_ADMIN"

export type Right = {
  name: string
  type: RightType
}

export type Role = {
  id: string
  name: string
  description?: string | null
  rights: Right[]
}

export type Program = {
  id: string
  name: string
}

/** The node's facility comes as a reference only; its name is in the facilities lookup. */
export type SupervisoryNode = {
  id: string
  name: string
  facility?: { id: string } | null
}

export type Facility = {
  id: string
  code: string
  name: string
}

/** A role granted to a user; which ids are set depends on the role's type. */
export type RoleAssignment = {
  roleId: string
  programId?: string | null
  supervisoryNodeId?: string | null
  warehouseId?: string | null
}

/** The tabs of the roles page, one per role type, in the order OpenLMIS shows them. */
export const ROLE_TABS = [
  { id: "supervision", type: "SUPERVISION", label: "Supervision" },
  { id: "fulfillment", type: "ORDER_FULFILLMENT", label: "Fulfillment" },
  { id: "reports", type: "REPORTS", label: "Reports" },
  { id: "administration", type: "GENERAL_ADMIN", label: "Administration" },
] as const satisfies readonly { id: string; type: RightType; label: string }[]

export type RoleTab = (typeof ROLE_TABS)[number]

/** A supervision role with no supervisory node applies at the user's home facility. */
export function isHomeFacilityRole(assignment: RoleAssignment) {
  return Boolean(assignment.programId) && !assignment.supervisoryNodeId
}

/** Equal for two assignments that grant the same thing; the server keeps only one of them. */
export function assignmentKey(assignment: RoleAssignment) {
  const { roleId, programId, supervisoryNodeId, warehouseId } = assignment
  return [
    roleId,
    programId ?? "",
    supervisoryNodeId ?? "",
    warehouseId ?? "",
  ].join("|")
}

/** Only the ids the API reads, with empty ones left out. */
export function toSavedAssignment({
  roleId,
  programId,
  supervisoryNodeId,
  warehouseId,
}: RoleAssignment): RoleAssignment {
  return {
    roleId,
    ...(programId && { programId }),
    ...(supervisoryNodeId && { supervisoryNodeId }),
    ...(warehouseId && { warehouseId }),
  }
}

export const roleTypeOf = (role: Role | undefined): RightType | undefined =>
  role?.rights[0]?.type

/** The type an assignment belongs to: its role's, or what its ids imply if the role is gone. */
export function assignmentType(
  assignment: RoleAssignment,
  roles: ReadonlyMap<string, Role>
): RightType {
  const type = roleTypeOf(roles.get(assignment.roleId))
  if (type) return type
  if (assignment.programId) return "SUPERVISION"
  if (assignment.warehouseId) return "ORDER_FULFILLMENT"
  return "GENERAL_ADMIN"
}

/** Adds the assignments not held yet, keeping the current order, and counts both kinds. */
export function mergeAssignments(
  current: readonly RoleAssignment[],
  incoming: readonly RoleAssignment[]
) {
  const keys = new Set(current.map(assignmentKey))
  const added: RoleAssignment[] = []
  for (const assignment of incoming) {
    const key = assignmentKey(assignment)
    if (keys.has(key)) continue
    keys.add(key)
    added.push(toSavedAssignment(assignment))
  }
  return {
    assignments: [...current, ...added],
    added: added.length,
    skipped: incoming.length - added.length,
  }
}

/** How many assignments were added and removed since `saved`; zero when nothing changed. */
export function countChanges(
  saved: readonly RoleAssignment[],
  draft: readonly RoleAssignment[]
) {
  const savedKeys = new Set(saved.map(assignmentKey))
  const draftKeys = new Set(draft.map(assignmentKey))
  const added = [...draftKeys].filter((key) => !savedKeys.has(key)).length
  const removed = [...savedKeys].filter((key) => !draftKeys.has(key)).length
  return added + removed
}

export function countByType(
  assignments: readonly RoleAssignment[],
  roles: ReadonlyMap<string, Role>
) {
  const counts: Record<RightType, number> = {
    SUPERVISION: 0,
    ORDER_FULFILLMENT: 0,
    REPORTS: 0,
    GENERAL_ADMIN: 0,
  }
  for (const assignment of assignments)
    counts[assignmentType(assignment, roles)] += 1
  return counts
}

export type RoleLookups = {
  roles: ReadonlyMap<string, Role>
  programs: ReadonlyMap<string, Program>
  /** Missing while the nodes still load. */
  nodes?: ReadonlyMap<string, SupervisoryNode> | undefined
  /** Missing while the facilities still load. */
  facilities?: ReadonlyMap<string, Facility> | undefined
}

export const byId = <T extends { id: string }>(items: readonly T[]) =>
  new Map(items.map((item) => [item.id, item]))

/** One row of a roles tab; a name is undefined when its record is unknown or still loading. */
export type RoleRow = {
  id: string
  assignment: RoleAssignment
  role: string | undefined
  description: string | undefined
  program: string | undefined
  /** The supervisory node, or for a home facility role, the home facility. */
  node: string | undefined
  nodeFacility: string | undefined
  facility: string | undefined
  isHomeFacility: boolean
  /** A home facility role for a user with no home facility grants nothing. */
  isIgnored: boolean
  isUnsaved: boolean
}

type RowContext = {
  lookups: RoleLookups
  savedKeys: ReadonlySet<string>
  homeFacilityId: string | null | undefined
}

function toRoleRow(
  assignment: RoleAssignment,
  { lookups, savedKeys, homeFacilityId }: RowContext
): RoleRow {
  const key = assignmentKey(assignment)
  const role = lookups.roles.get(assignment.roleId)
  const isHomeFacility = isHomeFacilityRole(assignment)
  const node = assignment.supervisoryNodeId
    ? lookups.nodes?.get(assignment.supervisoryNodeId)
    : undefined
  const facilityName = (id: string | null | undefined) =>
    id ? lookups.facilities?.get(id)?.name : undefined

  return {
    id: key,
    assignment,
    role: role?.name,
    description: role?.description ?? undefined,
    program: assignment.programId
      ? lookups.programs.get(assignment.programId)?.name
      : undefined,
    node: node?.name,
    nodeFacility: isHomeFacility
      ? facilityName(homeFacilityId)
      : facilityName(node?.facility?.id),
    facility: facilityName(assignment.warehouseId),
    isHomeFacility,
    isIgnored: isHomeFacility && !homeFacilityId,
    isUnsaved: !savedKeys.has(key),
  }
}

/** The rows of one tab, by role, then program, then node. */
export function toRoleRows(
  assignments: readonly RoleAssignment[],
  type: RightType,
  context: RowContext
): RoleRow[] {
  const rows = assignments
    .filter(
      (assignment) => assignmentType(assignment, context.lookups.roles) === type
    )
    .map((assignment) => toRoleRow(assignment, context))
  // oxlint-disable-next-line unicorn/no-array-sort -- sorts a fresh array; toSorted needs the ES2023 lib
  return rows.sort(compareRows("role", false))
}

export const ROLE_SORT_FIELDS = ["role", "program", "node", "facility"] as const

export type RoleSortField = (typeof ROLE_SORT_FIELDS)[number]

// Ties fall through to the next field, so equal roles still list in a steady order.
const SORT_ORDER: Record<RoleSortField, RoleSortField[]> = {
  role: ["role", "program", "node", "facility"],
  program: ["program", "role", "node"],
  node: ["node", "role", "program"],
  facility: ["facility", "role"],
}

const collator = new Intl.Collator(undefined, {
  sensitivity: "base",
  numeric: true,
})

export function compareRows(field: RoleSortField, desc: boolean) {
  return (a: RoleRow, b: RoleRow) => {
    for (const key of SORT_ORDER[field]) {
      const order = collator.compare(a[key] ?? "", b[key] ?? "")
      if (order !== 0) return key === field && desc ? -order : order
    }
    return 0
  }
}

/** Lower case without accents, so "deposito" finds "Depósito". */
const fold = (text: string) =>
  text.normalize("NFD").replace(/\p{M}/gu, "").toLocaleLowerCase()

/** Rows where any shown name contains `query`, ignoring case and accents. */
export function filterRows(rows: readonly RoleRow[], query: string) {
  const term = fold(query.trim())
  if (!term) return [...rows]
  const matches = (value: string | undefined) =>
    value !== undefined && fold(value).includes(term)
  return rows.filter((row) =>
    [row.role, row.program, row.node, row.nodeFacility, row.facility].some(
      matches
    )
  )
}

// Kept as written rather than capitalized like a word.
const ACRONYMS: Record<string, string> = {
  BUQ: "BUQ",
  CCE: "CCE",
  DHIS2: "DHIS2",
  MOH: "MOH",
  PODS: "PODs",
  PORALG: "PORALG",
}

/** A right's code as words, e.g. `PODS_MANAGE` as "PODs Manage"; swap in your own labels. */
export function rightLabel(name: string) {
  return name
    .split("_")
    .filter(Boolean)
    .map(
      (word) => ACRONYMS[word] ?? word.charAt(0) + word.slice(1).toLowerCase()
    )
    .join(" ")
}
