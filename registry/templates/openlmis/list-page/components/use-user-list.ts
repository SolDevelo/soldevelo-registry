"use client"

import { useEffect, useState } from "react"

import { fetchUsers, type UsersPage, type UsersQuery } from "./mock-users"

const INITIAL_QUERY: UsersQuery = {
  pageIndex: 0,
  pageSize: 10,
  sortBy: "username",
  sortDesc: false,
  search: "",
  status: "",
}

// Each answer records the request it belongs to, so loading is derived rather than stored.
type ListResult = {
  key: string | undefined
  data: UsersPage | undefined
  error: Error | undefined
}

/** List state and its data in plain React; swap in URL search params or React Query as needed. */
export function useUserList() {
  const [query, setQuery] = useState(INITIAL_QUERY)
  const [attempt, setAttempt] = useState(0)
  const [result, setResult] = useState<ListResult>({
    key: undefined,
    data: undefined,
    error: undefined,
  })
  const key = `${JSON.stringify(query)}#${attempt}`

  useEffect(() => {
    let current = true

    const load = async () => {
      try {
        const data = await fetchUsers(query)
        if (current) setResult({ key, data, error: undefined })
      } catch (error) {
        if (current) {
          setResult({ key, data: undefined, error: error as Error })
        }
      }
    }
    void load()

    // A newer request supersedes this one, so its late answer is ignored.
    return () => {
      current = false
    }
  }, [key, query])

  const isLoading = result.key !== key

  /** A filter or sort starts again from the first page; paging keeps the rest. */
  const update = (patch: Partial<UsersQuery>) =>
    setQuery((previous) => {
      const next = {
        ...previous,
        ...patch,
        pageIndex: "pageIndex" in patch ? (patch.pageIndex ?? 0) : 0,
      }
      // An update that changes nothing keeps the same query, so it fetches nothing.
      const changed = (Object.keys(next) as (keyof UsersQuery)[]).some(
        (field) => next[field] !== previous[field]
      )
      return changed ? next : previous
    })

  return {
    query,
    update,
    data: result.data,
    error: isLoading ? undefined : result.error,
    /** Rows are on screen from an earlier request while the next one loads. */
    isStale: isLoading && result.data !== undefined,
    retry: () => setAttempt((count) => count + 1),
    clearFilters: () => update({ search: "", status: "" }),
  }
}
