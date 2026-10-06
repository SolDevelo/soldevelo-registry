"use client"

import { ListToolbar } from "@/registry/blocks/openlmis/list-toolbar/list-toolbar"
import {
  type ColumnVisibility,
  ColumnViewOptions,
} from "@/registry/components/openlmis/column-view-options/column-view-options"
import {
  ComboboxFilter,
  type ComboboxFilterOption,
} from "@/registry/components/openlmis/combobox-filter/combobox-filter"
import { DatePicker } from "@/registry/components/openlmis/date-picker/date-picker"

import { LOT_HIDEABLE_COLUMNS } from "./lots"

export type LotsFilters = {
  /** The product id, or an empty string for any product. */
  product: string
  /** `yyyy-MM-dd`, or an empty string for no bound. */
  expiryFrom: string
  expiryTo: string
}

type LotsToolbarProps = {
  filters: LotsFilters
  onFiltersChange: (patch: Partial<LotsFilters>) => void
  /** The products found for what was typed, with the picked one first. */
  productOptions: ComboboxFilterOption[]
  /** Called with what is typed in the product filter; debounce before searching. */
  onProductSearch?: (text: string) => void
  /** While a search runs, the list says so instead of showing no matches. */
  searching?: boolean
  /** Shown in the list when the product search failed. */
  searchError?: string | undefined
  /** Shown above the options, such as `productSearchStatus`'s count of those left out. */
  searchStatus?: string | undefined
  columnView: {
    visibility: ColumnVisibility
    onVisibilityChange: (visibility: ColumnVisibility) => void
    onReset?: () => void
  }
  dateLanguage?: string
}

/** A product picker, an expiry window and the View menu, above `LotsTable`. */
export function LotsToolbar({
  filters,
  onFiltersChange,
  productOptions,
  onProductSearch,
  searching = false,
  searchError,
  searchStatus,
  columnView,
  dateLanguage,
}: LotsToolbarProps) {
  return (
    <ListToolbar>
      <div className="w-full @2xl/toolbar:w-72">
        <ComboboxFilter
          emptyMessage={
            searching ? "Searching..." : (searchError ?? "No Matches")
          }
          label="Product"
          onSearch={onProductSearch}
          onValueChange={(product) => onFiltersChange({ product })}
          options={productOptions}
          status={searching ? undefined : searchStatus}
          value={filters.product}
        />
      </div>
      <div className="min-w-64 flex-1 @2xl/toolbar:max-w-80">
        <DatePicker
          clearLabel="Clear Earliest Expiry Date"
          dateLanguage={dateLanguage}
          id="lots-earliest-expiry"
          label="Earliest Expiry Date"
          latest={filters.expiryTo || undefined}
          onValueChange={(expiryFrom) => onFiltersChange({ expiryFrom })}
          placeholder="Earliest Expiry Date"
          value={filters.expiryFrom}
        />
      </div>
      <div className="min-w-64 flex-1 @2xl/toolbar:max-w-80">
        <DatePicker
          clearLabel="Clear Latest Expiry Date"
          dateLanguage={dateLanguage}
          earliest={filters.expiryFrom || undefined}
          id="lots-latest-expiry"
          label="Latest Expiry Date"
          onValueChange={(expiryTo) => onFiltersChange({ expiryTo })}
          placeholder="Latest Expiry Date"
          value={filters.expiryTo}
        />
      </div>
      <div className="@2xl/toolbar:ms-auto">
        <ColumnViewOptions
          columns={LOT_HIDEABLE_COLUMNS}
          onReset={columnView.onReset}
          onVisibilityChange={columnView.onVisibilityChange}
          visibility={columnView.visibility}
        />
      </div>
    </ListToolbar>
  )
}
