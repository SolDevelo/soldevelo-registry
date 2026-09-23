"use client"

import { SearchIcon, XIcon } from "lucide-react"

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"

import { useDebouncedInput } from "./use-debounced-input"

type SearchInputProps = {
  value: string
  /** Called once typing pauses, on Enter, on blur, and at once when cleared. */
  onValueChange: (value: string) => void
  placeholder?: string
  /** Accessible name, when the placeholder alone does not say what is searched. */
  label?: string
  clearLabel?: string
  /** Milliseconds of quiet before a value is reported. */
  delay?: number
}

export function SearchInput({
  value,
  onValueChange,
  placeholder = "Search...",
  label,
  clearLabel = "Clear Search",
  delay,
}: SearchInputProps) {
  const { draft, commit, inputProps } = useDebouncedInput(
    value,
    onValueChange,
    delay
  )

  return (
    <InputGroup>
      <InputGroupAddon>
        <SearchIcon />
      </InputGroupAddon>
      <InputGroupInput
        aria-label={label ?? placeholder}
        placeholder={placeholder}
        type="text"
        {...inputProps}
      />
      {draft && (
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            aria-label={clearLabel}
            onClick={() => commit("")}
            size="icon-xs"
          >
            <XIcon />
          </InputGroupButton>
        </InputGroupAddon>
      )}
    </InputGroup>
  )
}
