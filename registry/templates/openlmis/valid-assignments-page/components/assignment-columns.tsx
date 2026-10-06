"use client"

import { createColumnHelper } from "@tanstack/react-table"
import { EllipsisIcon, Trash2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  DataTableColumnHeader,
  type DataTableFeatures,
} from "@/registry/blocks/openlmis/data-table/data-table"
import type { ResponsiveColumn } from "@/registry/blocks/openlmis/data-table/responsive-columns"
import { selectionColumn } from "@/registry/components/openlmis/table-selection/table-selection"

import type { ValidAssignment } from "./mock-assignments"

export type AssignmentRow = ValidAssignment & {
  name: string
  /** The name with its facility type and program, which tells apart rows that share a place. */
  rowName: string
  program: string
  facilityType: string
  /** Null for an organization, which has no zone. */
  geoZone: string | null
  geoLevel: string | null
}

export const HIDEABLE_COLUMNS = [
  { id: "program", label: "Program", hideBelow: "lg" },
  { id: "facilityType", label: "Facility Type", hideBelow: "lg" },
  { id: "geoZone", label: "Geo Zone", hideBelow: "xl" },
  { id: "geoLevelAffinity", label: "Geo Level Affinity", hideBelow: "3xl" },
] as const satisfies readonly (ResponsiveColumn & { label: string })[]

const columnHelper = createColumnHelper<DataTableFeatures, AssignmentRow>()

const muted = (text: string) => (
  <span className="text-muted-foreground">{text}</span>
)

const wrapped = (text: string) => (
  <span className="block wrap-break-word whitespace-normal" dir="auto">
    {text}
  </span>
)

export function createAssignmentColumns(
  onDelete: (row: AssignmentRow) => void
) {
  return columnHelper.columns([
    selectionColumn<AssignmentRow>((row) => row.rowName),
    columnHelper.accessor("program", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Program" />
      ),
      cell: ({ getValue }) => wrapped(getValue()),
    }),
    columnHelper.accessor("facilityType", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Facility Type" />
      ),
      cell: ({ getValue }) => wrapped(getValue()),
    }),
    columnHelper.accessor("name", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      // Hidden program and type columns fold in under the name, so a narrow table still tells rows apart.
      cell: ({ row, table }) => {
        const folded = (["program", "facilityType"] as const)
          .filter((id) => !table.getColumn(id)?.getIsVisible())
          .map((id) => row.original[id])
        return (
          <span
            className="flex flex-col wrap-break-word whitespace-normal"
            dir="auto"
          >
            <span className="font-medium">{row.original.name}</span>
            {folded.length > 0 && muted(folded.join(" · "))}
          </span>
        )
      },
      meta: { className: "@2xl/table:w-1/4" },
    }),
    columnHelper.accessor("geoZone", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Geo Zone" />
      ),
      cell: ({ getValue }) => {
        const zone = getValue()
        return zone === null ? muted("Organization") : wrapped(zone)
      },
    }),
    columnHelper.accessor("geoLevel", {
      id: "geoLevelAffinity",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Geo Level Affinity" />
      ),
      cell: ({ getValue }) => {
        const level = getValue()
        return level === null ? muted("-") : wrapped(level)
      },
    }),
    columnHelper.display({
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      meta: { className: "w-16" },
      cell: ({ row }) => (
        <AssignmentActions
          label={row.original.rowName}
          onDelete={() => onDelete(row.original)}
        />
      ),
    }),
  ])
}

function AssignmentActions({
  label,
  onDelete,
}: {
  label: string
  onDelete: () => void
}) {
  return (
    <div className="flex justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              aria-label={`Actions For ${label}`}
              size="icon-sm"
              variant="ghost"
            />
          }
        >
          <EllipsisIcon />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-auto">
          <DropdownMenuItem onClick={onDelete} variant="destructive">
            <Trash2Icon />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
