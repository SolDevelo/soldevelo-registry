import Image from "next/image"

import { getProject } from "@/config/projects"
import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"

// Both variants render; the theme swap is pure CSS, which avoids the flicker of
// reading `resolvedTheme` at mount.
export function Logo({
  className,
  alt = siteConfig.NAME,
}: {
  className?: string
  alt?: string
}) {
  return (
    <>
      <Image
        src="/soldevelo.png"
        alt={alt}
        width={180}
        height={37}
        priority
        className={cn("block h-7 w-auto dark:hidden", className)}
      />
      <Image
        src="/soldevelo-dark.svg"
        alt={alt}
        width={825}
        height={173}
        priority
        className={cn("hidden h-7 w-auto dark:block", className)}
      />
    </>
  )
}

// The square glyph on its own, for places the full wordmark is too wide.
export function LogoMark({ className }: { className?: string }) {
  return (
    <Image
      src="/soldevelo-mark.svg"
      alt=""
      width={190}
      height={188}
      className={cn("block size-8 shrink-0", className)}
    />
  )
}

export function ProjectMark({
  project,
  className,
}: {
  project: string
  className?: string
}) {
  const entry = getProject(project)
  if (!entry) return null

  return (
    <Image
      src={entry.logo}
      alt=""
      width={200}
      height={200}
      className={cn("block size-4 shrink-0", className)}
    />
  )
}
