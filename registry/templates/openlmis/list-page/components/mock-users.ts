// Stand-in data and server, so the page runs with no backend. Replace each function with a real call.

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

/** Searching for this shows the error state, so it can be tried without a failing server. */
const SIMULATED_FAILURE_SEARCH = "fail"

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

const FACILITIES: Facility[] = [
  { id: "facility-1", code: "HC01", name: "Balaka District Hospital" },
  { id: "facility-2", code: "HC02", name: "Comfort Health Clinic" },
  { id: "facility-3", code: "HC03", name: "Kankao Health Facility" },
  { id: "facility-4", code: "HC04", name: "Nandumbo Health Center" },
  { id: "facility-5", code: "W001", name: "Ntcheu District Warehouse" },
]

const USERS: UserDetails[] = Array.from({ length: 57 }, (_, index) => {
  const firstName = FIRST_NAMES[index % FIRST_NAMES.length] as string
  // Offset each round of first names, so no two users share a full name.
  const lastName = LAST_NAMES[
    (index + Math.floor(index / FIRST_NAMES.length)) % LAST_NAMES.length
  ] as string
  const username = `${firstName[0]}${lastName}${index + 1}`.toLowerCase()
  return {
    id: `user-${index + 1}`,
    username,
    firstName,
    lastName,
    email: index % 3 === 0 ? null : `${username}@example.org`,
    emailVerified: index % 2 === 0,
    jobTitle: null,
    phoneNumber: null,
    active: index % 4 !== 0,
    homeFacilityId: FACILITIES[index % FACILITIES.length]?.id ?? null,
    allowNotify: index % 2 === 0,
    homeFacilityRoleCount: index % 3,
  }
})

const DELAY_MS = 450

const wait = () => new Promise<void>((resolve) => setTimeout(resolve, DELAY_MS))

const toRow = ({ id, username, firstName, lastName, email, active }: User) => ({
  id,
  username,
  firstName,
  lastName,
  email,
  active,
})

export async function fetchUsers(query: UsersQuery): Promise<UsersPage> {
  await wait()

  const term = query.search.trim().toLowerCase()
  if (term === SIMULATED_FAILURE_SEARCH) {
    throw new Error("The server could not be reached.")
  }

  const matches = USERS.filter((user) => {
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

export async function fetchUser(userId: string): Promise<UserDetails> {
  await wait()
  const user = USERS.find((candidate) => candidate.id === userId)
  if (!user) throw new Error("This user no longer exists.")
  return user
}

export async function fetchFacilities(): Promise<Facility[]> {
  await wait()
  return FACILITIES
}

/** Creates the user, or updates `existing`; resolves to its id, as the dialog expects. */
export async function saveUser(
  values: UserFormValues,
  existing?: UserDetails
): Promise<string> {
  await wait()
  const taken = USERS.some(
    (user) => user.username === values.username && user.id !== existing?.id
  )
  if (taken) throw new Error(`Username ${values.username} is already taken.`)

  const saved: UserDetails = {
    id: existing?.id ?? `user-${USERS.length + 1}`,
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
  const index = USERS.findIndex((user) => user.id === saved.id)
  if (index === -1) USERS.push(saved)
  else USERS[index] = saved
  return saved.id
}

export async function sendResetEmail(_email: string): Promise<void> {
  await wait()
}

export async function setPassword(
  _username: string,
  _password: string
): Promise<void> {
  await wait()
}
