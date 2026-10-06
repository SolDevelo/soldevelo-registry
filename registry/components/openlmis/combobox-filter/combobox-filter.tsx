"use client"

import { Combobox as ComboboxPrimitive } from "@base-ui/react"
import { XIcon } from "lucide-react"

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"
import { InputGroupAddon, InputGroupButton } from "@/components/ui/input-group"

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
  limit?: number
  /** Called with what the user types; the caller narrows `options` and they are listed as given. */
  onSearch?: (text: string) => void
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
  emptyMessage = "No Matches",
  clearLabel = `Clear ${label}`,
  status,
  onOpenChange,
}: ComboboxFilterProps) {
  const selected = options.find((option) => option.value === value) ?? null

  return (
    <Combobox
      // With `onSearch` the caller already narrowed the options, so they are not filtered again.
      filter={onSearch ? null : undefined}
      isItemEqualToValue={(item, picked) => item.value === picked.value}
      itemToStringLabel={(item) => item.label}
      items={options}
      limit={limit}
      onInputValueChange={
        onSearch &&
        ((text, details) =>
          onSearch(details.reason === "input-change" ? text : ""))
      }
      onOpenChange={onOpenChange && ((open) => onOpenChange(open))}
      onValueChange={(item) => onValueChange(item?.value ?? "")}
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
            {options.length > 0 && status}
          </ComboboxPrimitive.Status>
        )}
        <ComboboxEmpty>{emptyMessage}</ComboboxEmpty>
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
