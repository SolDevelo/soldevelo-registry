"use client"

import {
  createColumnHelper,
  functionalUpdate,
  type PaginationState,
  type RowSelectionState,
  useTable,
} from "@tanstack/react-table"
import { useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  DataTable,
  DataTableColumnHeader,
  type DataTableFeatures,
  DataTablePagination,
  dataTableFeatures,
} from "@/registry/blocks/openlmis/data-table/data-table"

import { DataTableSelectionBar, selectionColumn } from "./table-selection"

type Assignment = { id: string; facility: string; product: string }

const FACILITIES = [
  "Comfort Health Clinic",
  "Nandumbo Health Center",
  "Balaka District Hospital",
  "Kankao Health Facility",
]
const PRODUCTS = ["Amoxicillin 250mg", "Paracetamol 500mg", "Measles Vaccine"]

const ASSIGNMENTS: Assignment[] = Array.from({ length: 23 }, (_, index) => ({
  id: String(index + 1),
  facility: FACILITIES[index % FACILITIES.length] as string,
  product: PRODUCTS[index % PRODUCTS.length] as string,
}))

const columnHelper = createColumnHelper<DataTableFeatures, Assignment>()

const columns = columnHelper.columns([
  selectionColumn<Assignment>((row) => `${row.facility}, ${row.product}`),
  columnHelper.accessor("facility", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Facility" />
    ),
  }),
  columnHelper.accessor("product", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Product" />
    ),
  }),
])

export default function Page() {
  const [rows, setRows] = useState(ASSIGNMENTS)
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 5,
  })
  // Keyed by row id, so a selection made on one page holds while another is shown.
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({
    "2": true,
    "7": true,
  })
  const selected = Object.values(rowSelection).filter(Boolean).length

  const page = useMemo(() => {
    const start = pagination.pageIndex * pagination.pageSize
    return rows.slice(start, start + pagination.pageSize)
  }, [rows, pagination])

  const table = useTable({
    features: dataTableFeatures,
    columns,
    data: page,
    getRowId: (row) => row.id,
    rowCount: rows.length,
    manualPagination: true,
    state: { pagination, rowSelection },
    onPaginationChange: (updater) =>
      setPagination((old) => functionalUpdate(updater, old)),
    onRowSelectionChange: (updater) =>
      setRowSelection((old) => functionalUpdate(updater, old)),
  })

  return (
    <div className="flex w-full max-w-3xl flex-col gap-4 p-8">
      <DataTable footer={<DataTablePagination table={table} />} table={table} />
      <DataTableSelectionBar
        count={selected}
        onClear={() => setRowSelection({})}
      >
        <Button
          onClick={() => {
            setRows((old) => old.filter((row) => !rowSelection[row.id]))
            setRowSelection({})
            setPagination((old) => ({ ...old, pageIndex: 0 }))
          }}
          size="sm"
          variant="destructive"
        >
          Delete
        </Button>
      </DataTableSelectionBar>
    </div>
  )
}
