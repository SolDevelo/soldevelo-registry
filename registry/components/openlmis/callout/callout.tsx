import {
  CircleCheckIcon,
  InfoIcon,
  type LucideIcon,
  TriangleAlertIcon,
} from "lucide-react"
import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

export type CalloutTone = "info" | "warning" | "success"

// Tinted by tone while the text keeps the foreground colours, which read on every tint.
const TONES = {
  info: {
    className: "border-info/30 bg-info/10",
    iconClass: "text-info",
    icon: InfoIcon,
  },
  warning: {
    className: "border-warning/30 bg-warning/10",
    iconClass: "text-warning",
    icon: TriangleAlertIcon,
  },
  success: {
    className: "border-success/30 bg-success/10",
    iconClass: "text-success",
    icon: CircleCheckIcon,
  },
} as const satisfies Record<
  CalloutTone,
  { className: string; iconClass: string; icon: LucideIcon }
>

type CalloutProps = {
  tone: CalloutTone
  title: ReactNode
  children?: ReactNode
  /** A button at the end, such as Undo. */
  action?: ReactNode
}

/** A message in a state's colour, with its own icon so it reads without relying on colour; its own element, as stock Alert has no warning, info or success tone. */
export function Callout({ tone, title, children, action }: CalloutProps) {
  const { className, iconClass, icon: Icon } = TONES[tone]

  return (
    <div
      className={cn(
        "flex w-full items-start gap-2 rounded-lg border px-2.5 py-2 text-sm",
        className
      )}
      // Like the stock Alert, so a callout that appears after an action is announced.
      role="alert"
    >
      <Icon
        aria-hidden="true"
        className={cn("mt-0.5 size-4 shrink-0", iconClass)}
      />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p className="font-medium text-foreground">{title}</p>
        {children && (
          <div className="text-balance text-muted-foreground">{children}</div>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
