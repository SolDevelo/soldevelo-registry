"use client"

import { CheckIcon, CircleHelpIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"

type RoleRightsPopoverProps = {
  /** The role's name, shown beside the button and as the popover's title. */
  name: string
  /** The rights the role grants, already labelled; they are sorted for you. */
  rights: readonly string[]
  /** Shown instead of the rights count when the role has one. */
  description?: string | null
}

/** The role's name with a button beside it that shows what the role lets its holder do. */
export function RoleRightsPopover({
  name,
  rights,
  description,
}: RoleRightsPopoverProps) {
  return (
    <span className="flex min-w-0 items-center gap-1">
      <span className="truncate">{name}</span>
      <Popover>
        <PopoverTrigger
          render={
            <Button
              aria-label={`${name} Rights`}
              size="icon-xs"
              variant="ghost"
            />
          }
        >
          <CircleHelpIcon />
        </PopoverTrigger>
        <PopoverContent align="start">
          <RoleRights description={description} name={name} rights={rights} />
        </PopoverContent>
      </Popover>
    </span>
  )
}

/** Rendered only while the popover is open, so a table of roles does no work for closed ones. */
function RoleRights({ name, rights, description }: RoleRightsPopoverProps) {
  // oxlint-disable-next-line unicorn/no-array-sort -- sorts a fresh copy; toSorted needs the ES2023 lib
  const sorted = [...rights].sort()

  return (
    <>
      <PopoverHeader>
        <PopoverTitle>{name} Rights</PopoverTitle>
        <PopoverDescription>
          {description || rightsCount(sorted.length)}
        </PopoverDescription>
      </PopoverHeader>
      {sorted.length > 0 && (
        <ul className="flex max-h-64 flex-col gap-1.5 overflow-y-auto">
          {sorted.map((right) => (
            <li className="flex items-center gap-2" key={right}>
              <CheckIcon
                aria-hidden="true"
                className="size-4 shrink-0 text-success"
              />
              {right}
            </li>
          ))}
        </ul>
      )}
    </>
  )
}

function rightsCount(count: number) {
  if (count === 0) return "This role grants no rights."
  return count === 1
    ? "The 1 right this role grants."
    : `The ${count} rights this role grants.`
}
