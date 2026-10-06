import { z } from "zod"

/** A program or facility type: picked by id and shown by name. */
export type AssignmentOption = {
  id: string
  name: string
}

/** Where a reason is offered; `show` false keeps it assigned but out of the stock and requisition forms. */
export type ReasonAssignment = {
  programId: string
  facilityTypeId: string
  show: boolean
}

export type AssignmentRef = Pick<
  ReasonAssignment,
  "programId" | "facilityTypeId"
>

export const assignmentKey = (ref: AssignmentRef) =>
  `${ref.programId}|${ref.facilityTypeId}`

/** The same program and facility type can be listed once, whatever its Show. */
export function addAssignmentSchema(rows: readonly AssignmentRef[]) {
  const listed = new Set(rows.map(assignmentKey))
  return z
    .object({
      programId: z.string().min(1, "Choose a program."),
      facilityTypeId: z.string().min(1, "Choose a facility type."),
      show: z.boolean(),
    })
    .refine((pair) => !listed.has(assignmentKey(pair)), {
      message: "This program and facility type are already listed.",
      path: ["facilityTypeId"],
    })
}

export const EMPTY_ASSIGNMENT: ReasonAssignment = {
  programId: "",
  facilityTypeId: "",
  show: true,
}

/** Names an assignment's program and facility type; an unknown id shows as Unknown. */
export function assignmentNames(
  programs: readonly AssignmentOption[],
  facilityTypes: readonly AssignmentOption[]
) {
  const programNames = new Map(programs.map((item) => [item.id, item.name]))
  const typeNames = new Map(facilityTypes.map((item) => [item.id, item.name]))
  const program = (id: string) => programNames.get(id) ?? "Unknown"
  const facilityType = (id: string) => typeNames.get(id) ?? "Unknown"
  return {
    program,
    facilityType,
    pair: (ref: AssignmentRef) =>
      `${program(ref.programId)}, ${facilityType(ref.facilityTypeId)}`,
  }
}
