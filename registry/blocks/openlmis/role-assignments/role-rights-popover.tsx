import { CheckIcon } from "lucide-react"

import { LabelPopover } from "@/registry/components/openlmis/label-popover/label-popover"

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
    <LabelPopover
      ariaLabel={`${name} Rights`}
      description={description || rightsCount(rights.length)}
      label={name}
      title={`${name} Rights`}
    >
      {rights.length > 0 && <RightsList rights={rights} />}
    </LabelPopover>
  )
}

/** Rendered only while the popover is open, so a table of roles does no work for closed ones. */
function RightsList({ rights }: { rights: readonly string[] }) {
  // oxlint-disable-next-line unicorn/no-array-sort -- sorts a fresh copy; toSorted needs the ES2023 lib
  const sorted = [...rights].sort()

  return (
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
  )
}

function rightsCount(count: number) {
  if (count === 0) return "This role grants no rights."
  return count === 1
    ? "The 1 right this role grants."
    : `The ${count} rights this role grants.`
}
