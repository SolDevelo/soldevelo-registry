"use client"

import { CalendarIcon, XIcon } from "lucide-react"
import { useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import { formatDateValue, parseDateValue, toDateValue } from "./date-value"

const FIRST_MONTH = new Date(1900, 0)
const lastMonth = () => new Date(new Date().getFullYear() + 20, 11)

/** Narrow, since a day column is too small for the full name in many languages. */
const weekdayName = (date: Date, locale: string) =>
  date.toLocaleDateString(locale, { weekday: "narrow" })

export type DatePickerProps = {
  id: string
  /** `yyyy-MM-dd`, or an empty string for no date. */
  value: string
  onValueChange: (value: string) => void
  placeholder: string
  /** Names the picker where no field label does, as in a toolbar; shown before a picked date. */
  label?: string | undefined
  /** The id of a label elsewhere, such as a field's, that names the picker. */
  labelledBy?: string | undefined
  required?: boolean | undefined
  /** Read out with a required picker, which cannot say so itself. */
  requiredLabel?: string | undefined
  disabled?: boolean | undefined
  /** Shows a clear button while a date is picked, unless the date is required. */
  clearLabel?: string | undefined
  /** The first and last days that can be picked, as `yyyy-MM-dd`. */
  earliest?: string | undefined
  latest?: string | undefined
  invalid?: boolean | undefined
  describedBy?: string | undefined
  onBlur?: (() => void) | undefined
  /** The language the picked date and weekday names are shown in. */
  dateLanguage?: string | undefined
  dir?: "ltr" | "rtl" | undefined
}

/** A date picked from a calendar; the value stays `yyyy-MM-dd` whatever language it is shown in. */
export function DatePicker({
  id,
  value,
  onValueChange,
  placeholder,
  label,
  labelledBy,
  required,
  requiredLabel = "Required",
  disabled,
  clearLabel,
  earliest,
  latest,
  invalid,
  describedBy,
  onBlur,
  dateLanguage = "en-US",
  dir,
}: DatePickerProps) {
  const labelId = labelledBy ?? `${id}-label`
  const requiredId = `${id}-required`
  const valueId = `${id}-value`
  const trigger = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState(false)
  const selected = parseDateValue(value)
  const shown = formatDateValue(value, dateLanguage)
  const clearable = Boolean(clearLabel && !required)
  const canClear = clearable && Boolean(shown) && !disabled
  const first = earliest ? parseDateValue(earliest) : undefined
  const last = latest ? parseDateValue(latest) : undefined
  const named = Boolean(label || labelledBy)

  return (
    <div className="relative">
      <Popover onOpenChange={setOpen} open={open}>
        <PopoverTrigger
          render={
            <Button
              aria-describedby={describedBy}
              aria-invalid={invalid}
              aria-labelledby={[
                named ? labelId : "",
                required ? requiredId : "",
                shown || !named ? valueId : "",
              ]
                .filter(Boolean)
                .join(" ")}
              className="w-full justify-start"
              disabled={disabled}
              id={id}
              onBlur={onBlur}
              ref={trigger}
              type="button"
              variant="outline"
            />
          }
        >
          <CalendarIcon data-icon="inline-start" />
          {required && (
            <span className="sr-only" id={requiredId}>
              {requiredLabel}
            </span>
          )}
          <span
            className={
              canClear ? "flex min-w-0 gap-1 pe-6" : "flex min-w-0 gap-1"
            }
          >
            {label && (
              <span
                className={shown ? "shrink-0 text-muted-foreground" : "sr-only"}
                id={labelledBy ? undefined : labelId}
              >
                {shown ? `${label}:` : label}
              </span>
            )}
            <span
              className={
                shown
                  ? "min-w-0 truncate"
                  : "min-w-0 truncate text-muted-foreground"
              }
              id={valueId}
            >
              {shown || placeholder}
            </span>
          </span>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          aria-labelledby={named ? labelId : valueId}
          className="w-auto p-0"
        >
          <Calendar
            // oxlint-disable-next-line jsx-a11y/no-autofocus -- moves focus to the selected day as the calendar opens
            autoFocus
            captionLayout="dropdown"
            defaultMonth={selected ?? first ?? last}
            dir={dir}
            disabled={[
              ...(first ? [{ before: first }] : []),
              ...(last ? [{ after: last }] : []),
            ]}
            endMonth={last ?? lastMonth()}
            formatters={{
              formatWeekdayName: (date) => weekdayName(date, dateLanguage),
            }}
            mode="single"
            onSelect={(date: Date | undefined) => {
              onValueChange(date ? toDateValue(date) : "")
              setOpen(false)
            }}
            required={!clearable}
            selected={selected}
            startMonth={first ?? FIRST_MONTH}
          />
        </PopoverContent>
      </Popover>
      {/* A sibling of the trigger, since a button cannot hold another button. */}
      {canClear && (
        <div className="absolute inset-y-0 end-1 flex items-center">
          <Button
            aria-label={clearLabel}
            onClick={() => {
              onValueChange("")
              trigger.current?.focus()
            }}
            size="icon-xs"
            type="button"
            variant="ghost"
          >
            <XIcon />
          </Button>
        </div>
      )}
    </div>
  )
}
