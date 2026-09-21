"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "motion/react"
import { MenuIcon, SearchIcon } from "lucide-react"
import * as React from "react"

import { GitHubIcon } from "@/components/icons"
import { Logo } from "@/components/logo"
import { SiteSearch } from "@/components/site-search"
import { Button } from "@/components/ui/button"
import { Kbd, KbdGroup } from "@/components/ui/kbd"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { siteConfig } from "@/config/site"
import { useScroll } from "@/hooks/use-scroll"
import type { SearchEntry } from "@/lib/registry-data"
import { cn } from "@/lib/utils"

const NAV = [
  { href: "/components", label: "Components" },
  { href: "/blocks", label: "Blocks" },
  { href: "/templates", label: "Templates" },
  { href: "/docs", label: "Docs" },
]

// The header remounts when navigating between the home page and the catalog
// layout, so the intro is gated on a module flag: once per page load, not once
// per route change.
let introPlayed = false

// The drawer adds Home, which the logo covers on wider screens.
const MOBILE_NAV = [{ href: "/", label: "Home" }, ...NAV]

// "/" would prefix-match every route, so it is the one that needs an exact test.
function isActive(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname.startsWith(href)
}

// Next skips a navigation to the route you are already on, so a link back to the
// current page does nothing at all. Scroll to the top instead, which is what the
// logo and an active nav link are reaching for.
function useSameRouteScrollToTop(pathname: string) {
  return React.useCallback(
    (href: string) => (event: React.MouseEvent) => {
      if (href !== pathname) return

      event.preventDefault()
      window.scrollTo({
        top: 0,
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
      })
    },
    [pathname]
  )
}

export function SiteHeader({ entries }: { entries: SearchEntry[] }) {
  const [searchOpen, setSearchOpen] = React.useState(false)
  const [menuOpen, setMenuOpen] = React.useState(false)
  const pathname = usePathname()
  const hasScrolled = useScroll()
  const scrollToTopIfHere = useSameRouteScrollToTop(pathname)
  const [playIntro] = React.useState(() => !introPlayed)

  React.useEffect(() => {
    introPlayed = true
  }, [])

  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key?.toLowerCase() !== "k") return
      if (!event.metaKey && !event.ctrlKey) return

      event.preventDefault()
      setSearchOpen((previous) => !previous)
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  return (
    <motion.header
      initial={playIntro ? { opacity: 0, y: -12 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={
        playIntro ? { duration: 0.5, ease: [0.16, 1, 0.3, 1] } : { duration: 0 }
      }
      className={cn(
        // Transparent and borderless at rest; the bar only separates itself from
        // the page once there is content scrolled underneath it.
        "sticky top-0 z-50 w-full border-b border-transparent transition-colors duration-200 ease-out",
        hasScrolled && "border-border bg-background/70 backdrop-blur"
      )}
    >
      {/* Three equal tracks, so the nav stays optically centred however wide the
          brand or the actions get. */}
      {/* Columns are placed explicitly: the nav is `display: none` below md, which drops it
          out of the grid entirely and would otherwise slide the actions into its column. */}
      <div className="mx-auto grid h-18 w-full max-w-5xl grid-cols-header items-center gap-4 px-4">
        <Link
          href="/"
          aria-label={`${siteConfig.NAME} home`}
          onClick={scrollToTopIfHere("/")}
          className="col-start-1 w-fit rounded-md focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none"
        >
          <Logo />
        </Link>

        <nav
          aria-label="Main"
          className="col-start-2 hidden items-center gap-1 md:flex"
        >
          {NAV.map((item) => {
            const active = isActive(pathname, item.href)

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={scrollToTopIfHere(item.href)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-md px-3 py-2 text-sm transition-colors focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none",
                  active
                    ? "bg-muted font-medium text-foreground"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                )}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="col-start-3 flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            nativeButton={false}
            className="hidden md:inline-flex"
            render={
              <a
                href={siteConfig.REPO}
                aria-label={`${siteConfig.NAME} source on GitHub`}
                target="_blank"
                rel="noopener noreferrer"
              />
            }
          >
            <GitHubIcon className="size-4" aria-hidden="true" />
          </Button>

          <button
            type="button"
            aria-label="Search the registry"
            onClick={() => setSearchOpen(true)}
            className="hidden h-9 items-center gap-2 rounded-md border bg-muted/40 py-1 pr-1.5 pl-3 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none sm:inline-flex"
          >
            <SearchIcon className="size-4 shrink-0" aria-hidden="true" />
            <span>Search</span>
            <KbdGroup className="ml-6">
              <Kbd>Ctrl</Kbd>
              <Kbd>K</Kbd>
            </KbdGroup>
          </button>

          <Button
            variant="ghost"
            size="icon"
            aria-label="Search the registry"
            onClick={() => setSearchOpen(true)}
            className="sm:hidden"
          >
            <SearchIcon className="size-4" aria-hidden="true" />
          </Button>

          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Open menu"
                  className="md:hidden"
                />
              }
            >
              <MenuIcon className="size-4" aria-hidden="true" />
            </SheetTrigger>

            <SheetContent side="right" className="p-4">
              <SheetHeader className="items-start p-0">
                <SheetTitle className="sr-only">Menu</SheetTitle>
                <Logo />
              </SheetHeader>

              <nav aria-label="Main" className="flex flex-col gap-1 pt-4">
                {MOBILE_NAV.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={(event) => {
                      setMenuOpen(false)
                      scrollToTopIfHere(item.href)(event)
                    }}
                    aria-current={
                      isActive(pathname, item.href) ? "page" : undefined
                    }
                    className={cn(
                      "rounded-md px-3 py-2 text-sm transition-colors",
                      isActive(pathname, item.href)
                        ? "bg-muted font-medium text-foreground"
                        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>

              {/* SheetContent is a column flex, so `mt-auto` pins this to the bottom. */}
              <Button
                size="lg"
                nativeButton={false}
                className="mt-auto w-full"
                render={
                  <a
                    href={siteConfig.REPO}
                    aria-label={`${siteConfig.NAME} source on GitHub`}
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                }
              >
                <GitHubIcon data-icon="inline-start" aria-hidden="true" />
                Source
              </Button>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <SiteSearch
        open={searchOpen}
        onOpenChange={setSearchOpen}
        entries={entries}
      />
    </motion.header>
  )
}
