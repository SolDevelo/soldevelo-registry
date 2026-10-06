"use client"

import type { ReactNode } from "react"
import { CircleHelpIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"

type LabelPopoverProps = {
  /** The text shown inline, truncated when space runs out. */
  label: ReactNode
  /** The popover's heading. */
  title: ReactNode
  /** Names the help button for assistive tech. */
  ariaLabel: string
  /** A line under the title. */
  description?: ReactNode
  /** The popover's body, rendered only while it is open. */
  children?: ReactNode
}

/** A label with a help button beside it that opens a panel of detail. */
export function LabelPopover({
  label,
  title,
  ariaLabel,
  description,
  children,
}: LabelPopoverProps) {
  return (
    <span className="flex min-w-0 items-center gap-1">
      <span className="truncate">{label}</span>
      <Popover>
        <PopoverTrigger
          render={
            <Button aria-label={ariaLabel} size="icon-xs" variant="ghost" />
          }
        >
          <CircleHelpIcon />
        </PopoverTrigger>
        <PopoverContent align="start">
          <PopoverHeader>
            <PopoverTitle>{title}</PopoverTitle>
            {description && (
              <PopoverDescription>{description}</PopoverDescription>
            )}
          </PopoverHeader>
          {children}
        </PopoverContent>
      </Popover>
    </span>
  )
}
