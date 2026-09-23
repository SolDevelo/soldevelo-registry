"use client"

import {
  type Column,
  columnVisibilityFeature,
  FlexRender,
  type ReactTable,
  type RowData,
  rowPaginationFeature,
  rowSortingFeature,
  tableFeatures,
} from "@tanstack/react-table"
import {
  AlertTriangleIcon,
  ChevronDownIcon,
  ChevronsUpDownIcon,
  ChevronUpIcon,
} from "lucide-react"
import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Pagination,
  type PaginationLabels,
  PaginationSkeleton,
} from "@/registry/components/openlmis/pagination/pagination"

export type DataTableColumnMeta = {
  /** Width classes, e.g. `w-1/5` or `w-16 @xl/table:w-32`. Columns without any share what is left. */
  className?: string
}

// Sorting and paging are left to the data source, so no client row models are registered.
export const dataTableFeatures = tableFeatures({
  columnVisibilityFeature,
  rowSortingFeature,
  rowPaginationFeature,
  columnMeta: {} as DataTableColumnMeta,
})

export type DataTableFeatures = typeof dataTableFeatures

export type DataTableInstance<TData extends RowData> = ReactTable<
  DataTableFeatures,
  TData
>

// Fixed layout keeps widths still from page to page.
const TABLE_CLASSES =
  "table-fixed [&_td]:h-12 [&_td]:px-4 [&_td]:py-1.5 [&_th]:h-10 [&_th]:px-4"

type DataTableProps<TData extends RowData> = {
  table: DataTableInstance<TData>
  /** Rendered across the whole body when there are no rows. */
  empty?: ReactNode
  /** Dims the rows while the next page is loading in the background. */
  isStale?: boolean
  /** Rendered inside the card below the rows, e.g. `DataTablePagination`. */
  footer?: ReactNode
}

export function DataTable<TData extends RowData>({
  table,
  empty,
  isStale = false,
  footer,
}: DataTableProps<TData>) {
  const rows = table.getRowModel().rows
  const columns = table.getVisibleLeafColumns()

  return (
    <DataTableCard>
      <div
        aria-busy={isStale}
        className="transition-opacity aria-busy:opacity-60"
      >
        <Table className={TABLE_CLASSES}>
          <DataTableHeader table={table} />
          <TableBody>
            {rows.length > 0 ? (
              rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {/* Cuts overflow with an ellipsis; the padding keeps a button's focus ring inside. */}
                      <div className="-m-1 truncate p-1">
                        <FlexRender cell={cell} />
                      </div>
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length}>
                  <div className="whitespace-normal">{empty}</div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {footer && <DataTableFooter>{footer}</DataTableFooter>}
    </DataTableCard>
  )
}

/** Column widths and the header row, shared by the table and its skeleton so neither shifts. */
function DataTableHeader<TData extends RowData>({
  table,
}: {
  table: DataTableInstance<TData>
}) {
  return (
    <>
      <colgroup>
        {table.getVisibleLeafColumns().map((column) => (
          <col className={column.columnDef.meta?.className} key={column.id} />
        ))}
      </colgroup>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <TableHead aria-sort={ariaSort(header.column)} key={header.id}>
                {header.isPlaceholder ? null : <FlexRender header={header} />}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
    </>
  )
}

// A size container, so the footer and columns lay out by the table's width rather than the window's.
function DataTableCard({ children }: { children: ReactNode }) {
  return (
    <div className="@container/table overflow-hidden rounded-xl border bg-card shadow-xs [&_thead]:bg-muted/50 [&_thead_tr]:hover:bg-transparent">
      {children}
    </div>
  )
}

function DataTableFooter({ children }: { children: ReactNode }) {
  return <div className="border-t bg-muted/30 px-4 py-3">{children}</div>
}

function ariaSort<TData extends RowData>(
  column: Column<DataTableFeatures, TData>
) {
  if (!column.getCanSort()) return undefined
  const direction = column.getIsSorted()
  if (direction === "asc") return "ascending"
  if (direction === "desc") return "descending"
  return "none"
}

type DataTableColumnHeaderProps<TData extends RowData, TValue> = {
  column: Column<DataTableFeatures, TData, TValue>
  title: string
}

/** Header label that toggles the column's sort when the column allows it. */
export function DataTableColumnHeader<TData extends RowData, TValue>({
  column,
  title,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) return <HeaderLabel>{title}</HeaderLabel>

  const direction = column.getIsSorted()
  const SortIcon =
    direction === "asc"
      ? ChevronUpIcon
      : direction === "desc"
        ? ChevronDownIcon
        : ChevronsUpDownIcon

  return (
    <div className="-ms-2">
      <Button
        onClick={column.getToggleSortingHandler()}
        size="xs"
        variant="ghost"
      >
        <HeaderLabel>{title}</HeaderLabel>
        <SortIcon className="text-muted-foreground" data-icon="inline-end" />
      </Button>
    </div>
  )
}

function HeaderLabel({ children }: { children: ReactNode }) {
  return (
    <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
      {children}
    </span>
  )
}

type DataTableSkeletonProps<TData extends RowData> = {
  /** A table built from the real columns with no rows, so the header and widths match exactly. */
  table: DataTableInstance<TData>
  rowCount: number
}

export function DataTableSkeleton<TData extends RowData>({
  table,
  rowCount,
}: DataTableSkeletonProps<TData>) {
  const columns = table.getVisibleLeafColumns()
  const rows = Array.from({ length: rowCount }, (_, index) => index)

  return (
    <div aria-busy>
      <DataTableCard>
        <Table className={TABLE_CLASSES}>
          <DataTableHeader table={table} />
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row}>
                {columns.map((column) => (
                  <TableCell key={column.id}>
                    <Skeleton className="h-4 w-3/4" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <DataTableFooter>
          <PaginationSkeleton />
        </DataTableFooter>
      </DataTableCard>
    </div>
  )
}

type DataTableEmptyProps = {
  icon?: ReactNode
  title: string
  description?: string | undefined
  action?: ReactNode
}

export function DataTableEmpty({
  icon,
  title,
  description,
  action,
}: DataTableEmptyProps) {
  return (
    <Empty>
      <EmptyHeader>
        {icon && <EmptyMedia variant="icon">{icon}</EmptyMedia>}
        <EmptyTitle>{title}</EmptyTitle>
        {description && <EmptyDescription>{description}</EmptyDescription>}
      </EmptyHeader>
      {action && <EmptyContent>{action}</EmptyContent>}
    </Empty>
  )
}

type DataTableErrorProps = {
  title: string
  description?: string
  onRetry?: () => void
  retryLabel?: string
}

export function DataTableError({
  title,
  description,
  onRetry,
  retryLabel = "Try Again",
}: DataTableErrorProps) {
  return (
    <DataTableCard>
      <DataTableEmpty
        action={
          onRetry && (
            <Button onClick={onRetry} size="sm" variant="outline">
              {retryLabel}
            </Button>
          )
        }
        description={description}
        icon={<AlertTriangleIcon />}
        title={title}
      />
    </DataTableCard>
  )
}

type DataTablePaginationProps<TData extends RowData> = {
  table: DataTableInstance<TData>
  labels?: Partial<PaginationLabels>
}

/** The table's pagination state wired to the Pagination component, for the table's footer. */
export function DataTablePagination<TData extends RowData>({
  table,
  labels,
}: DataTablePaginationProps<TData>) {
  const { pageIndex, pageSize } = table.state.pagination

  return (
    <Pagination
      labels={labels}
      onPageChange={table.setPageIndex}
      onPageSizeChange={table.setPageSize}
      pageIndex={pageIndex}
      pageSize={pageSize}
      rowCount={table.getRowCount()}
    />
  )
}
