"use client"

import {
  createColumnHelper,
  type ColumnVisibilityState,
  functionalUpdate,
  type PaginationState,
  useTable,
} from "@tanstack/react-table"
import { BoxesIcon, EllipsisIcon, PencilIcon, SearchXIcon } from "lucide-react"
import { useCallback, useMemo, useRef } from "react"

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
  DataTablePagination,
  DataTableSkeleton,
  dataTableFeatures,
} from "@/registry/blocks/openlmis/data-table/data-table"
import { formatDateValue } from "@/registry/components/openlmis/date-picker/date-value"

import type { LotRow } from "./lots"

const columnHelper = createColumnHelper<DataTableFeatures, LotRow>()

const muted = (text: string) => (
  <span className="text-muted-foreground">{text}</span>
)

function createColumns(
  dateLanguage: string,
  onEdit: ((id: string) => void) | undefined
) {
  const date = (value: string | null) =>
    value ? formatDateValue(value, dateLanguage) : muted("-")
  return columnHelper.columns([
    columnHelper.accessor((lot) => lot.product?.productCode ?? "", {
      id: "productCode",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Product Code" />
      ),
      cell: ({ getValue }) =>
        getValue() ? (
          <span className="flex">
            <span className="min-w-0 truncate" dir="ltr">
              {getValue()}
            </span>
          </span>
        ) : (
          muted("-")
        ),
      meta: { className: "w-40" },
    }),
    columnHelper.accessor((lot) => lot.product?.fullProductName ?? "", {
      id: "productName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Product Name" />
      ),
      cell: ({ row, getValue }) =>
        !row.original.product ? (
          muted("No Product")
        ) : getValue() ? (
          <span className="block break-words whitespace-normal" dir="auto">
            {getValue()}
          </span>
        ) : (
          muted("-")
        ),
    }),
    columnHelper.accessor("lotCode", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Lot Code" />
      ),
      cell: ({ getValue }) => (
        <span className="flex">
          <span className="min-w-0 truncate font-medium" dir="ltr">
            {getValue()}
          </span>
        </span>
      ),
      meta: { className: "w-36 @xl/table:w-44" },
    }),
    columnHelper.accessor("expirationDate", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Expiry Date" />
      ),
      cell: ({ getValue }) => date(getValue()),
      meta: { className: "w-36" },
    }),
    columnHelper.accessor("manufactureDate", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Manufacture Date" />
      ),
      cell: ({ getValue }) => date(getValue()),
      meta: { className: "w-40" },
    }),
    ...(onEdit
      ? [
          columnHelper.display({
            id: "actions",
            header: () => <span className="sr-only">Actions</span>,
            cell: ({ row }) => (
              <LotActions lot={row.original} onEdit={onEdit} />
            ),
            meta: { className: "w-16" },
          }),
        ]
      : []),
  ])
}

/** Keeps a closing menu from taking focus back to its trigger when an item opened a dialog, which then owns focus. */
function useMenuOpensDialog() {
  const opened = useRef(false)

  const onOpenChange = useCallback((open: boolean) => {
    if (open) opened.current = false
  }, [])
  const finalFocus = useCallback(() => !opened.current, [])
  const opensDialog = useCallback(
    (open: () => void) => () => {
      opened.current = true
      open()
    },
    []
  )

  return { onOpenChange, finalFocus, opensDialog }
}

function LotActions({
  lot,
  onEdit,
}: {
  lot: LotRow
  onEdit: (id: string) => void
}) {
  const menu = useMenuOpensDialog()

  return (
    <div className="flex justify-end">
      <DropdownMenu onOpenChange={menu.onOpenChange}>
        <DropdownMenuTrigger
          render={
            <Button
              aria-label={`Actions For ${lot.lotCode}`}
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
          <DropdownMenuItem onClick={menu.opensDialog(() => onEdit(lot.id))}>
            <PencilIcon />
            Edit
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

const ALL_COLUMNS: ColumnVisibilityState = {}

const NO_LOTS: LotRow[] = []

const getRowId = (lot: LotRow) => lot.id

type LotsTableProps = {
  /** One page of lots; a skeleton shows until it is set. */
  lots: readonly LotRow[] | undefined
  /** Every lot that matches the filters, across all pages. */
  rowCount: number
  pagination: PaginationState
  onPaginationChange: (pagination: PaginationState) => void
  columnVisibility?: ColumnVisibilityState
  /** Whether a filter is set, so an empty list offers to clear them. */
  filtered?: boolean
  onClearFilters?: () => void
  /** Without it, the row menu is left out. */
  onEdit?: ((id: string) => void) | undefined
  /** Dims the rows while the next page loads. */
  isStale?: boolean
  /** Loading failed; shows the error with Try Again. */
  onRetry?: (() => void) | undefined
  /** The language dates are shown in. */
  dateLanguage?: string
}

/** Lots with their product and dates, a page at a time; filtering and paging are left to the caller, who must clamp `pageIndex` to the last page when rows shrink. */
export function LotsTable({
  lots,
  rowCount,
  pagination,
  onPaginationChange,
  columnVisibility = ALL_COLUMNS,
  filtered = false,
  onClearFilters,
  onEdit,
  isStale = false,
  onRetry,
  dateLanguage = "en-US",
}: LotsTableProps) {
  const columns = useMemo(
    () => createColumns(dateLanguage, onEdit),
    [dateLanguage, onEdit]
  )
  const table = useTable({
    features: dataTableFeatures,
    columns,
    data: (lots ?? NO_LOTS) as LotRow[],
    getRowId,
    rowCount,
    manualPagination: true,
    manualSorting: true,
    enableSorting: false,
    state: { pagination, columnVisibility },
    onPaginationChange: (updater) =>
      onPaginationChange(functionalUpdate(updater, pagination)),
  })

  if (onRetry)
    return (
      <DataTableError
        description="Something went wrong while loading the lots. Try again."
        onRetry={onRetry}
        title="Could Not Load Lots"
      />
    )
  if (lots === undefined)
    return <DataTableSkeleton rowCount={pagination.pageSize} table={table} />

  return (
    <DataTable
      empty={
        filtered ? (
          <DataTableEmpty
            action={
              onClearFilters && (
                <Button onClick={onClearFilters} variant="destructive">
                  Clear Filters
                </Button>
              )
            }
            description="Try a different product or dates, or clear the filters."
            icon={<SearchXIcon />}
            title="No Matching Lots"
          />
        ) : (
          <DataTableEmpty
            description="Lots appear here once stock is received or counted for them."
            icon={<BoxesIcon />}
            title="No Lots Yet"
          />
        )
      }
      footer={rowCount > 0 && <DataTablePagination table={table} />}
      isStale={isStale}
      table={table}
    />
  )
}
