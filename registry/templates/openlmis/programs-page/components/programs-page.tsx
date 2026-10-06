"use client"

import {
  type ColumnVisibilityState,
  functionalUpdate,
  type PaginationState,
  type SortingState,
  useTable,
} from "@tanstack/react-table"
import { LayersIcon, PlusIcon } from "lucide-react"
import { useCallback, useMemo, useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  DataTable,
  DataTableEmpty,
  DataTablePagination,
  dataTableFeatures,
} from "@/registry/blocks/openlmis/data-table/data-table"
import {
  useColumnVisibility,
  useContainerSize,
} from "@/registry/blocks/openlmis/data-table/responsive-columns"
import {
  ListToolbar,
  ListToolbarEnd,
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

import { MOCK_PROGRAMS } from "./mock-programs"
import {
  createProgramColumns,
  PROGRAM_HIDEABLE_COLUMNS,
  type ProgramSortField,
} from "./program-columns"
import {
  type Program,
  type ProgramFormValues,
  toProgram,
} from "./program-form-dialog/program-form"
import {
  ProgramFormDialog,
  type ProgramFormDialogTarget,
} from "./program-form-dialog/program-form-dialog"

const DEFAULT_SORT = { id: "name", desc: false }
const DEFAULT_SORTING: SortingState = [DEFAULT_SORT]

const getRowId = (program: Program) => program.id

const byName = (a: Program, b: Program) =>
  (a.name ?? "").localeCompare(b.name ?? "", undefined, {
    sensitivity: "base",
  })

const COMPARE: Record<ProgramSortField, (a: Program, b: Program) => number> = {
  name: byName,
  code: (a, b) => a.code.localeCompare(b.code),
  active: (a, b) => Number(b.active) - Number(a.active),
}

type Notice = { title: string; description: string }

/** The programs list screen; mount it from any route, e.g. the `page.tsx` this template ships. */
export function ProgramsPage() {
  const [programs, setPrograms] = useState(MOCK_PROGRAMS)
  const [sorting, setSorting] = useState(DEFAULT_SORTING)
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })
  const [target, setTarget] = useState<ProgramFormDialogTarget>()
  const [notice, setNotice] = useState<Notice>()
  const nextId = useRef(MOCK_PROGRAMS.length + 1)
  const [measureContent, contentSize] = useContainerSize<HTMLDivElement>()
  // Kept for the visit only; store it (e.g. in localStorage) to remember it across visits.
  const columnChoices = useState<ColumnVisibilityState>({})
  const columnView = useColumnVisibility(
    PROGRAM_HIDEABLE_COLUMNS,
    columnChoices,
    contentSize
  )

  // Stable, so the columns built from it keep their identity between renders.
  const openDialog = useCallback((next: ProgramFormDialogTarget) => {
    setNotice(undefined)
    setTarget(next)
  }, [])
  const columns = useMemo(() => createProgramColumns(openDialog), [openDialog])

  // Every program is in memory, so sorting and paging happen here.
  const sorted = useMemo(() => {
    const [sort = DEFAULT_SORT] = sorting
    const compare = COMPARE[sort.id as ProgramSortField]
    // oxlint-disable-next-line unicorn/no-array-sort -- sorts a fresh copy; toSorted needs the ES2023 lib
    return [...programs].sort(
      (a, b) => (sort.desc ? -compare(a, b) : compare(a, b)) || byName(a, b)
    )
  }, [programs, sorting])
  const lastPage = Math.max(
    0,
    Math.ceil(sorted.length / pagination.pageSize) - 1
  )
  const page = useMemo(
    () => ({
      ...pagination,
      pageIndex: Math.min(pagination.pageIndex, lastPage),
    }),
    [pagination, lastPage]
  )
  const data = useMemo(
    () =>
      sorted.slice(
        page.pageIndex * page.pageSize,
        (page.pageIndex + 1) * page.pageSize
      ),
    [sorted, page]
  )

  const table = useTable({
    features: dataTableFeatures,
    columns,
    data,
    getRowId,
    rowCount: sorted.length,
    manualPagination: true,
    manualSorting: true,
    enableSortingRemoval: false,
    state: {
      pagination: page,
      sorting,
      columnVisibility: columnView.visibility,
    },
    onPaginationChange: (updater) =>
      setPagination(functionalUpdate(updater, page)),
    onSortingChange: (updater) => {
      setSorting(functionalUpdate(updater, sorting))
      setPagination((current) => ({ ...current, pageIndex: 0 }))
    },
  })

  const editing = programs.find((program) => program.id === target)

  const save = (values: ProgramFormValues, saved: Program | undefined) => {
    const program = toProgram(values, saved)
    if (saved) {
      setPrograms((current) =>
        current.map((item) =>
          item.id === saved.id ? { ...program, id: saved.id } : item
        )
      )
      setNotice({
        title: "Program Saved",
        description: `Changes to ${program.name} are saved.`,
      })
    } else {
      const id = `program-${nextId.current++}`
      setPrograms((current) => [...current, { ...program, id }])
      setNotice({
        title: "Program Created",
        description: `${program.name} is ready to use.`,
      })
    }
    setTarget(undefined)
  }

  return (
    <Workspace>
      <WorkspaceHeader>
        <WorkspaceHeading>
          <WorkspaceIcon>
            <LayersIcon />
          </WorkspaceIcon>
          <WorkspaceTitle>Programs</WorkspaceTitle>
          <WorkspaceDescription>
            Lines of supply that products, requisitions, stock and roles are set
            up for.
          </WorkspaceDescription>
        </WorkspaceHeading>
      </WorkspaceHeader>
      <WorkspaceContent>
        {/* Measured, because the room for columns depends on a sidebar as well as the window. */}
        <div
          className="flex flex-col gap-4 @4xl/main:gap-6"
          ref={measureContent}
        >
          {notice && (
            <Callout title={notice.title} tone="success">
              {notice.description}
            </Callout>
          )}
          <ListToolbar>
            <ListToolbarEnd>
              <ColumnViewOptions
                columns={PROGRAM_HIDEABLE_COLUMNS}
                onReset={columnView.onReset}
                onVisibilityChange={columnView.onVisibilityChange}
                visibility={columnView.visibility}
              />
            </ListToolbarEnd>
            <div className="w-full @2xl/toolbar:w-auto">
              <Button className="w-full" onClick={() => openDialog("new")}>
                <PlusIcon data-icon="inline-start" />
                Add Program
              </Button>
            </div>
          </ListToolbar>
          <DataTable
            empty={
              <DataTableEmpty
                action={
                  <Button onClick={() => openDialog("new")}>
                    <PlusIcon data-icon="inline-start" />
                    Add Program
                  </Button>
                }
                description="Programs you add appear here."
                icon={<LayersIcon />}
                title="No Programs Yet"
              />
            }
            footer={sorted.length > 0 && <DataTablePagination table={table} />}
            table={table}
          />
        </div>
      </WorkspaceContent>
      <ProgramFormDialog
        onClose={() => setTarget(undefined)}
        onSubmit={save}
        program={editing}
        takenCodes={programs.map((program) => program.code)}
        target={target}
      />
    </Workspace>
  )
}
