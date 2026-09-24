"use client"

import { CheckIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  type Role,
  rightLabel,
} from "@/registry/blocks/openlmis/role-assignments-table/role-assignments"
import { useDialogTarget } from "@/registry/components/openlmis/form-dialog/use-dialog-target"

type RoleRightsDialogProps = {
  /** The role whose rights are shown; open while set. Keep its identity while it stays open. */
  role: Role | undefined
  onClose: () => void
  /** Names a right from its code; defaults to the code in words, e.g. "Requisition Approve". */
  formatRight?: (name: string) => string
}

/** What a role lets its holder do, which the old UI only showed on hover. */
export function RoleRightsDialog({
  role,
  onClose,
  formatRight = rightLabel,
}: RoleRightsDialogProps) {
  const { shown, dialogProps } = useDialogTarget(role, onClose)
  const labels = (shown?.rights ?? []).map((right) => formatRight(right.name))
  // oxlint-disable-next-line unicorn/no-array-sort -- sorts the fresh mapped array
  const rights = labels.sort()

  return (
    <Dialog {...dialogProps()}>
      {/* Flex instead of grid, so a long list scrolls inside the dialog. */}
      {/* oxlint-disable-next-line shadcn/no-arbitrary-values -- no scale value keeps a margin inside the dynamic viewport */}
      <DialogContent className="flex max-h-[calc(100dvh-2rem)] flex-col">
        <DialogHeader className="gap-1 pe-8">
          <DialogTitle>{shown ? `${shown.name} Rights` : "Rights"}</DialogTitle>
          <DialogDescription>
            {shown?.description ||
              `${rights.length === 1 ? "1 right" : `${rights.length} rights`} granted by this role.`}
          </DialogDescription>
        </DialogHeader>
        {rights.length > 0 && (
          <ul className="-mx-4 flex min-h-0 flex-col gap-2 overflow-y-auto px-4 text-sm">
            {rights.map((right) => (
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
        <DialogFooter>
          <DialogClose render={<Button type="button" variant="outline" />}>
            Close
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
