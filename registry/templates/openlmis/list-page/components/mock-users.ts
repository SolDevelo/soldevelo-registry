// Mock users and the rules the list applies to them, so the page runs with no backend.

import type {
  Facility,
  UserDetails,
  UserFormValues,
} from "@/registry/blocks/openlmis/user-form-dialog/user-form"

export type User = {
  id: string
  username: string
  firstName: string
  lastName: string
  email: string | null
  active: boolean
}

export type UsersQuery = {
  pageIndex: number
  pageSize: number
  sortBy: "username" | "lastName" | "active"
  sortDesc: boolean
  /** Matches username, first or last name, or email. */
  search: string
  status: "" | "active" | "inactive"
}

export type UsersPage = {
  rows: User[]
  total: number
}

const FIRST_NAMES = [
  "Adora",
  "Alan",
  "Chimango",
  "Grace",
  "Ibrahim",
  "Lindiwe",
  "Mateus",
  "Nia",
  "Omar",
  "Priya",
  "Tendai",
  "Zara",
]
const LAST_NAMES = [
  "Adamovich",
  "Banda",
  "Costa",
  "Diallo",
  "Ehrenfreund",
  "Hopper",
  "Kamau",
  "Mwale",
  "Okafor",
  "Silva",
  "Tebulo",
  "Zulu",
]

export const MOCK_FACILITIES: Facility[] = [
  { id: "facility-1", code: "HC01", name: "Balaka District Hospital" },
  { id: "facility-2", code: "HC02", name: "Comfort Health Clinic" },
  { id: "facility-3", code: "HC03", name: "Kankao Health Facility" },
  { id: "facility-4", code: "HC04", name: "Nandumbo Health Center" },
  { id: "facility-5", code: "W001", name: "Ntcheu District Warehouse" },
]

export const MOCK_USERS: UserDetails[] = Array.from(
  { length: 57 },
  (_, index) => {
    const firstName = FIRST_NAMES[index % FIRST_NAMES.length] as string
    // Offset each round of first names, so no two users share a full name.
    const lastName = LAST_NAMES[
      (index + Math.floor(index / FIRST_NAMES.length)) % LAST_NAMES.length
    ] as string
    const username = `${firstName[0]}${lastName}${index + 1}`.toLowerCase()
    const email = index % 3 === 0 ? null : `${username}@example.org`
    // Only an address can be verified, and notifications need a verified one.
    const verified = email !== null && index % 2 === 0
    return {
      id: `user-${index + 1}`,
      username,
      firstName,
      lastName,
      email,
      emailVerified: verified,
      jobTitle: null,
      phoneNumber: null,
      active: index % 4 !== 0,
      homeFacilityId:
        MOCK_FACILITIES[index % MOCK_FACILITIES.length]?.id ?? null,
      allowNotify: verified,
      homeFacilityRoleCount: index % 3,
    }
  }
)

const toRow = ({ id, username, firstName, lastName, email, active }: User) => ({
  id,
  username,
  firstName,
  lastName,
  email,
  active,
})

/** One page of `users` for the list's search, filter, sort and paging. */
export function queryUsers(
  users: readonly UserDetails[],
  query: UsersQuery
): UsersPage {
  const term = query.search.trim().toLowerCase()
  const matches = users.filter((user) => {
    const text = `${user.username} ${user.firstName} ${user.lastName} ${user.email ?? ""}`
    const status =
      query.status === "" || user.active === (query.status === "active")
    return status && text.toLowerCase().includes(term)
  })

  // oxlint-disable-next-line unicorn/no-array-sort -- sorts a copy; toSorted needs the ES2023 lib
  const sorted = [...matches].sort((a, b) => {
    const order = String(a[query.sortBy]).localeCompare(String(b[query.sortBy]))
    return query.sortDesc ? -order : order
  })

  const start = query.pageIndex * query.pageSize
  return {
    rows: sorted.slice(start, start + query.pageSize).map(toRow),
    total: matches.length,
  }
}

/** The user the form describes, created or updated from `existing`. */
export function toSavedUser(
  values: UserFormValues,
  id: string,
  existing?: UserDetails
): UserDetails {
  return {
    id,
    username: values.username,
    firstName: values.firstName,
    lastName: values.lastName,
    email: values.email || null,
    // A changed address has to be verified again.
    emailVerified:
      existing !== undefined &&
      existing.emailVerified &&
      existing.email === (values.email || null),
    jobTitle: values.jobTitle || null,
    phoneNumber: values.phoneNumber || null,
    active: values.active,
    homeFacilityId: values.homeFacilityId,
    allowNotify: values.allowNotify,
    homeFacilityRoleCount: values.removeHomeFacilityRoles
      ? 0
      : (existing?.homeFacilityRoleCount ?? 0),
  }
}
