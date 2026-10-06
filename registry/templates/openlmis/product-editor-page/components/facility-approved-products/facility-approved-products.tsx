"use client"

import {
  type ColumnVisibilityState,
  createColumnHelper,
  useTable,
} from "@tanstack/react-table"
import {
  BuildingIcon,
  EllipsisIcon,
  EyeIcon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react"
import { useMemo } from "react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  DataTable,
  DataTableColumnHeader,
  DataTableEmpty,
  DataTableError,
  type DataTableFeatures,
  DataTableSkeleton,
  dataTableFeatures,
} from "@/registry/blocks/openlmis/data-table/data-table"
import type { ResponsiveColumn } from "@/registry/blocks/openlmis/data-table/responsive-columns"
import { ListToolbar } from "@/registry/blocks/openlmis/list-toolbar/list-toolbar"
import type { Approval } from "../product-approval-dialog/approval-form"
import {
  type ColumnVisibility,
  ColumnViewOptions,
} from "@/registry/components/openlmis/column-view-options/column-view-options"

/** The columns a user may hide, and the room each needs before it shows by default. */
export const APPROVAL_HIDEABLE_COLUMNS = [
  { id: "maxPeriodsOfStock", label: "Max Periods Of Stock", hideBelow: "2xl" },
  {
    id: "emergencyOrderPoint",
    label: "Emergency Order Point",
    hideBelow: "4xl",
  },
  { id: "minPeriodsOfStock", label: "Min Periods Of Stock", hideBelow: "5xl" },
] as const satisfies readonly (ResponsiveColumn & { label: string })[]

type StockColumn = (typeof APPROVAL_HIDEABLE_COLUMNS)[number]["id"]

const byName = (a: string, b: string) => a.localeCompare(b)

/** Approvals under their facility type, both by name. */
export function groupApprovals(approvals: readonly Approval[]) {
  const groups = new Map<
    string,
    { facilityType: Approval["facilityType"]; approvals: Approval[] }
  >()
  for (const approval of approvals) {
    const group = groups.get(approval.facilityType.id)
    if (group) group.approvals.push(approval)
    else
      groups.set(approval.facilityType.id, {
        facilityType: approval.facilityType,
        approvals: [approval],
      })
  }
  return (
    [...groups.values()]
      // oxlint-disable-next-line unicorn/no-array-sort -- sorts a fresh array; toSorted needs the ES2023 lib
      .sort((a, b) => byName(a.facilityType.name, b.facilityType.name))
      .map((group) => ({
        ...group,
        // oxlint-disable-next-line unicorn/no-array-sort -- sorts a fresh array; toSorted needs the ES2023 lib
        approvals: group.approvals.sort((a, b) =>
          byName(a.program.name, b.program.name)
        ),
      }))
  )
}

type ApprovalRow =
  | { kind: "group"; id: string; facilityType: string }
  | { kind: "approval"; id: string; facilityType: string; approval: Approval }

type RowActions = {
  /** Without it, rows offer View instead of Edit and Remove. */
  canEdit: boolean
  onEdit: (approvalId: string) => void
  onRemove: (approvalId: string) => void
}

const columnHelper = createColumnHelper<DataTableFeatures, ApprovalRow>()

const number = new Intl.NumberFormat("en-US", { maximumFractionDigits: 3 })

const muted = <span className="text-muted-foreground">-</span>

function createColumns(actions: RowActions) {
  const stockColumn = (id: StockColumn, title: string) =>
    columnHelper.display({
      id,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={title} />
      ),
      meta: { className: "w-48" },
      cell: ({ row }) => {
        if (row.original.kind === "group") return null
        const value = row.original.approval[id]
        return value == null ? (
          muted
        ) : (
          <span dir="ltr">{number.format(value)}</span>
        )
      },
    })

  return columnHelper.columns([
    columnHelper.display({
      id: "facilityType",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Facility Type" />
      ),
      cell: ({ row }) =>
        row.original.kind === "group" ? (
          <span
            className="font-medium break-words whitespace-normal"
            dir="auto"
          >
            {row.original.facilityType}
          </span>
        ) : (
          // Read out on each row, since only the group row shows it.
          <span className="sr-only">{row.original.facilityType}</span>
        ),
      meta: { className: "w-2/5 @2xl/main:w-1/5" },
    }),
    columnHelper.display({
      id: "program",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Program" />
      ),
      cell: ({ row }) =>
        row.original.kind === "approval" && (
          <span className="break-words whitespace-normal" dir="auto">
            {row.original.approval.program.name}
          </span>
        ),
    }),
    stockColumn("maxPeriodsOfStock", "Max Periods Of Stock"),
    stockColumn("emergencyOrderPoint", "Emergency Order Point"),
    stockColumn("minPeriodsOfStock", "Min Periods Of Stock"),
    columnHelper.display({
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      meta: { className: "w-16" },
      cell: ({ row }) =>
        row.original.kind === "approval" && (
          <ApprovalActions actions={actions} approval={row.original.approval} />
        ),
    }),
  ])
}

function ApprovalActions({
  approval,
  actions,
}: {
  approval: Approval
  actions: RowActions
}) {
  return (
    <div className="flex justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              aria-label={`Actions For ${approval.facilityType.name} In ${approval.program.name}`}
              size="icon-sm"
              variant="ghost"
            />
          }
        >
          <EllipsisIcon />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-auto">
          {actions.canEdit ? (
            <>
              <DropdownMenuItem onClick={() => actions.onEdit(approval.id)}>
                <PencilIcon />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => actions.onRemove(approval.id)}
                variant="destructive"
              >
                <Trash2Icon />
                Remove
              </DropdownMenuItem>
            </>
          ) : (
            <DropdownMenuItem onClick={() => actions.onEdit(approval.id)}>
              <EyeIcon />
              View
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

const NO_ROWS: ApprovalRow[] = []

const getRowId = (row: ApprovalRow) => `${row.kind}-${row.id}`

type FacilityApprovedProductsProps = RowActions & {
  /** The product's approvals; a skeleton shows until they are set. */
  approvals: readonly Approval[] | undefined
  columnVisibility: ColumnVisibilityState
  /** Replaces the table, e.g. when the approvals could not be loaded. */
  error?: string
  onRetry?: () => void
}

/** The facility types that may stock a product, each with its programs and stock levels. */
export function FacilityApprovedProducts({
  approvals,
  columnVisibility,
  error,
  onRetry,
  canEdit,
  onEdit,
  onRemove,
}: FacilityApprovedProductsProps) {
  const columns = useMemo(
    () => createColumns({ canEdit, onEdit, onRemove }),
    [canEdit, onEdit, onRemove]
  )
  const rows = useMemo(
    () =>
      approvals
        ? groupApprovals(approvals).flatMap(
            ({ facilityType, approvals: grouped }): ApprovalRow[] => [
              {
                kind: "group",
                id: facilityType.id,
                facilityType: facilityType.name,
              },
              ...grouped.map((approval) => ({
                kind: "approval" as const,
                id: approval.id,
                facilityType: facilityType.name,
                approval,
              })),
            ]
          )
        : NO_ROWS,
    [approvals]
  )
  const table = useTable({
    features: dataTableFeatures,
    columns,
    data: rows,
    getRowId,
    enableSorting: false,
    state: { columnVisibility },
  })

  if (error) {
    return (
      <DataTableError
        description="Something went wrong while loading the facility types. Try again."
        onRetry={onRetry}
        title={error}
      />
    )
  }
  if (!approvals)
    return <DataTableSkeleton footer={null} rowCount={3} table={table} />
  return (
    <DataTable
      empty={
        <DataTableEmpty
          description={
            canEdit
              ? "Add a facility type to let its facilities stock this product."
              : "No type of facility stocks this product yet."
          }
          icon={<BuildingIcon />}
          title="No Facility Types Yet"
        />
      }
      table={table}
    />
  )
}

type ApprovalsToolbarProps = {
  columnVisibility: ColumnVisibility
  onColumnVisibilityChange: (visibility: ColumnVisibility) => void
  onColumnReset?: () => void
  /** Left out when the user cannot edit approvals. */
  onAdd?: () => void
}

/** The View menu, then Add Facility Type, which takes the whole row while the tab is narrow. */
export function ApprovalsToolbar({
  columnVisibility,
  onColumnVisibilityChange,
  onColumnReset,
  onAdd,
}: ApprovalsToolbarProps) {
  return (
    <ListToolbar>
      <div className="@2xl/toolbar:ms-auto">
        <ColumnViewOptions
          columns={[...APPROVAL_HIDEABLE_COLUMNS]}
          onReset={onColumnReset}
          onVisibilityChange={onColumnVisibilityChange}
          visibility={columnVisibility}
        />
      </div>
      {onAdd && (
        <div className="w-full @2xl/toolbar:w-auto">
          <Button className="w-full" onClick={onAdd}>
            <PlusIcon data-icon="inline-start" />
            Add Facility Type
          </Button>
        </div>
      )}
    </ListToolbar>
  )
}
