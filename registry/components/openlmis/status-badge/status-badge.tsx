import { CheckIcon, XIcon } from "lucide-react"
import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

export type StatusTone = "success" | "destructive"

type StatusBadgeProps = {
  tone: StatusTone
  children: ReactNode
}

const TONES = {
  success: { className: "bg-success/10 text-success", icon: CheckIcon },
  destructive: { className: "bg-destructive/10 text-destructive", icon: XIcon },
} as const

/** A yes-or-no state told apart by colour and icon; its own element, as stock Badge has no success tone. */
export function StatusBadge({ tone, children }: StatusBadgeProps) {
  const { className, icon: Icon } = TONES[tone]

  return (
    <span
      className={cn(
        "inline-flex h-5 w-fit shrink-0 items-center gap-1 rounded-4xl px-2 text-xs font-medium whitespace-nowrap",
        className
      )}
    >
      <Icon aria-hidden className="size-3" />
      {children}
    </span>
  )
}
