"use client"

import {
  createColumnHelper,
  functionalUpdate,
  type PaginationState,
  type SortingState,
  useTable,
} from "@tanstack/react-table"
import { useMemo, useState } from "react"

import {
  DataTable,
  DataTableColumnHeader,
  type DataTableFeatures,
  DataTablePagination,
  dataTableFeatures,
} from "./data-table"

type Product = { id: string; name: string; code: string; stock: number }

const PRODUCTS: Product[] = Array.from({ length: 57 }, (_, index) => ({
  id: String(index + 1),
  name: [
    "Amoxicillin 250mg",
    "Paracetamol 500mg",
    "Oral Rehydration Salts",
    "Zinc Sulfate 20mg",
    "Measles Vaccine",
    "Artemether 20mg",
  ][index % 6] as string,
  code: `C${String(100 + index).padStart(4, "0")}`,
  stock: (index * 137) % 900,
}))

const columnHelper = createColumnHelper<DataTableFeatures, Product>()

const columns = columnHelper.columns([
  columnHelper.accessor("name", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Product" />
    ),
    meta: { className: "w-1/2" },
  }),
  columnHelper.accessor("code", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Code" />
    ),
    cell: ({ getValue }) => <span className="font-medium">{getValue()}</span>,
  }),
  columnHelper.accessor("stock", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Stock On Hand" />
    ),
    cell: ({ getValue }) => <span className="tabular-nums">{getValue()}</span>,
  }),
])

export default function Page() {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })
  const [sorting, setSorting] = useState<SortingState>([
    { id: "name", desc: false },
  ])

  // Sorted and sliced here the way a server would, since the table itself does neither.
  const page = useMemo(() => {
    const [sort] = sorting
    // oxlint-disable-next-line unicorn/no-array-sort -- sorts a copy; toSorted needs the ES2023 lib
    const sorted = [...PRODUCTS].sort((a, b) => {
      if (!sort) return 0
      const key = sort.id as keyof Product
      const order = String(a[key]).localeCompare(String(b[key]), undefined, {
        numeric: true,
      })
      return sort.desc ? -order : order
    })
    const start = pagination.pageIndex * pagination.pageSize
    return sorted.slice(start, start + pagination.pageSize)
  }, [pagination, sorting])

  const table = useTable({
    features: dataTableFeatures,
    columns,
    data: page,
    rowCount: PRODUCTS.length,
    manualPagination: true,
    manualSorting: true,
    enableSortingRemoval: false,
    state: { pagination, sorting },
    onPaginationChange: (updater) =>
      setPagination((old) => functionalUpdate(updater, old)),
    onSortingChange: (updater) => {
      setSorting((old) => functionalUpdate(updater, old))
      setPagination((old) => ({ ...old, pageIndex: 0 }))
    },
  })

  return (
    <div className="w-full max-w-4xl p-8">
      <DataTable footer={<DataTablePagination table={table} />} table={table} />
    </div>
  )
}
