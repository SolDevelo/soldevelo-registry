"use client"

import { useEffect, useState } from "react"

// True once the page is scrolled past `threshold`. Passive listener: this only reads scroll position.
export function useScroll(threshold = 8) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > threshold)
    }

    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [threshold])

  return scrolled
}
