import { z } from "zod"

/** A facility type, zone or operator: picked by id and shown by name. */
export type FacilityOption = {
  id: string
  name: string
  /** Shown under the name in the list, e.g. a zone's level. */
  description?: string
}

/** What the facility forms show and save; map your API's facility onto it. */
export type FacilityValues = {
  name: string
  code: string
  typeId: string | null
  zoneId: string | null
  /** `yyyy-MM-dd`, or empty for none. */
  goLiveDate: string
  description: string
  operatorId: string | null
  active: boolean
  enabled: boolean
}

export const EMPTY_FACILITY: FacilityValues = {
  name: "",
  code: "",
  typeId: null,
  zoneId: null,
  goLiveDate: "",
  description: "",
  operatorId: null,
  active: true,
  enabled: true,
}

const requiredText = (message: string) =>
  z.string().refine((value) => value.trim().length > 0, message)

const requiredChoice = (message: string) =>
  z
    .string()
    .nullable()
    .refine((value) => Boolean(value), message)

const comparableCode = (code: string) => code.trim().toLowerCase()

type FacilitySchemaOptions = {
  /** Other facilities' codes, and any the server refused, turned down as this one's. */
  takenCodes?: readonly string[]
  /** A saved facility must keep an operational date. */
  goLiveDateRequired?: boolean
  /** Managed by another system: its name and code cannot change, so they are not checked. */
  locked?: boolean
}

export function facilityFormSchema({
  takenCodes = [],
  goLiveDateRequired = false,
  locked = false,
}: FacilitySchemaOptions = {}) {
  const taken = new Set(takenCodes.map(comparableCode))
  return z.object({
    name: locked ? z.string() : requiredText("Enter a name."),
    code: locked
      ? z.string()
      : requiredText("Enter a code.").refine(
          (code) => !taken.has(comparableCode(code)),
          "Another facility already has this code."
        ),
    typeId: requiredChoice("Choose a facility type."),
    zoneId: requiredChoice("Choose a geographic zone."),
    goLiveDate: goLiveDateRequired
      ? requiredText("Choose an operational date.")
      : z.string(),
    description: z.string(),
    operatorId: z.string().nullable(),
    active: z.boolean(),
    enabled: z.boolean(),
  })
}

/** The values as a save sends them: text trimmed. */
export const toFacilityValues = (values: FacilityValues): FacilityValues => ({
  ...values,
  name: values.name.trim(),
  code: values.code.trim(),
  description: values.description.trim(),
})

/** How many fields differ from the saved facility. */
export function facilityChanges(values: FacilityValues, saved: FacilityValues) {
  return (Object.keys(saved) as (keyof FacilityValues)[]).filter((key) => {
    const value = values[key]
    const before = saved[key]
    return typeof value === "string" && typeof before === "string"
      ? value.trim() !== before.trim()
      : value !== before
  }).length
}

/** Options as a combobox lists them, by name. */
export const toFacilityItems = (options: readonly FacilityOption[]) =>
  options
    .map((option) => ({
      value: option.id,
      label: option.name,
      ...(option.description && { description: option.description }),
    }))
    // oxlint-disable-next-line unicorn/no-array-sort -- sorts the new array without requiring ES2023
    .sort((a, b) => a.label.localeCompare(b.label))
