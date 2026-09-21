"use client"

import { useCallback, useEffect, useState } from "react"

// Reads after mount, never during render: localStorage is unavailable on the server and would hydrate-mismatch.
export function useLocalStorage<T extends string>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial)

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(key)
      // Deliberate: localStorage does not exist on the server, so reading it during render would mismatch.
      // oxlint-disable-next-line react/set-state-in-effect
      if (stored) setValue(stored as T)
    } catch {
      // Storage can be disabled; the in-memory default is a fine fallback.
    }
  }, [key])

  const set = useCallback(
    (next: T) => {
      setValue(next)
      try {
        window.localStorage.setItem(key, next)
      } catch {
        // Ignore: the selection still applies for this session.
      }
    },
    [key]
  )

  return [value, set] as const
}
