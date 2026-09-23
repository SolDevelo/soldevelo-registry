"use client"

import { useEffect, useState } from "react"

type Result<T> = {
  key: string
  data: T | undefined
  error: unknown
}

/** Loads what a dialog shows, keyed so a new target never shows the last one's data; swap in your data layer. */
export function useDialogData<T>(key: string, load: () => Promise<T>) {
  const [attempt, setAttempt] = useState(0)
  const [result, setResult] = useState<Result<T> | undefined>(undefined)
  const current = `${key}#${attempt}`

  useEffect(() => {
    let active = true
    load().then(
      (data) => active && setResult({ key: current, data, error: undefined }),
      (error: unknown) =>
        active && setResult({ key: current, data: undefined, error })
    )
    // A newer target or retry supersedes this load, so its late answer is ignored.
    return () => {
      active = false
    }
    // `load` is left out: callers pass a fresh closure every render, and `key` says when it changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current])

  const settled = result?.key === current ? result : undefined

  return {
    data: settled?.data,
    error: settled?.error,
    isPending: settled === undefined,
    retry: () => setAttempt((count) => count + 1),
  }
}
