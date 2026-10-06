"use client"

import { MapPinnedIcon, PlusIcon, Trash2Icon } from "lucide-react"
import { useMemo, useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
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
  type AssignmentOption,
  assignmentKey,
  assignmentNames,
  type ReasonAssignment,
} from "@/registry/blocks/openlmis/reason-assignment-dialog/reason-assignment"
import { ReasonAssignmentDialog } from "@/registry/blocks/openlmis/reason-assignment-dialog/reason-assignment-dialog"

type ReasonAssignmentsProps = {
  /** Where the reason is offered; a skeleton shows until it is set. */
  rows: readonly ReasonAssignment[] | undefined
  /** Name the rows; a missing id shows as Unknown. */
  programs: readonly AssignmentOption[] | undefined
  /** Every facility type, naming the rows, including ones no longer active. */
  facilityTypes: readonly AssignmentOption[] | undefined
  /** The facility types Add offers; defaults to `facilityTypes`. */
  activeFacilityTypes?: readonly AssignmentOption[] | undefined
  /** Called with the rows after any change; keep them until the page saves. */
  onRowsChange: (rows: ReasonAssignment[]) => void
  readOnly?: boolean
}

const NO_OPTIONS: readonly AssignmentOption[] = []

/** The programs and facility types a reason is offered for, with Show and Remove. */
export function ReasonAssignments({
  rows,
  programs,
  facilityTypes,
  activeFacilityTypes = facilityTypes,
  onRowsChange,
  readOnly = false,
}: ReasonAssignmentsProps) {
  const table = useRef<HTMLDivElement>(null)
  const addButton = useRef<HTMLButtonElement>(null)
  const [adding, setAdding] = useState(false)
  const names = useMemo(
    () => assignmentNames(programs ?? NO_OPTIONS, facilityTypes ?? NO_OPTIONS),
    [programs, facilityTypes]
  )

  if (!rows || !programs || !facilityTypes) {
    return <ReasonAssignmentsSkeleton readOnly={readOnly} rows={rows?.length} />
  }

  const remove = (index: number) => {
    onRowsChange(rows.filter((_, at) => at !== index))
    // The pressed button is gone, so the next row's takes the focus, or Add.
    requestAnimationFrame(() => {
      const buttons =
        table.current?.querySelectorAll<HTMLElement>("[data-remove-pair]")
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
            Add Program And Facility Type
          </Button>
        </div>
      )}
      <ReasonAssignmentDialog
        facilityTypes={activeFacilityTypes}
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
            <AssignmentsEmpty />
          ) : (
            <Table>
              <AssignmentsHeader />
              <TableBody>
                {rows.map((row, index) => {
                  const pair = names.pair(row)
                  return (
                    <TableRow key={assignmentKey(row)}>
                      <TableCell>
                        <span
                          className="font-medium whitespace-normal"
                          dir="auto"
                        >
                          {names.program(row.programId)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="whitespace-normal" dir="auto">
                          {names.facilityType(row.facilityTypeId)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Switch
                          aria-label={`Show For ${pair}`}
                          checked={row.show}
                          disabled={readOnly}
                          onCheckedChange={(show) =>
                            onRowsChange(
                              rows.map((item, at) =>
                                at === index ? { ...item, show } : item
                              )
                            )
                          }
                        />
                      </TableCell>
                      <TableCell>
                        {!readOnly && (
                          <div className="flex justify-end">
                            <Button
                              aria-label={`Remove ${pair}`}
                              data-remove-pair
                              onClick={() => remove(index)}
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
                })}
              </TableBody>
            </Table>
          )}
        </DataTableCard>
      </div>
    </div>
  )
}

function AssignmentsEmpty() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <MapPinnedIcon />
        </EmptyMedia>
        <EmptyTitle>Not Offered Anywhere Yet</EmptyTitle>
        <EmptyDescription>
          Add a program and facility type to offer this reason there.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}

function AssignmentsHeader() {
  return (
    <TableHeader>
      <TableRow>
        <TableHead>Program</TableHead>
        <TableHead>Facility Type</TableHead>
        <TableHead>Show</TableHead>
        <TableHead>
          <span className="sr-only">Actions</span>
        </TableHead>
      </TableRow>
    </TableHeader>
  )
}

/** As many placeholder rows as the reason has, or the empty state for none. */
function ReasonAssignmentsSkeleton({
  rows = 3,
  readOnly,
}: {
  rows?: number | undefined
  readOnly: boolean
}) {
  return (
    <div aria-busy className="flex flex-col gap-4">
      {!readOnly && (
        <div className="flex justify-end">
          <Button disabled variant="outline">
            <PlusIcon data-icon="inline-start" />
            Add Program And Facility Type
          </Button>
        </div>
      )}
      <DataTableCard>
        {rows === 0 ? (
          <AssignmentsEmpty />
        ) : (
          <Table>
            <AssignmentsHeader />
            <TableBody>
              {Array.from({ length: rows }, (_, index) => (
                // Placeholder rows have nothing else to key on.
                <TableRow key={index}>
                  <TableCell>
                    <Skeleton className="h-4 w-28" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <div className="h-4.5 w-8 animate-pulse rounded-full bg-muted" />
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end">
                      <Skeleton className="size-7" />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DataTableCard>
    </div>
  )
}
