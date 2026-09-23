"use client"

import { XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export type SelectFilterOption = {
  value: string
  label: string
}

type SelectFilterProps = {
  /** Shown muted, alone while nothing is picked and before the pick after, e.g. "Status: Active". */
  label: string
  /** An empty string means no filter. */
  value: string
  onValueChange: (value: string) => void
  options: SelectFilterOption[]
  /** Accessible name of the clear button; defaults to "Clear {label}". */
  clearLabel?: string
}

/** A toolbar dropdown that narrows a list to one value, with a button to clear it. */
export function SelectFilter({
  label,
  value,
  onValueChange,
  options,
  clearLabel = `Clear ${label}`,
}: SelectFilterProps) {
  return (
    <div className="relative">
      <Select
        items={options}
        onValueChange={(next) => onValueChange(next ?? "")}
        value={value || null}
      >
        <SelectTrigger className="w-full">
          <span className="flex min-w-0 items-center gap-1 pe-8">
            {value ? (
              <>
                <span className="text-muted-foreground">{label}:</span>
                <SelectValue />
              </>
            ) : (
              <span className="text-muted-foreground">{label}</span>
            )}
          </span>
        </SelectTrigger>
        <SelectContent alignItemWithTrigger={false}>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {/* A sibling of the trigger, not inside it, since a button cannot hold another button. */}
      {value && (
        <div className="absolute inset-y-0 end-7 flex items-center">
          <Button
            aria-label={clearLabel}
            onClick={() => onValueChange("")}
            size="icon-xs"
            variant="ghost"
          >
            <XIcon />
          </Button>
        </div>
      )}
    </div>
  )
}
