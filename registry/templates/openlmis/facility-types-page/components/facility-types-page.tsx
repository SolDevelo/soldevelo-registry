"use client"

import {
  type ColumnVisibilityState,
  functionalUpdate,
  type PaginationState,
  type SortingState,
  useTable,
} from "@tanstack/react-table"
import { PlusIcon, ShapesIcon } from "lucide-react"
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

import { MOCK_FACILITY_TYPES } from "./mock-facility-types"
import {
  createFacilityTypeColumns,
  FACILITY_TYPE_HIDEABLE_COLUMNS,
  type FacilityTypeSortField,
} from "./facility-type-columns"
import {
  type FacilityType,
  type FacilityTypeFormValues,
  toFacilityType,
} from "./facility-type-form-dialog/facility-type-form"
import {
  FacilityTypeFormDialog,
  type FacilityTypeFormDialogTarget,
} from "./facility-type-form-dialog/facility-type-form-dialog"

const DEFAULT_SORT = { id: "displayOrder", desc: false }
const DEFAULT_SORTING: SortingState = [DEFAULT_SORT]

const getRowId = (type: FacilityType) => type.id

const byName = (a: FacilityType, b: FacilityType) =>
  (a.name ?? "").localeCompare(b.name ?? "", undefined, {
    sensitivity: "base",
  })

// A type with no display order sorts after those with one.
const order = (type: FacilityType) =>
  type.displayOrder ?? Number.POSITIVE_INFINITY

const COMPARE: Record<
  FacilityTypeSortField,
  (a: FacilityType, b: FacilityType) => number
> = {
  displayOrder: (a, b) => order(a) - order(b),
  name: byName,
  code: (a, b) => a.code.localeCompare(b.code),
  active: (a, b) => Number(b.active) - Number(a.active),
}

type Notice = { title: string; description: string }

/** The facility types list screen; mount it from any route, e.g. the `page.tsx` this template ships. */
export function FacilityTypesPage() {
  const [types, setTypes] = useState(MOCK_FACILITY_TYPES)
  const [sorting, setSorting] = useState(DEFAULT_SORTING)
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })
  const [target, setTarget] = useState<FacilityTypeFormDialogTarget>()
  const [notice, setNotice] = useState<Notice>()
  const nextId = useRef(MOCK_FACILITY_TYPES.length + 1)
  const [measureContent, contentSize] = useContainerSize<HTMLDivElement>()
  // Kept for the visit only; store it (e.g. in localStorage) to remember it across visits.
  const columnChoices = useState<ColumnVisibilityState>({})
  const columnView = useColumnVisibility(
    FACILITY_TYPE_HIDEABLE_COLUMNS,
    columnChoices,
    contentSize
  )

  // Stable, so the columns built from it keep their identity between renders.
  const openDialog = useCallback((next: FacilityTypeFormDialogTarget) => {
    setNotice(undefined)
    setTarget(next)
  }, [])
  const columns = useMemo(
    () => createFacilityTypeColumns(openDialog),
    [openDialog]
  )

  // Every type is in memory, so sorting and paging happen here.
  const sorted = useMemo(() => {
    const [sort = DEFAULT_SORT] = sorting
    const compare = COMPARE[sort.id as FacilityTypeSortField]
    // oxlint-disable-next-line unicorn/no-array-sort -- sorts a fresh copy; toSorted needs the ES2023 lib
    return [...types].sort(
      (a, b) => (sort.desc ? -compare(a, b) : compare(a, b)) || byName(a, b)
    )
  }, [types, sorting])
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

  const editing = types.find((type) => type.id === target)

  const save = (
    values: FacilityTypeFormValues,
    saved: FacilityType | undefined
  ) => {
    const type = toFacilityType(values, saved)
    if (saved) {
      setTypes((current) =>
        current.map((item) =>
          item.id === saved.id ? { ...type, id: saved.id } : item
        )
      )
      setNotice({
        title: "Facility Type Saved",
        description: `Changes to ${type.name} are saved.`,
      })
    } else {
      const id = `type-${nextId.current++}`
      setTypes((current) => [...current, { ...type, id }])
      setNotice({
        title: "Facility Type Created",
        description: `${type.name} is ready to give to facilities.`,
      })
    }
    setTarget(undefined)
  }

  return (
    <Workspace>
      <WorkspaceHeader>
        <WorkspaceHeading>
          <WorkspaceIcon>
            <ShapesIcon />
          </WorkspaceIcon>
          <WorkspaceTitle>Facility Types</WorkspaceTitle>
          <WorkspaceDescription>
            Group facilities by what they are, such as health centers or
            district stores.
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
                columns={FACILITY_TYPE_HIDEABLE_COLUMNS}
                onReset={columnView.onReset}
                onVisibilityChange={columnView.onVisibilityChange}
                visibility={columnView.visibility}
              />
            </ListToolbarEnd>
            <div className="w-full @2xl/toolbar:w-auto">
              <Button className="w-full" onClick={() => openDialog("new")}>
                <PlusIcon data-icon="inline-start" />
                Add Facility Type
              </Button>
            </div>
          </ListToolbar>
          <DataTable
            empty={
              <DataTableEmpty
                action={
                  <Button onClick={() => openDialog("new")}>
                    <PlusIcon data-icon="inline-start" />
                    Add Facility Type
                  </Button>
                }
                description="Facility types you add appear here."
                icon={<ShapesIcon />}
                title="No Facility Types Yet"
              />
            }
            footer={sorted.length > 0 && <DataTablePagination table={table} />}
            table={table}
          />
        </div>
      </WorkspaceContent>
      <FacilityTypeFormDialog
        onClose={() => setTarget(undefined)}
        onSubmit={save}
        target={target}
        type={editing}
        types={types}
      />
    </Workspace>
  )
}
