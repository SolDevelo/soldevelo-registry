"use client"

import { MoonIcon, SunIcon } from "lucide-react"
import { useTheme } from "next-themes"

import { Kbd } from "@/components/ui/kbd"

// The icon swaps through the `dark` variant rather than `resolvedTheme`, so it
// renders identically on the server and never mismatches on hydration.
export function FooterThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()

  return (
    <button
      type="button"
      aria-label="Toggle theme"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="inline-flex h-8 items-center gap-2 rounded-md border bg-muted/40 py-1 pr-1.5 pl-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none"
    >
      <SunIcon
        aria-hidden="true"
        className="hidden size-4 shrink-0 dark:block"
      />
      <MoonIcon aria-hidden="true" className="size-4 shrink-0 dark:hidden" />
      <span>Toggle Theme</span>
      <Kbd className="ml-6">D</Kbd>
    </button>
  )
}
