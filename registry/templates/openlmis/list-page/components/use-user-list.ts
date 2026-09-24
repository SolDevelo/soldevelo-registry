"use client"

import { useMemo, useState } from "react"

import type {
  UserDetails,
  UserFormValues,
} from "@/registry/blocks/openlmis/user-form-dialog/user-form"

import {
  MOCK_USERS,
  queryUsers,
  toSavedUser,
  type UsersQuery,
} from "./mock-users"

const INITIAL_QUERY: UsersQuery = {
  pageIndex: 0,
  pageSize: 10,
  sortBy: "username",
  sortDesc: false,
  search: "",
  status: "",
}

/** The list's users and state in plain React; swap `users` for your own data and `saveUser` for your save. */
export function useUserList() {
  const [users, setUsers] = useState(MOCK_USERS)
  const [query, setQuery] = useState(INITIAL_QUERY)
  const page = useMemo(() => queryUsers(users, query), [users, query])

  /** A filter or sort starts again from the first page; paging keeps the rest. */
  const update = (patch: Partial<UsersQuery>) =>
    setQuery((previous) => ({
      ...previous,
      ...patch,
      pageIndex: "pageIndex" in patch ? (patch.pageIndex ?? 0) : 0,
    }))

  /** Creates the user, or updates `existing`; returns its id, or why it could not be saved. */
  const saveUser = (
    values: UserFormValues,
    existing?: UserDetails
  ): { id: string } | { error: string } => {
    const taken = users.some(
      (user) => user.username === values.username && user.id !== existing?.id
    )
    if (taken) return { error: `Username ${values.username} is already taken.` }

    const id = existing?.id ?? `user-${users.length + 1}`
    const saved = toSavedUser(values, id, existing)
    setUsers((current) =>
      existing
        ? current.map((user) => (user.id === id ? saved : user))
        : [...current, saved]
    )
    return { id }
  }

  return {
    query,
    update,
    page,
    users,
    saveUser,
    /** Whether the rows come from a search or filter, which picks the empty state. */
    isFiltered: Boolean(query.search || query.status),
    clearFilters: () => update({ search: "", status: "" }),
  }
}
