import { z } from "zod"

/** A program a facility can support. */
export type ProgramOption = {
  id: string
  code: string
  name: string | null
}

/** A program the facility supports, and how. */
export type FacilityProgram = ProgramOption & {
  supportActive: boolean
  supportLocallyFulfilled: boolean
  /** `yyyy-MM-dd`, or empty when a legacy record has none. */
  supportStartDate: string
  /** Already stored: it cannot be removed here, and may lack a start date. */
  saved: boolean
}

/** The name a program is shown by: its name, or its code when it has none. */
export const programName = (program: Pick<ProgramOption, "code" | "name">) =>
  program.name || program.code

export const addProgramSchema = z.object({
  programId: z
    .string()
    .nullable()
    .refine((value) => Boolean(value), "Choose a program."),
  startDate: z
    .string()
    .refine((value) => value.length > 0, "Choose a start date."),
})

export type AddProgramValues = z.input<typeof addProgramSchema>

export const EMPTY_ADD_PROGRAM: AddProgramValues = {
  programId: null,
  startDate: "",
}

/** A new row for `program`: active, not locally fulfilled, from `startDate`. */
export const toFacilityProgram = (
  program: ProgramOption,
  startDate: string
): FacilityProgram => ({
  ...program,
  supportActive: true,
  supportLocallyFulfilled: false,
  supportStartDate: startDate,
  saved: false,
})

/** Programs the facility does not support yet, by name. */
export function availablePrograms(
  programs: readonly ProgramOption[],
  rows: readonly FacilityProgram[]
) {
  const added = new Set(rows.map((row) => row.id))
  return (
    programs
      .filter((program) => !added.has(program.id))
      // oxlint-disable-next-line unicorn/no-array-sort -- sorts the filtered array without requiring ES2023
      .sort((a, b) => programName(a).localeCompare(programName(b)))
  )
}

/** Legacy stored some programs without a start date; only a new row must have one. */
export const missingStartDate = (row: FacilityProgram) =>
  !row.saved && !row.supportStartDate
