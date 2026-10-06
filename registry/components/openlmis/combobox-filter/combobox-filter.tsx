"use client"

import { Combobox as ComboboxPrimitive } from "@base-ui/react"
import { XIcon } from "lucide-react"
import { useState } from "react"

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"
import { InputGroupAddon, InputGroupButton } from "@/components/ui/input-group"

import { narrowOptions } from "./narrow-options"

export type ComboboxFilterOption = {
  value: string
  label: string
  /** Muted beside the label, e.g. a facility's code. */
  description?: string
}

type ComboboxFilterProps = {
  /** The placeholder and accessible name, e.g. "Facility". */
  label: string
  /** An empty string means no filter. */
  value: string
  onValueChange: (value: string) => void
  options: ComboboxFilterOption[]
  /** Most options listed at once; past it the user is asked to type to narrow the list. */
  limit?: number
  /** Called with what the user types; the caller narrows `options` and they are listed as given. */
  onSearch?: (text: string) => void
  /** With `onSearch`, how many options match in all when `options` holds only some of them. */
  total?: number
  /** Shown when there is nothing to list. */
  emptyMessage?: string
  clearLabel?: string
  /** Shown above the options while searching, such as how many matches were left out. */
  status?: string
  onOpenChange?: (open: boolean) => void
}

/** A toolbar filter for a long list: type to narrow it, pick one value, clear it. */
export function ComboboxFilter({
  label,
  value,
  onValueChange,
  options,
  limit = 50,
  onSearch,
  total,
  emptyMessage = "No Matches",
  clearLabel = `Clear ${label}`,
  status,
  onOpenChange,
}: ComboboxFilterProps) {
  const [query, setQuery] = useState("")
  // Kept so the input still shows the pick once a search's results leave it out.
  const [picked, setPicked] = useState<ComboboxFilterOption | null>(null)
  const selected =
    options.find((option) => option.value === value) ??
    (picked?.value === value ? picked : null)
  const { items, hint } = narrowOptions(options, {
    query,
    limit,
    searched: Boolean(onSearch),
    total: onSearch ? total : undefined,
  })

  return (
    <Combobox
      // Options are narrowed above, so Base UI does not filter them again.
      filter={null}
      isItemEqualToValue={(item, option) => item.value === option.value}
      itemToStringLabel={(item) => item.label}
      items={items}
      onInputValueChange={(text, details) => {
        // Only typing counts as a search, not the selected label filling the input.
        const typed = details.reason === "input-change" ? text : ""
        setQuery(typed)
        onSearch?.(typed)
      }}
      onOpenChange={onOpenChange && ((open) => onOpenChange(open))}
      onValueChange={(item) => {
        setPicked(item)
        onValueChange(item?.value ?? "")
      }}
      value={selected}
    >
      <ComboboxInput aria-label={label} className="w-full" placeholder={label}>
        {selected !== null && (
          <InputGroupAddon align="inline-end">
            <ComboboxPrimitive.Clear
              aria-label={clearLabel}
              data-slot="combobox-clear"
              render={<InputGroupButton size="icon-xs" variant="ghost" />}
            >
              <XIcon />
            </ComboboxPrimitive.Clear>
          </InputGroupAddon>
        )}
      </ComboboxInput>
      <ComboboxContent>
        {onSearch && (
          <ComboboxPrimitive.Status className="px-3 pt-2 text-xs text-muted-foreground empty:hidden">
            {items.length > 0 && status}
          </ComboboxPrimitive.Status>
        )}
        <ComboboxEmpty>{hint ?? emptyMessage}</ComboboxEmpty>
        <ComboboxList>
          {(option: ComboboxFilterOption) => (
            <ComboboxItem key={option.value} value={option}>
              <span className="min-w-0 truncate" dir="auto">
                {option.label}
              </span>
              {option.description && (
                <span
                  className="ms-auto shrink-0 text-xs text-muted-foreground"
                  dir="auto"
                >
                  {option.description}
                </span>
              )}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}
