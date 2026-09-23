// Stand-in data and server, so the page runs with no backend. Replace `fetchUsers` with a real call.

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
export const SIMULATED_FAILURE_SEARCH = "fail"

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

const USERS: User[] = Array.from({ length: 57 }, (_, index) => {
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
    active: index % 4 !== 0,
  }
})

const DELAY_MS = 450

export async function fetchUsers(query: UsersQuery): Promise<UsersPage> {
  await new Promise((resolve) => setTimeout(resolve, DELAY_MS))

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

  const sorted = matches.toSorted((a, b) => {
    const order = String(a[query.sortBy]).localeCompare(String(b[query.sortBy]))
    return query.sortDesc ? -order : order
  })

  const start = query.pageIndex * query.pageSize
  return {
    rows: sorted.slice(start, start + query.pageSize),
    total: matches.length,
  }
}
