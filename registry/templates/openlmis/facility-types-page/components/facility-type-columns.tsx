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

import type { FacilityType } from "./facility-type-form-dialog/facility-type-form"

/** The columns the View menu lists; code and name are left out, so they always show. */
export const FACILITY_TYPE_HIDEABLE_COLUMNS: (ResponsiveColumn & {
  label: string
})[] = [
  { id: "displayOrder", label: "Display Order", hideBelow: "lg" },
  { id: "active", label: "Status", hideBelow: "md" },
]

export const FACILITY_TYPE_SORT_FIELDS = [
  "displayOrder",
  "code",
  "name",
  "active",
] as const

export type FacilityTypeSortField = (typeof FACILITY_TYPE_SORT_FIELDS)[number]

const columnHelper = createColumnHelper<DataTableFeatures, FacilityType>()

export function createFacilityTypeColumns(onEdit: (id: string) => void) {
  return columnHelper.columns([
    columnHelper.accessor("code", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Code" />
      ),
      cell: ({ getValue }) => (
        <span className="flex">
          <span className="min-w-0 truncate font-medium" dir="ltr">
            {getValue()}
          </span>
        </span>
      ),
      meta: { className: "@xl/table:w-1/3" },
    }),
    columnHelper.accessor("name", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      cell: ({ getValue }) =>
        getValue() ? (
          <span className="flex">
            <span className="min-w-0 truncate" dir="auto">
              {getValue()}
            </span>
          </span>
        ) : (
          <span className="text-muted-foreground">-</span>
        ),
    }),
    columnHelper.accessor("displayOrder", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Display Order" />
      ),
      cell: ({ getValue }) => (
        <span className="tabular-nums">{getValue() ?? "-"}</span>
      ),
      meta: { className: "w-40" },
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
        <FacilityTypeActions onEdit={onEdit} type={row.original} />
      ),
      meta: { className: "w-16" },
    }),
  ])
}

function FacilityTypeActions({
  type,
  onEdit,
}: {
  type: FacilityType
  onEdit: (id: string) => void
}) {
  const menu = useMenuOpensDialog()

  return (
    <div className="flex justify-end">
      <DropdownMenu onOpenChange={menu.onOpenChange}>
        <DropdownMenuTrigger
          render={
            <Button
              aria-label={`Actions For ${type.name || type.code}`}
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
            <DropdownMenuItem onClick={menu.opensDialog(() => onEdit(type.id))}>
              <PencilIcon />
              Edit
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
