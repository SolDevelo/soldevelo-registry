import { z } from "zod"

/** A program as the form reads and writes it; map your API's program onto it. */
export type Program = {
  id: string
  code: string
  name: string | null
  description: string | null
  active: boolean
  showNonFullSupplyTab: boolean
  periodsSkippable: boolean
  skipAuthorization: boolean
  enableDatePhysicalStockCountCompleted: boolean
}

const withoutSpaces = (code: string) => code.replace(/\s/g, "")

/** Refuses a code already taken, ignoring spaces as the server does. */
export function programFormSchema(takenCodes: readonly string[]) {
  const taken = new Set(takenCodes.map(withoutSpaces))
  return z.object({
    code: z
      .string()
      .trim()
      .min(1, "Enter a code.")
      .refine(
        (code) => !taken.has(withoutSpaces(code)),
        "Another program already has this code."
      ),
    name: z.string().trim().min(1, "Enter a name."),
    description: z.string(),
    active: z.boolean(),
    showNonFullSupplyTab: z.boolean(),
    periodsSkippable: z.boolean(),
    skipAuthorization: z.boolean(),
    enableDatePhysicalStockCountCompleted: z.boolean(),
  })
}

export type ProgramFormValues = z.infer<ReturnType<typeof programFormSchema>>

export const EMPTY_PROGRAM_FORM: ProgramFormValues = {
  code: "",
  name: "",
  description: "",
  active: true,
  showNonFullSupplyTab: false,
  periodsSkippable: false,
  skipAuthorization: false,
  enableDatePhysicalStockCountCompleted: false,
}

export function toProgramFormValues(program: Program): ProgramFormValues {
  return {
    code: program.code,
    name: program.name ?? "",
    description: program.description ?? "",
    active: program.active,
    showNonFullSupplyTab: program.showNonFullSupplyTab,
    periodsSkippable: program.periodsSkippable,
    skipAuthorization: program.skipAuthorization,
    enableDatePhysicalStockCountCompleted:
      program.enableDatePhysicalStockCountCompleted,
  }
}

/** The saved program with the form's values; a saved program keeps its code. */
export function toProgram(
  values: ProgramFormValues,
  saved?: Program
): Omit<Program, "id"> {
  return {
    ...saved,
    code: saved?.code ?? values.code.trim(),
    name: values.name.trim(),
    description: values.description.trim() || null,
    active: values.active,
    showNonFullSupplyTab: values.showNonFullSupplyTab,
    periodsSkippable: values.periodsSkippable,
    skipAuthorization: values.skipAuthorization,
    enableDatePhysicalStockCountCompleted:
      values.enableDatePhysicalStockCountCompleted,
  }
}
