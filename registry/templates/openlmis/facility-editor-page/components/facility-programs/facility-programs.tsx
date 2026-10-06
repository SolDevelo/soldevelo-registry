"use client"

import { BuildingIcon, PlusIcon, Trash2Icon } from "lucide-react"
import { useId, useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { FieldError } from "@/components/ui/field"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { DataTableCard } from "@/registry/blocks/openlmis/data-table/data-table"
import {
  type FacilityProgram,
  missingStartDate,
  type ProgramOption,
  programName,
} from "../facility-program-dialog/facility-program"
import { FacilityProgramDialog } from "../facility-program-dialog/facility-program-dialog"
import { DatePicker } from "@/registry/components/openlmis/date-picker/date-picker"

type FacilityProgramsProps = {
  /** The facility's programs; a skeleton shows until they are set. */
  rows: readonly FacilityProgram[] | undefined
  /** Every program, offered by Add Program; its form shows a skeleton until set. */
  programs: readonly ProgramOption[] | undefined
  /** Called with the rows after any change; keep them until the page saves. */
  onRowsChange: (rows: FacilityProgram[]) => void
  /** Marks new rows that still need a start date, e.g. after a submit. */
  showErrors?: boolean
  /** Shows the programs without letting them change. */
  readOnly?: boolean
}

const HEADINGS = ["Program", "Active", "Start Date", "Locally Fulfilled"]

/** The programs a facility supports: switch them on and off, date them, add new ones. */
export function FacilityPrograms({
  rows,
  programs,
  onRowsChange,
  showErrors = false,
  readOnly = false,
}: FacilityProgramsProps) {
  const idPrefix = useId()
  const table = useRef<HTMLDivElement>(null)
  const addButton = useRef<HTMLButtonElement>(null)
  const [adding, setAdding] = useState(false)

  if (!rows) return <FacilityProgramsSkeleton readOnly={readOnly} />

  const update = (index: number, change: Partial<FacilityProgram>) =>
    onRowsChange(
      rows.map((row, at) => (at === index ? { ...row, ...change } : row))
    )
  const remove = (index: number) => {
    onRowsChange(rows.filter((_, at) => at !== index))
    // The pressed button is gone, so the next row's takes the focus, or Add Program.
    requestAnimationFrame(() => {
      const buttons = table.current?.querySelectorAll<HTMLElement>(
        "[data-remove-program]"
      )
      const next = buttons?.[Math.min(index, buttons.length - 1)]
      ;(next ?? addButton.current)?.focus()
    })
  }

  return (
    <div className="flex flex-col gap-4">
      {!readOnly && (
        <div className="flex justify-end">
          <Button
            onClick={() => setAdding(true)}
            ref={addButton}
            variant="outline"
          >
            <PlusIcon data-icon="inline-start" />
            Add Program
          </Button>
        </div>
      )}
      <FacilityProgramDialog
        onAdd={(row) => {
          onRowsChange([...rows, row])
          setAdding(false)
        }}
        onClose={() => setAdding(false)}
        open={adding}
        programs={programs}
        rows={rows}
      />
      <div ref={table}>
        <DataTableCard>
          {rows.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <BuildingIcon />
                </EmptyMedia>
                <EmptyTitle>No Programs Yet</EmptyTitle>
                <EmptyDescription>
                  {readOnly
                    ? "This facility does not support any program yet."
                    : "Add the programs this facility supports."}
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <Table>
              <ProgramsHeader />
              <TableBody>
                {rows.map((row, index) => (
                  <ProgramRow
                    id={`${idPrefix}-${row.id}`}
                    invalid={showErrors && missingStartDate(row)}
                    key={row.id}
                    onChange={(change) => update(index, change)}
                    onRemove={() => remove(index)}
                    readOnly={readOnly}
                    row={row}
                  />
                ))}
              </TableBody>
            </Table>
          )}
        </DataTableCard>
      </div>
    </div>
  )
}

function ProgramsHeader() {
  return (
    <TableHeader>
      <TableRow>
        {HEADINGS.map((heading) => (
          <TableHead key={heading}>{heading}</TableHead>
        ))}
        <TableHead>
          <span className="sr-only">Actions</span>
        </TableHead>
      </TableRow>
    </TableHeader>
  )
}

type ProgramRowProps = {
  row: FacilityProgram
  id: string
  invalid: boolean
  readOnly: boolean
  onChange: (change: Partial<FacilityProgram>) => void
  onRemove: () => void
}

function ProgramRow({
  row,
  id,
  invalid,
  readOnly,
  onChange,
  onRemove,
}: ProgramRowProps) {
  const name = programName(row)

  return (
    <TableRow>
      <TableCell>
        <span className="font-medium whitespace-normal" dir="auto">
          {name}
        </span>
      </TableCell>
      <TableCell>
        <Switch
          aria-label={`${name} Active`}
          checked={row.supportActive}
          disabled={readOnly}
          onCheckedChange={(checked) => onChange({ supportActive: checked })}
        />
      </TableCell>
      <TableCell>
        <div className="flex min-w-44 flex-col gap-1">
          <span className="sr-only" id={`${id}-label`}>
            {name} Start Date
          </span>
          <DatePicker
            describedBy={invalid ? `${id}-error` : undefined}
            disabled={readOnly}
            id={`${id}-start`}
            invalid={invalid}
            labelledBy={`${id}-label`}
            onValueChange={(value) => onChange({ supportStartDate: value })}
            placeholder="Pick A Date"
            required={!row.saved}
            value={row.supportStartDate}
          />
          {invalid && (
            <FieldError id={`${id}-error`}>Choose a start date.</FieldError>
          )}
        </div>
      </TableCell>
      <TableCell>
        <Switch
          aria-label={`${name} Locally Fulfilled`}
          checked={row.supportLocallyFulfilled}
          disabled={readOnly}
          onCheckedChange={(checked) =>
            onChange({ supportLocallyFulfilled: checked })
          }
        />
      </TableCell>
      <TableCell>
        {!row.saved && !readOnly && (
          <div className="flex justify-end">
            <Button
              aria-label={`Remove ${name}`}
              data-remove-program
              onClick={onRemove}
              size="icon-sm"
              variant="destructive"
            >
              <Trash2Icon />
            </Button>
          </div>
        )}
      </TableCell>
    </TableRow>
  )
}

function FacilityProgramsSkeleton({ readOnly }: { readOnly: boolean }) {
  return (
    <div aria-busy className="flex flex-col gap-4">
      {!readOnly && (
        <div className="flex justify-end">
          <Button disabled variant="outline">
            <PlusIcon data-icon="inline-start" />
            Add Program
          </Button>
        </div>
      )}
      <DataTableCard>
        <Table>
          <ProgramsHeader />
          <TableBody>
            {[0, 1, 2].map((row) => (
              <TableRow key={row}>
                <TableCell>
                  <Skeleton className="h-4 w-28" />
                </TableCell>
                <TableCell>
                  <div className="h-4.5 w-8 animate-pulse rounded-full bg-muted" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-8 w-44" />
                </TableCell>
                <TableCell>
                  <div className="h-4.5 w-8 animate-pulse rounded-full bg-muted" />
                </TableCell>
                <TableCell />
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DataTableCard>
    </div>
  )
}
