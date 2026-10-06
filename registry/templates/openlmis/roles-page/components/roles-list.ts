import {
  type RightType,
  type Role,
  roleTypeOf,
} from "@/registry/blocks/openlmis/role-assignments/role-assignments"
import { ROLE_TYPES } from "./role-form-dialog/role-form"

import type { ListedRole } from "./mock-roles"

export const ROLE_SORT_FIELDS = ["name", "type", "count"] as const

export type RoleSortField = (typeof ROLE_SORT_FIELDS)[number]

export type RolesQuery = {
  search: string
  /** An empty string means every type. */
  type: RightType | ""
  sortBy: RoleSortField
  sortDesc: boolean
  pageIndex: number
  pageSize: number
}

// Folds case and accents, so "sante" finds "Santé".
const fold = (text: string) =>
  text.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase()

export function filterRoles(
  roles: readonly ListedRole[],
  { search, type }: Pick<RolesQuery, "search" | "type">
) {
  const term = fold(search.trim())
  return roles.filter(
    (role) =>
      (!type || roleTypeOf(role) === type) &&
      (!term ||
        [role.name, role.description ?? ""].some((text) =>
          fold(text).includes(term)
        ))
  )
}

const byName = (a: Role, b: Role) =>
  a.name.localeCompare(b.name, undefined, { sensitivity: "base" })

// A role with no rights has no type, so it sorts after the four.
const typeRank = (role: Role) => {
  const index = ROLE_TYPES.findIndex((item) => item.type === roleTypeOf(role))
  return index === -1 ? ROLE_TYPES.length : index
}

const COMPARE: Record<RoleSortField, (a: ListedRole, b: ListedRole) => number> =
  {
    name: byName,
    type: (a, b) => typeRank(a) - typeRank(b),
    count: (a, b) => a.count - b.count,
  }

export function sortRoles(
  roles: readonly ListedRole[],
  field: RoleSortField,
  desc: boolean
) {
  const compare = COMPARE[field]
  // oxlint-disable-next-line unicorn/no-array-sort -- sorts a fresh copy; toSorted needs the ES2023 lib
  return [...roles].sort(
    (a, b) => (desc ? -compare(a, b) : compare(a, b)) || byName(a, b)
  )
}
