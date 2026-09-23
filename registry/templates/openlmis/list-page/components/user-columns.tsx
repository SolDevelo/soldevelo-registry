"use client"

import { createColumnHelper } from "@tanstack/react-table"
import {
  EllipsisIcon,
  KeyRoundIcon,
  PencilIcon,
  ShieldIcon,
} from "lucide-react"

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
import { StatusBadge } from "@/registry/components/openlmis/status-badge/status-badge"

import type { User } from "./mock-users"

/** The columns the View menu lists, in order; `hideBelow` drops them while the table is narrow. */
export const HIDEABLE_COLUMNS: (ResponsiveColumn & { label: string })[] = [
  { id: "lastName", label: "Name", hideBelow: "xl" },
  { id: "email", label: "Email", hideBelow: "4xl" },
  { id: "active", label: "Status" },
]

const columnHelper = createColumnHelper<DataTableFeatures, User>()

export const userColumns = columnHelper.columns([
  // Shows the full name but sorts by last name, the usual order for a list of people.
  columnHelper.accessor("lastName", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => `${row.original.firstName} ${row.original.lastName}`,
    meta: { className: "@xl/table:w-2/5 @4xl/table:w-1/5" },
  }),
  columnHelper.accessor("username", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Username" />
    ),
    cell: ({ getValue }) => <span className="font-medium">{getValue()}</span>,
    // No width below 4xl, so the username takes the room the hidden columns leave.
    meta: { className: "@4xl/table:w-1/6" },
  }),
  columnHelper.accessor("email", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
    cell: ({ getValue }) =>
      getValue() ?? <span className="text-muted-foreground">-</span>,
    enableSorting: false,
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
    cell: ({ row }) => <UserActions username={row.original.username} />,
    meta: { className: "w-16" },
  }),
])

// Wire these to real screens; they do nothing in the template.
function UserActions({ username }: { username: string }) {
  return (
    <div className="flex justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              aria-label={`Actions for ${username}`}
              size="icon-sm"
              variant="ghost"
            />
          }
        >
          <EllipsisIcon />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-auto">
          <DropdownMenuItem>
            <PencilIcon />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem>
            <ShieldIcon />
            Roles
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive">
            <KeyRoundIcon />
            Reset Password
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
