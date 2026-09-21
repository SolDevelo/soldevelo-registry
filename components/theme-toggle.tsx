"use client"

import { MoonIcon, SunIcon } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import { useIsMounted } from "@/hooks/use-is-mounted"

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const isMounted = useIsMounted()

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      aria-label="Toggle dark mode"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      {/* Until mount the resolved theme is unknown, and rendering either icon would hydrate-mismatch. */}
      {isMounted && resolvedTheme === "dark" ? (
        <SunIcon className="size-4" aria-hidden="true" />
      ) : (
        <MoonIcon className="size-4" aria-hidden="true" />
      )}
    </Button>
  )
}
