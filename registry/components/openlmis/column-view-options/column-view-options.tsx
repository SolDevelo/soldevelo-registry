"use client"

import { Settings2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export type ColumnViewOption = {
  id: string
  label: string
}

/** Column id to whether it shows; a column missing from the map shows. */
export type ColumnVisibility = Record<string, boolean>

export type ColumnViewLabels = {
  view: string
  toggleColumns: string
  resetColumns: string
}

const defaultLabels: ColumnViewLabels = {
  view: "View",
  toggleColumns: "Toggle Columns",
  resetColumns: "Reset Columns",
}

type ColumnViewOptionsProps = {
  /** The columns a user may hide; leave out the identifying column and actions, which always show. */
  columns: ColumnViewOption[]
  visibility: ColumnVisibility
  onVisibilityChange: (visibility: ColumnVisibility) => void
  /** Returns every column to its default, e.g. the one that fits the room. */
  onReset?: () => void
  labels?: Partial<ColumnViewLabels>
}

export function ColumnViewOptions({
  columns,
  visibility,
  onVisibilityChange,
  onReset,
  labels: labelOverrides,
}: ColumnViewOptionsProps) {
  const labels = { ...defaultLabels, ...labelOverrides }
  const isVisible = (id: string) => visibility[id] !== false

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" />}>
        <Settings2Icon data-icon="inline-start" />
        {labels.view}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-auto">
        <DropdownMenuGroup>
          <DropdownMenuLabel>{labels.toggleColumns}</DropdownMenuLabel>
          {columns.map((column) => (
            <DropdownMenuCheckboxItem
              checked={isVisible(column.id)}
              key={column.id}
              onCheckedChange={(checked) =>
                onVisibilityChange({ ...visibility, [column.id]: checked })
              }
            >
              {column.label}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuGroup>
        {onReset && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onReset} variant="destructive">
              {labels.resetColumns}
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
