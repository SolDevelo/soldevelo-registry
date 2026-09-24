"use client"

import {
  createColumnHelper,
  functionalUpdate,
  type PaginationState,
  type SortingState,
  useTable,
} from "@tanstack/react-table"
import {
  EllipsisIcon,
  ListChecksIcon,
  PlusIcon,
  SearchXIcon,
  ShieldIcon,
  Trash2Icon,
} from "lucide-react"
import { useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import {
  DataTable,
  DataTableColumnHeader,
  DataTableEmpty,
  DataTableError,
  type DataTableFeatures,
  DataTablePagination,
  DataTableSkeleton,
  dataTableFeatures,
} from "@/registry/blocks/openlmis/data-table/data-table"
import { useContainerSize } from "@/registry/blocks/openlmis/data-table/responsive-columns"
import { SearchInput } from "@/registry/components/openlmis/search-input/search-input"
import { StatusBadge } from "@/registry/components/openlmis/status-badge/status-badge"

import {
  compareRows,
  filterRows,
  type RoleRow,
  type RoleSortField,
  type RoleTab,
} from "./role-assignments"

/** Whether the node and facility names have arrived; they load after the rows, and may fail. */
export type LookupStatus = {
  nodes: "pending" | "ready" | "failed"
  facilities: "pending" | "ready" | "failed"
}

type NameStatus = LookupStatus["nodes"]

const EMPTY_TEXT: Record<RoleTab["id"], string> = {
  supervision: "Supervision roles let this user work on requisitions.",
  fulfillment: "Fulfillment roles let this user handle orders at a facility.",
  reports: "Report roles let this user view reports.",
  administration: "Administration roles let this user manage OpenLMIS.",
}

const columnHelper = createColumnHelper<DataTableFeatures, RoleRow>()

/** A name; a placeholder while it loads, a dash if its lookup failed, "Unknown" if it is gone. */
function Name({
  value,
  status = "ready",
}: {
  value: string | undefined
  status?: NameStatus
}) {
  if (value !== undefined) return <span className="truncate">{value}</span>
  if (status === "pending") return <Skeleton className="h-4 w-2/3" />
  if (status === "failed")
    return <span className="text-muted-foreground">-</span>
  return <span className="text-muted-foreground">Unknown</span>
}

/** The node with its facility beneath, or Home Facility with the user's home facility. */
function NodeCell({ row, status }: { row: RoleRow; status: LookupStatus }) {
  const facilityPending =
    status.facilities === "pending" ||
    (!row.isHomeFacility && status.nodes === "pending")
  return (
    <span className="flex min-w-0 flex-col">
      {row.isHomeFacility ? (
        <span className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
          <span className="truncate">Home Facility</span>
          {row.isIgnored && <StatusBadge tone="warning">Ignored</StatusBadge>}
        </span>
      ) : (
        <Name status={status.nodes} value={row.node} />
      )}
      {row.isIgnored ? null : row.nodeFacility !== undefined ? (
        <span className="truncate text-xs text-muted-foreground">
          {row.nodeFacility}
        </span>
      ) : (
        facilityPending && <Skeleton className="mt-1 h-3 w-1/2" />
      )}
    </span>
  )
}

type ColumnOptions = {
  tab: RoleTab
  /** Too narrow for a column each, so the role cell carries the rest on lines of its own. */
  compact: boolean
  status: LookupStatus
  onRemove: (row: RoleRow) => void
  onViewRights: (roleId: string) => void
}

function RoleCell({ row, options }: { row: RoleRow; options: ColumnOptions }) {
  const { tab, compact, status } = options
  return (
    <span className="flex min-w-0 flex-col gap-1">
      <span className="flex min-w-0 items-center gap-2 font-medium">
        <Name value={row.role} />
        {row.isUnsaved && <StatusBadge tone="info">Unsaved</StatusBadge>}
      </span>
      {compact && tab.type === "SUPERVISION" && (
        <span className="flex min-w-0 flex-col text-xs text-muted-foreground">
          <Name value={row.program} />
          <NodeCell row={row} status={status} />
        </span>
      )}
      {compact && tab.type === "ORDER_FULFILLMENT" && (
        <span className="text-xs text-muted-foreground">
          <Name status={status.facilities} value={row.facility} />
        </span>
      )}
    </span>
  )
}

function createColumns(options: ColumnOptions) {
  const { tab, compact, status } = options
  const role = columnHelper.accessor("role", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Role" />
    ),
    cell: ({ row }) => <RoleCell options={options} row={row.original} />,
  })
  const actions = columnHelper.display({
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    meta: { className: "w-16" },
    cell: ({ row }) => (
      <RoleActions
        onRemove={() => options.onRemove(row.original)}
        onViewRights={() =>
          options.onViewRights(row.original.assignment.roleId)
        }
        role={row.original.role ?? "Unknown"}
      />
    ),
  })

  if (compact) return columnHelper.columns([role, actions])

  if (tab.type === "SUPERVISION") {
    return columnHelper.columns([
      role,
      columnHelper.accessor("program", {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Program" />
        ),
        meta: { className: "w-1/5" },
        cell: ({ getValue }) => <Name value={getValue()} />,
      }),
      columnHelper.accessor("node", {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Supervisory Node" />
        ),
        meta: { className: "w-2/5" },
        cell: ({ row }) => <NodeCell row={row.original} status={status} />,
      }),
      actions,
    ])
  }
  if (tab.type === "ORDER_FULFILLMENT") {
    return columnHelper.columns([
      role,
      columnHelper.accessor("facility", {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Facility" />
        ),
        meta: { className: "w-1/2" },
        cell: ({ getValue }) => (
          <Name status={status.facilities} value={getValue()} />
        ),
      }),
      actions,
    ])
  }
  return columnHelper.columns([
    role,
    columnHelper.accessor("description", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Description" />
      ),
      enableSorting: false,
      meta: { className: "w-1/2" },
      cell: ({ getValue }) => (
        <span className="truncate text-muted-foreground">
          {getValue() ?? "-"}
        </span>
      ),
    }),
    actions,
  ])
}

function RoleActions({
  role,
  onRemove,
  onViewRights,
}: {
  role: string
  onRemove: () => void
  onViewRights: () => void
}) {
  return (
    <div className="flex justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              aria-label={`Actions for ${role}`}
              size="icon-sm"
              variant="ghost"
            />
          }
        >
          <EllipsisIcon />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-auto">
          <DropdownMenuItem onClick={onViewRights}>
            <ListChecksIcon />
            View Rights
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onRemove} variant="destructive">
            <Trash2Icon />
            Remove
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

type RoleAssignmentsTableProps = Omit<ColumnOptions, "compact"> & {
  /** Every row of the tab, unfiltered; a skeleton shows until it is set. Key the table by tab to reset it. */
  rows: RoleRow[] | undefined
  /** The rows could not be loaded; shows an error with Try Again. */
  failed?: boolean
  onRetry?: () => void
  onAdd: () => void
}

const INITIAL_SORTING: SortingState = [{ id: "role", desc: false }]
const INITIAL_PAGINATION: PaginationState = { pageIndex: 0, pageSize: 10 }

/** One tab's roles: a search and Add Role above a table that filters, sorts and pages them in the browser. */
export function RoleAssignmentsTable({
  rows,
  failed = false,
  onRetry,
  onAdd,
  ...options
}: RoleAssignmentsTableProps) {
  const [query, setQuery] = useState("")
  const [sorting, setSorting] = useState(INITIAL_SORTING)
  const [pagination, setPagination] = useState(INITIAL_PAGINATION)
  const [measure, size] = useContainerSize<HTMLDivElement>()
  // Below `xl` there is no room for a column per name.
  const compact =
    size === "none" || size === "sm" || size === "md" || size === "lg"

  const { tab, status, onRemove, onViewRights } = options
  const columns = useMemo(
    () => createColumns({ tab, compact, status, onRemove, onViewRights }),
    [tab, compact, status, onRemove, onViewRights]
  )

  const [sort = INITIAL_SORTING[0]] = sorting
  const matching = useMemo(() => {
    const filtered = filterRows(rows ?? [], query)
    // oxlint-disable-next-line unicorn/no-array-sort -- sorts the fresh filtered array
    return filtered.sort(
      compareRows((sort?.id ?? "role") as RoleSortField, sort?.desc ?? false)
    )
  }, [rows, query, sort])
  // A removal can leave the page past the end, so it is held to the last page that exists.
  const lastPage = Math.max(
    0,
    Math.ceil(matching.length / pagination.pageSize) - 1
  )
  // Memoized: the table compares controlled state by reference and would reset it every render.
  const page = useMemo(
    () => ({
      ...pagination,
      pageIndex: Math.min(pagination.pageIndex, lastPage),
    }),
    [pagination, lastPage]
  )
  const data = useMemo(
    () =>
      matching.slice(
        page.pageIndex * page.pageSize,
        (page.pageIndex + 1) * page.pageSize
      ),
    [matching, page.pageIndex, page.pageSize]
  )

  const table = useTable({
    features: dataTableFeatures,
    columns,
    data,
    getRowId: (row) => row.id,
    rowCount: matching.length,
    manualPagination: true,
    manualSorting: true,
    enableSortingRemoval: false,
    state: { sorting, pagination: page },
    onSortingChange: (updater) => {
      setSorting(functionalUpdate(updater, sorting))
      setPagination((current) => ({ ...current, pageIndex: 0 }))
    },
    onPaginationChange: (updater) =>
      setPagination(functionalUpdate(updater, page)),
  })

  const clearSearch = () => {
    setQuery("")
    setPagination((current) => ({ ...current, pageIndex: 0 }))
  }

  return (
    <div className="@container/roles flex flex-col gap-4" ref={measure}>
      <div className="flex flex-wrap items-center gap-2">
        <div className="min-w-0 flex-1 @xl/roles:w-72 @xl/roles:flex-none">
          <SearchInput
            label="Search roles, programs, nodes and facilities"
            onValueChange={(value) => {
              setQuery(value)
              setPagination((current) => ({ ...current, pageIndex: 0 }))
            }}
            placeholder="Search roles..."
            value={query}
          />
        </div>
        <Button className="ms-auto" onClick={onAdd}>
          <PlusIcon data-icon="inline-start" />
          Add Role
        </Button>
      </div>
      {failed && onRetry ? (
        <DataTableError
          description="Check your connection and try again."
          onRetry={onRetry}
          title="Could Not Load Roles"
        />
      ) : rows === undefined ? (
        <DataTableSkeleton rowCount={5} table={table} />
      ) : (
        <DataTable
          empty={
            rows.length === 0 ? (
              <DataTableEmpty
                action={
                  <Button onClick={onAdd} variant="outline">
                    <PlusIcon data-icon="inline-start" />
                    Add Role
                  </Button>
                }
                description={EMPTY_TEXT[tab.id]}
                icon={<ShieldIcon />}
                title="No Roles Yet"
              />
            ) : (
              <DataTableEmpty
                action={
                  <Button onClick={clearSearch} variant="destructive">
                    Clear Search
                  </Button>
                }
                description="Try a different search."
                icon={<SearchXIcon />}
                title="No Matching Roles"
              />
            )
          }
          footer={matching.length > 0 && <DataTablePagination table={table} />}
          table={table}
        />
      )}
    </div>
  )
}
