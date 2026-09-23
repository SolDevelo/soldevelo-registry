"use client"

import type { RowData } from "@tanstack/react-table"

import {
  Pagination,
  type PaginationLabels,
} from "@/registry/components/openlmis/pagination/pagination"

import type { DataTableInstance } from "./data-table"

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
