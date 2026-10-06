"use client"

import { createColumnHelper } from "@tanstack/react-table"
import { EllipsisIcon, ListChecksIcon, PencilIcon } from "lucide-react"

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
import { useMenuOpensDialog } from "@/registry/blocks/openlmis/data-table/row-actions"
import type { ResponsiveColumn } from "@/registry/blocks/openlmis/data-table/responsive-columns"
import { roleTypeOf } from "@/registry/blocks/openlmis/role-assignments/role-assignments"
import { roleTypeInfo } from "./role-form-dialog/role-form"

import type { ListedRole } from "./mock-roles"

/** The columns the View menu lists, in order; the role's name is left out, so it always shows. */
export const HIDEABLE_COLUMNS: (ResponsiveColumn & { label: string })[] = [
  { id: "type", label: "Role Type", hideBelow: "md" },
  { id: "description", label: "Description", hideBelow: "4xl" },
  { id: "count", label: "Number Of Users", hideBelow: "xl" },
]

const columnHelper = createColumnHelper<DataTableFeatures, ListedRole>()

/** Each is left out when the user may not do it, and the menu goes when both are. */
export type RoleRowActions = {
  onEdit?: ((roleId: string) => void) | undefined
  onViewRights?: ((roleId: string) => void) | undefined
}

export function createRoleColumns(actions: RoleRowActions) {
  const hasActions = Boolean(actions.onEdit || actions.onViewRights)
  return columnHelper.columns([
    columnHelper.accessor("name", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Role" />
      ),
      cell: ({ getValue }) => <span className="font-medium">{getValue()}</span>,
      meta: { className: "@xl/table:w-1/3 @4xl/table:w-1/4" },
    }),
    columnHelper.accessor((role) => roleTypeOf(role), {
      id: "type",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Role Type" />
      ),
      cell: ({ getValue }) => {
        const type = getValue()
        return type ? (
          roleTypeInfo(type).label
        ) : (
          <span className="text-muted-foreground">No Type</span>
        )
      },
      meta: { className: "@xl/table:w-40" },
    }),
    columnHelper.accessor("description", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Description" />
      ),
      cell: ({ getValue }) =>
        getValue() || <span className="text-muted-foreground">-</span>,
      enableSorting: false,
    }),
    columnHelper.accessor("count", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Number Of Users" />
      ),
      cell: ({ getValue }) => (
        <span className="tabular-nums">{getValue()}</span>
      ),
      meta: { className: "w-36" },
    }),
    ...(hasActions
      ? [
          columnHelper.display({
            id: "actions",
            header: () => <span className="sr-only">Actions</span>,
            cell: ({ row }) => (
              <RoleActions actions={actions} role={row.original} />
            ),
            meta: { className: "w-16" },
          }),
        ]
      : []),
  ])
}

function RoleActions({
  role,
  actions: { onEdit, onViewRights },
}: {
  role: ListedRole
  actions: RoleRowActions
}) {
  const menu = useMenuOpensDialog()

  return (
    <div className="flex justify-end">
      <DropdownMenu onOpenChange={menu.onOpenChange}>
        <DropdownMenuTrigger
          render={
            <Button
              aria-label={`Actions for ${role.name}`}
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
          {onEdit && (
            <DropdownMenuItem onClick={menu.opensDialog(() => onEdit(role.id))}>
              <PencilIcon />
              Edit
            </DropdownMenuItem>
          )}
          {onViewRights && (
            <DropdownMenuItem
              onClick={menu.opensDialog(() => onViewRights(role.id))}
            >
              <ListChecksIcon />
              View Rights
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
