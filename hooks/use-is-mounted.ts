"use client"

import { useEffect, useState } from "react"

export function useIsMounted() {
  const [mounted, setMounted] = useState(false)

  // Deliberate: the point is to detect hydration, which only an effect can observe.
  // oxlint-disable-next-line react/set-state-in-effect
  useEffect(() => setMounted(true), [])
  return mounted
}
