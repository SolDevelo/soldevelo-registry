"use client"

import { createColumnHelper } from "@tanstack/react-table"
import { EllipsisIcon, PencilIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  DataTableColumnHeader,
  type DataTableFeatures,
} from "@/registry/blocks/openlmis/data-table/data-table"
import { useMenuOpensDialog } from "@/registry/blocks/openlmis/data-table/row-actions"
import type { ResponsiveColumn } from "@/registry/blocks/openlmis/data-table/responsive-columns"
import { StatusBadge } from "@/registry/components/openlmis/status-badge/status-badge"

import type { Program } from "./program-form-dialog/program-form"

/** The columns the View menu lists; the program's name is left out, so it always shows. */
export const PROGRAM_HIDEABLE_COLUMNS: (ResponsiveColumn & {
  label: string
})[] = [
  { id: "code", label: "Code", hideBelow: "md" },
  { id: "active", label: "Status", hideBelow: "sm" },
]

export const PROGRAM_SORT_FIELDS = ["name", "code", "active"] as const

export type ProgramSortField = (typeof PROGRAM_SORT_FIELDS)[number]

const columnHelper = createColumnHelper<DataTableFeatures, Program>()

export function createProgramColumns(onEdit: (id: string) => void) {
  return columnHelper.columns([
    columnHelper.accessor("name", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Program" />
      ),
      cell: ({ getValue }) =>
        getValue() ? (
          <span className="flex">
            <span className="min-w-0 truncate font-medium" dir="auto">
              {getValue()}
            </span>
          </span>
        ) : (
          <span className="text-muted-foreground">-</span>
        ),
    }),
    columnHelper.accessor("code", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Code" />
      ),
      cell: ({ getValue }) => (
        <span className="flex">
          <span className="min-w-0 truncate" dir="ltr">
            {getValue()}
          </span>
        </span>
      ),
      meta: { className: "@xl/table:w-1/4" },
    }),
    columnHelper.accessor("active", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ getValue }) =>
        getValue() ? (
          <StatusBadge tone="success">Active</StatusBadge>
        ) : (
          <StatusBadge tone="destructive">Inactive</StatusBadge>
        ),
      meta: { className: "w-32" },
    }),
    columnHelper.display({
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => (
        <ProgramActions onEdit={onEdit} program={row.original} />
      ),
      meta: { className: "w-16" },
    }),
  ])
}

function ProgramActions({
  program,
  onEdit,
}: {
  program: Program
  onEdit: (id: string) => void
}) {
  const menu = useMenuOpensDialog()

  return (
    <div className="flex justify-end">
      <DropdownMenu onOpenChange={menu.onOpenChange}>
        <DropdownMenuTrigger
          render={
            <Button
              aria-label={`Actions For ${program.name || program.code}`}
              size="icon-sm"
              variant="ghost"
            />
          }
        >
          <EllipsisIcon />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-auto"
          finalFocus={menu.finalFocus}
        >
          <DropdownMenuGroup>
            <DropdownMenuItem
              onClick={menu.opensDialog(() => onEdit(program.id))}
            >
              <PencilIcon />
              Edit
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
