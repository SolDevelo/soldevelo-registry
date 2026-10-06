"use client"

import { useMemo, useRef, useState } from "react"

import {
  ASSIGNMENT_LABELS,
  type AssignmentKind,
  type NewAssignment,
} from "@/registry/blocks/openlmis/add-assignment-dialog/assignment-form"
import type {
  AssignmentTargets,
  DeleteAssignmentsResult,
} from "@/registry/blocks/openlmis/delete-assignments-dialog/delete-assignments-dialog"
import type { CalloutTone } from "@/registry/components/openlmis/callout/callout"

import type { AssignmentRow } from "./assignment-columns"
import {
  MOCK_FACILITIES,
  MOCK_FACILITY_TYPES,
  MOCK_GEO_LEVELS,
  MOCK_ORGANIZATIONS,
  MOCK_PROGRAMS,
  type ValidAssignment,
} from "./mock-assignments"

export type AssignmentFilters = { facilityId: string; programId: string }

export type AssignmentNotice = {
  tone: CalloutTone
  title: string
  description: string
}

const NO_FILTERS: AssignmentFilters = { facilityId: "", programId: "" }
const NOTHING_PICKED: AssignmentTargets = new Map()

const nameIn = (list: readonly { id: string; name: string }[], id: string) =>
  list.find((item) => item.id === id)?.name ?? "Unknown"

function toRow(assignment: ValidAssignment): AssignmentRow {
  const facility =
    assignment.nodeType === "facility"
      ? MOCK_FACILITIES.find((item) => item.id === assignment.nodeId)
      : undefined
  const name = facility?.name ?? nameIn(MOCK_ORGANIZATIONS, assignment.nodeId)
  const program = nameIn(MOCK_PROGRAMS, assignment.programId)
  const facilityType = nameIn(MOCK_FACILITY_TYPES, assignment.facilityTypeId)
  return {
    ...assignment,
    name,
    rowName: `${name} for ${facilityType} in ${program}`,
    program,
    facilityType,
    geoZone: facility ? facility.geoZone : null,
    geoLevel: assignment.geoLevelAffinityId
      ? nameIn(MOCK_GEO_LEVELS, assignment.geoLevelAffinityId)
      : null,
  }
}

/** The server takes the facility and the program only as a pair. */
export const isHalfFiltered = ({ facilityId, programId }: AssignmentFilters) =>
  Boolean(facilityId) !== Boolean(programId)

/** One list of valid sources or destinations, filtered, paged and edited in memory. */
export function useAssignments(
  kind: AssignmentKind,
  assignments: ValidAssignment[],
  onAssignmentsChange: (next: ValidAssignment[]) => void
) {
  const labels = ASSIGNMENT_LABELS[kind]
  const [filters, setFilters] = useState(NO_FILTERS)
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 })
  const [picked, setPicked] = useState(NOTHING_PICKED)
  const [notice, setNotice] = useState<AssignmentNotice>()
  const added = useRef(0)

  const rows = useMemo(() => {
    const { facilityId, programId } = filters
    const facility = MOCK_FACILITIES.find((item) => item.id === facilityId)
    return assignments
      .filter(
        (assignment) =>
          !facility ||
          (assignment.programId === programId &&
            assignment.facilityTypeId === facility.typeId)
      )
      .map(toRow)
  }, [assignments, filters])

  // A delete can empty the last page, so it falls back to the page that is left.
  const lastPage = Math.max(0, Math.ceil(rows.length / pagination.pageSize) - 1)
  const pageIndex = Math.min(pagination.pageIndex, lastPage)
  const pageRows = useMemo(
    () =>
      rows.slice(
        pageIndex * pagination.pageSize,
        (pageIndex + 1) * pagination.pageSize
      ),
    [rows, pageIndex, pagination.pageSize]
  )

  // The selection belongs to one filter, so changing it starts over.
  const updateFilters = (patch: Partial<AssignmentFilters>) => {
    setFilters((current) => ({ ...current, ...patch }))
    setPagination((current) => ({ ...current, pageIndex: 0 }))
    setPicked(NOTHING_PICKED)
  }

  const add = (draft: NewAssignment) => {
    const program = nameIn(MOCK_PROGRAMS, draft.programId)
    const type = nameIn(MOCK_FACILITY_TYPES, draft.facilityTypeId)
    const existing = assignments.find(
      (assignment) =>
        assignment.programId === draft.programId &&
        assignment.facilityTypeId === draft.facilityTypeId &&
        assignment.nodeId === draft.nodeId
    )
    if (existing) {
      setNotice({
        tone: "info",
        title: `Already A ${labels.one}`,
        description: `${toRow(existing).name} was already offered to ${type} in ${program}, so nothing was changed.`,
      })
      return
    }
    added.current += 1
    const assignment: ValidAssignment = {
      ...draft,
      id: `${kind}-new-${added.current}`,
    }
    onAssignmentsChange([assignment, ...assignments])
    setNotice({
      tone: "success",
      title: `${labels.one} Added`,
      description: `${toRow(assignment).name} is now offered to ${type} in ${program}.`,
    })
  }

  const remove = (ids: string[]): DeleteAssignmentsResult => {
    const locked = new Set(
      assignments.filter((item) => item.locked).map((item) => item.id)
    )
    const deleted = ids.filter((id) => !locked.has(id))
    const failed = ids.filter((id) => locked.has(id))
    if (deleted.length === 0) return { deleted, failed }

    onAssignmentsChange(
      assignments.filter((item) => !deleted.includes(item.id))
    )
    // The ones that failed stay selected, so the user can try again.
    setPicked(
      (current) => new Map([...current].filter(([id]) => !deleted.includes(id)))
    )
    setNotice(
      failed.length === 0
        ? {
            tone: "success",
            title:
              deleted.length === 1
                ? `${labels.one} Deleted`
                : `${labels.many} Deleted`,
            description:
              deleted.length === 1
                ? "1 was deleted."
                : `${deleted.length} were deleted.`,
          }
        : {
            tone: "warning",
            title: "Some Were Not Deleted",
            description: `${deleted.length} deleted, ${failed.length} could not be. Those are still selected, so you can try again.`,
          }
    )
    return { deleted, failed }
  }

  return {
    filters,
    updateFilters,
    clearFilters: () => updateFilters(NO_FILTERS),
    isHalfFiltered: isHalfFiltered(filters),
    isFiltered: Boolean(filters.facilityId || filters.programId),
    rows,
    pageRows,
    pagination: { pageIndex, pageSize: pagination.pageSize },
    setPagination,
    picked,
    setPicked,
    notice,
    dismissNotice: () => setNotice(undefined),
    add,
    remove,
  }
}
