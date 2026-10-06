"use client"

import {
  type ColumnVisibilityState,
  functionalUpdate,
  type RowSelectionState,
  useTable,
} from "@tanstack/react-table"
import {
  ArrowDownToLineIcon,
  ArrowUpFromLineIcon,
  MapPinnedIcon,
  PlusIcon,
  SearchXIcon,
  Trash2Icon,
} from "lucide-react"
import { useCallback, useMemo, useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  ASSIGNMENT_LABELS,
  type AssignmentKind,
} from "./add-assignment-dialog/assignment-form"
import { AddAssignmentDialog } from "./add-assignment-dialog/add-assignment-dialog"
import {
  DataTable,
  DataTableCard,
  DataTableEmpty,
  DataTablePagination,
  dataTableFeatures,
} from "@/registry/blocks/openlmis/data-table/data-table"
import {
  useColumnVisibility,
  useContainerSize,
} from "@/registry/blocks/openlmis/data-table/responsive-columns"
import {
  type AssignmentTargets,
  DeleteAssignmentsDialog,
} from "./delete-assignments-dialog/delete-assignments-dialog"
import {
  ListToolbar,
  ListToolbarEnd,
  ListToolbarFilter,
  ListToolbarSearch,
} from "@/registry/blocks/openlmis/list-toolbar/list-toolbar"
import {
  Workspace,
  WorkspaceContent,
  WorkspaceDescription,
  WorkspaceHeader,
  WorkspaceHeading,
  WorkspaceIcon,
  WorkspaceTitle,
} from "@/registry/blocks/openlmis/workspace/workspace"
import { Callout } from "@/registry/components/openlmis/callout/callout"
import { ColumnViewOptions } from "@/registry/components/openlmis/column-view-options/column-view-options"
import { ComboboxFilter } from "@/registry/components/openlmis/combobox-filter/combobox-filter"
import { SelectFilter } from "@/registry/components/openlmis/select-filter/select-filter"
import { DataTableSelectionBar } from "@/registry/components/openlmis/table-selection/table-selection"
import {
  WorkspaceTabs,
  WorkspaceTabsContent,
  WorkspaceTabsList,
  WorkspaceTabsTrigger,
} from "@/registry/components/openlmis/workspace-tabs/workspace-tabs"

import {
  type AssignmentRow,
  createAssignmentColumns,
  HIDEABLE_COLUMNS,
} from "./assignment-columns"
import {
  MOCK_ASSIGNMENTS,
  MOCK_FACILITIES,
  MOCK_FACILITY_TYPES,
  MOCK_GEO_LEVELS,
  MOCK_ORGANIZATIONS,
  MOCK_PROGRAMS,
  type ValidAssignment,
} from "./mock-assignments"
import { useAssignments } from "./use-assignments"

const DESCRIPTIONS = {
  sources: "Where each type of facility may receive stock from, per program.",
  destinations: "Where each type of facility may issue stock to, per program.",
} as const satisfies Record<AssignmentKind, string>

const FACILITY_OPTIONS = MOCK_FACILITIES.map((facility) => ({
  value: facility.id,
  label: facility.name,
  description: facility.code,
}))

const PROGRAM_OPTIONS = MOCK_PROGRAMS.map((program) => ({
  value: program.id,
  label: program.name,
}))

const getRowId = (row: AssignmentRow) => row.id

/** Valid sources and destinations as tabs of one screen; mount it from any route, or split the tabs into two routes. */
export function ValidAssignmentsPage() {
  const [kind, setKind] = useState<AssignmentKind>("sources")
  const [assignments, setAssignments] = useState(MOCK_ASSIGNMENTS)
  const labels = ASSIGNMENT_LABELS[kind]
  const Icon =
    kind === "destinations" ? ArrowUpFromLineIcon : ArrowDownToLineIcon

  return (
    <Workspace>
      <WorkspaceHeader>
        <WorkspaceHeading>
          <WorkspaceIcon>
            <Icon />
          </WorkspaceIcon>
          <WorkspaceTitle>{labels.many}</WorkspaceTitle>
          <WorkspaceDescription>{DESCRIPTIONS[kind]}</WorkspaceDescription>
        </WorkspaceHeading>
      </WorkspaceHeader>
      <WorkspaceContent>
        <WorkspaceTabs
          onValueChange={(next) => setKind(next as AssignmentKind)}
          value={kind}
        >
          <WorkspaceTabsList label="Assignment Lists" wrap="grid">
            <WorkspaceTabsTrigger value="sources">
              Valid Sources
            </WorkspaceTabsTrigger>
            <WorkspaceTabsTrigger value="destinations">
              Valid Destinations
            </WorkspaceTabsTrigger>
          </WorkspaceTabsList>
          {(["sources", "destinations"] as const).map((tab) => (
            <WorkspaceTabsContent key={tab} value={tab}>
              <AssignmentsList
                assignments={assignments[tab]}
                kind={tab}
                onAssignmentsChange={(next) =>
                  setAssignments((current) => ({ ...current, [tab]: next }))
                }
              />
            </WorkspaceTabsContent>
          ))}
        </WorkspaceTabs>
      </WorkspaceContent>
    </Workspace>
  )
}

type AssignmentsListProps = {
  kind: AssignmentKind
  assignments: ValidAssignment[]
  onAssignmentsChange: (next: ValidAssignment[]) => void
}

function AssignmentsList({
  kind,
  assignments,
  onAssignmentsChange,
}: AssignmentsListProps) {
  const labels = ASSIGNMENT_LABELS[kind]
  const list = useAssignments(kind, assignments, onAssignmentsChange)
  const { picked, setPicked, pageRows } = list
  const [adding, setAdding] = useState(false)
  const [deleting, setDeleting] = useState<AssignmentTargets>()
  const focusAfterDelete = useRef<HTMLElement>(null)
  const [deletedCount, setDeletedCount] = useState(0)
  const [deleteError, setDeleteError] = useState<string>()

  const [measureContent, contentSize] = useContainerSize<HTMLElement>()
  const contentRef = useCallback(
    (node: HTMLElement | null) => {
      focusAfterDelete.current = node
      measureContent(node)
    },
    [measureContent]
  )
  // Kept for the visit only; store it (e.g. in localStorage) to remember it across visits.
  const columnChoices = useState<ColumnVisibilityState>({})
  const columnView = useColumnVisibility(
    HIDEABLE_COLUMNS,
    columnChoices,
    contentSize
  )

  const deleteOne = useCallback((row: AssignmentRow) => {
    setDeletedCount(0)
    setDeleting(new Map([[row.id, row.rowName]]))
  }, [])
  const columns = useMemo(() => createAssignmentColumns(deleteOne), [deleteOne])
  // Memoized: the table compares controlled state by reference.
  const rowSelection = useMemo<RowSelectionState>(
    () => Object.fromEntries([...picked.keys()].map((id) => [id, true])),
    [picked]
  )

  const table = useTable({
    features: dataTableFeatures,
    columns,
    data: pageRows,
    getRowId,
    rowCount: list.rows.length,
    manualPagination: true,
    enableSorting: false,
    state: {
      pagination: list.pagination,
      columnVisibility: columnView.visibility,
      rowSelection,
    },
    onPaginationChange: (updater) =>
      list.setPagination(functionalUpdate(updater, list.pagination)),
    // Rows on other pages stay selected, named by what was on screen when they were picked.
    onRowSelectionChange: (updater) => {
      const next = functionalUpdate(updater, rowSelection)
      const names = new Map(pageRows.map((row) => [row.id, row.rowName]))
      setPicked(
        new Map(
          Object.keys(next)
            .filter((id) => next[id])
            .map((id) => [id, names.get(id) ?? picked.get(id) ?? id])
        )
      )
    },
  })

  const closeDelete = () => {
    setDeleting(undefined)
    setDeleteError(undefined)
  }

  return (
    // Measured, because the room for columns depends on a sidebar as well as the window.
    <section
      aria-label={labels.many}
      className="flex flex-col gap-4 outline-none @4xl/main:gap-6"
      ref={contentRef}
      tabIndex={-1}
    >
      <ListToolbar>
        <ListToolbarSearch>
          <ComboboxFilter
            label="Available To"
            onValueChange={(facilityId) => list.updateFilters({ facilityId })}
            options={FACILITY_OPTIONS}
            value={list.filters.facilityId}
          />
        </ListToolbarSearch>
        <ListToolbarFilter>
          <SelectFilter
            label="Program"
            onValueChange={(programId) => list.updateFilters({ programId })}
            options={PROGRAM_OPTIONS}
            value={list.filters.programId}
          />
        </ListToolbarFilter>
        <ListToolbarEnd>
          <ColumnViewOptions
            columns={[...HIDEABLE_COLUMNS]}
            onReset={columnView.onReset}
            onVisibilityChange={columnView.onVisibilityChange}
            visibility={columnView.visibility}
          />
        </ListToolbarEnd>
        <div className="w-full @2xl/toolbar:w-auto">
          <Button className="w-full" onClick={() => setAdding(true)}>
            <PlusIcon data-icon="inline-start" />
            Add {labels.one}
          </Button>
        </div>
      </ListToolbar>

      {list.notice && (
        <Callout
          action={
            <Button onClick={list.dismissNotice} size="sm" variant="ghost">
              Dismiss
            </Button>
          }
          title={list.notice.title}
          tone={list.notice.tone}
        >
          {list.notice.description}
        </Callout>
      )}

      {list.isHalfFiltered ? (
        <DataTableCard>
          <DataTableEmpty
            action={
              <Button onClick={list.clearFilters} variant="destructive">
                Clear Filters
              </Button>
            }
            description={
              list.filters.facilityId
                ? "Pick a program as well, to see what this facility may use in it."
                : "Pick a facility as well, to see what it may use in this program."
            }
            icon={<SearchXIcon />}
            title="Pick Both Filters"
          />
        </DataTableCard>
      ) : (
        <DataTable
          empty={
            list.isFiltered ? (
              <DataTableEmpty
                action={
                  <Button onClick={list.clearFilters} variant="destructive">
                    Clear Filters
                  </Button>
                }
                description={`This facility has no ${labels.many.toLowerCase()} in this program.`}
                icon={<SearchXIcon />}
                title="Nothing Available"
              />
            ) : (
              <DataTableEmpty
                description={`Add one to let a facility type ${labels.flow} a place.`}
                icon={<MapPinnedIcon />}
                title={`No ${labels.many} Yet`}
              />
            )
          }
          footer={list.rows.length > 0 && <DataTablePagination table={table} />}
          table={table}
        />
      )}

      <DataTableSelectionBar
        count={picked.size}
        onClear={() => setPicked(new Map())}
      >
        <Button
          onClick={() => {
            setDeletedCount(0)
            setDeleting(picked)
          }}
          size="sm"
          variant="destructive"
        >
          <Trash2Icon data-icon="inline-start" />
          Delete Selected
        </Button>
      </DataTableSelectionBar>

      <DeleteAssignmentsDialog
        deletedCount={deletedCount}
        focusAfterDelete={focusAfterDelete}
        error={deleteError}
        kind={kind}
        onClose={closeDelete}
        onConfirm={(ids) => {
          const { deleted, failed } = list.remove(ids)
          if (deleted.length > 0) {
            setDeletedCount(deleted.length)
            return closeDelete()
          }
          // The server refused every one, so retrying the same request will not help.
          setDeleteError(
            failed.length === 1
              ? "The server refused to delete it, probably because it is still in use."
              : `The server refused to delete all ${failed.length}, probably because they are still in use.`
          )
        }}
        targets={deleting}
      />
      <AddAssignmentDialog
        canPickOrganizations
        facilities={MOCK_FACILITIES}
        facilityTypes={MOCK_FACILITY_TYPES}
        geoLevels={MOCK_GEO_LEVELS}
        kind={kind}
        onClose={() => setAdding(false)}
        onSubmit={(assignment) => {
          list.add(assignment)
          setAdding(false)
        }}
        open={adding}
        organizations={MOCK_ORGANIZATIONS}
        programs={MOCK_PROGRAMS}
      />
    </section>
  )
}
