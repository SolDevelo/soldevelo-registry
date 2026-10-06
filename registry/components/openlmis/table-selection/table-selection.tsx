"use client"

import {
  createColumnHelper,
  type Row,
  type RowData,
  type Table,
} from "@tanstack/react-table"
import { MinusIcon, XIcon } from "lucide-react"
import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import type { DataTableFeatures } from "@/registry/blocks/openlmis/data-table/data-table"

export type TableSelectionLabels = {
  selectPage: string
  selectRow: (row: string) => string
  selectedCount: (count: number) => string
  clearSelection: string
}

// One fixed locale, so a server render and the browser print the same digits.
const count = new Intl.NumberFormat("en-US")

const defaultLabels: TableSelectionLabels = {
  selectPage: "Select Page",
  selectRow: (row) => `Select ${row}`,
  selectedCount: (selected) => `${count.format(selected)} Selected`,
  clearSelection: "Clear Selection",
}

function SelectPageCheckbox<TData extends RowData>({
  table,
  label,
}: {
  table: Table<DataTableFeatures, TData>
  label: string
}) {
  const all = table.getIsAllPageRowsSelected()

  return (
    <Checkbox
      aria-label={label}
      checked={all}
      disabled={table.getRowModel().rows.length === 0}
      indeterminate={!all && table.getIsSomePageRowsSelected()}
      onCheckedChange={(checked) => table.toggleAllPageRowsSelected(checked)}
      render={(props, state) => (
        <span {...props}>
          {state.indeterminate ? (
            <MinusIcon className="size-3.5" />
          ) : (
            props.children
          )}
        </span>
      )}
    />
  )
}

function SelectRowCheckbox<TData extends RowData>({
  row,
  label,
}: {
  row: Row<DataTableFeatures, TData>
  label: string
}) {
  return (
    <Checkbox
      aria-label={label}
      checked={row.getIsSelected()}
      disabled={!row.getCanSelect()}
      onCheckedChange={(checked) => row.toggleSelected(checked)}
    />
  )
}

/** A leading checkbox column; `rowLabel` names each row for its checkbox, e.g. the product name. */
export function selectionColumn<TData extends RowData>(
  rowLabel: (row: TData) => string,
  labels?: Partial<Pick<TableSelectionLabels, "selectPage" | "selectRow">>
) {
  const { selectPage, selectRow } = { ...defaultLabels, ...labels }

  return createColumnHelper<DataTableFeatures, TData>().display({
    id: "select",
    header: ({ table }) => (
      <SelectPageCheckbox label={selectPage} table={table} />
    ),
    cell: ({ row }) => (
      <SelectRowCheckbox label={selectRow(rowLabel(row.original))} row={row} />
    ),
    meta: { className: "w-10" },
  })
}

type DataTableSelectionBarProps = {
  /** Every selected row, including those on other pages. */
  count: number
  onClear: () => void
  /** Actions on the selection, e.g. a Delete button. */
  children: ReactNode
  labels?: Partial<
    Pick<TableSelectionLabels, "selectedCount" | "clearSelection">
  >
}

/** Floats at the bottom of the page while rows are selected, with the count, Clear and the actions. */
export function DataTableSelectionBar({
  count: selected,
  onClear,
  children,
  labels: labelOverrides,
}: DataTableSelectionBarProps) {
  const labels = { ...defaultLabels, ...labelOverrides }

  return (
    <div className="@container/selection sticky bottom-2 z-10 -mb-2 lg:-mb-4">
      {selected > 0 && (
        <div className="mx-auto flex w-full max-w-lg flex-col gap-2 rounded-xl border bg-card p-2 shadow-lg @md/selection:flex-row @md/selection:items-center @md/selection:ps-4">
          <span
            aria-hidden="true"
            className="px-2 pt-1 text-sm font-medium @md/selection:p-0"
          >
            {labels.selectedCount(selected)}
          </span>
          <div className="flex gap-2 *:flex-1 @md/selection:ms-auto @md/selection:*:flex-none">
            <Button onClick={onClear} size="sm" variant="secondary">
              <XIcon data-icon="inline-start" />
              {labels.clearSelection}
            </Button>
            {children}
          </div>
        </div>
      )}
      {/* Always mounted, so the count is announced as it changes. */}
      <span className="sr-only" role="status">
        {selected > 0 ? labels.selectedCount(selected) : ""}
      </span>
    </div>
  )
}
