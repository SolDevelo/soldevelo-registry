import { CheckIcon, XIcon } from "lucide-react"
import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

export type StatusTone = "success" | "destructive"

type StatusBadgeProps = {
  tone: StatusTone
  children: ReactNode
}

const TONE_CLASSES: Record<StatusTone, string> = {
  success: "bg-success/10 text-success",
  destructive: "bg-destructive/10 text-destructive",
}

const TONE_ICON = { success: CheckIcon, destructive: XIcon } as const

/** A yes-or-no state, such as active or inactive, told apart by colour and by icon. */
export function StatusBadge({ tone, children }: StatusBadgeProps) {
  const Icon = TONE_ICON[tone]

  // Its own element rather than Badge, whose stock variants have no success tone.
  return (
    <span
      className={cn(
        "inline-flex h-5 w-fit shrink-0 items-center gap-1 rounded-4xl px-2 text-xs font-medium whitespace-nowrap",
        TONE_CLASSES[tone]
      )}
      data-slot="badge"
    >
      <Icon aria-hidden className="size-3" />
      {children}
    </span>
  )
}
