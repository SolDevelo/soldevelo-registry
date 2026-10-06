import { z } from "zod"

/** A facility type as the form reads and writes it; map your API's type onto it. */
export type FacilityType = {
  id: string
  code: string
  name: string | null
  displayOrder: number | null
  active: boolean
  primaryHealthCare: boolean
}

export type TakenFacilityType = Pick<FacilityType, "id" | "code" | "name">

const MAX_WHOLE_NUMBER = 2_147_483_647

const same = (a: string | null, b: string) =>
  a?.trim().toLowerCase() === b.trim().toLowerCase()

/** Arabic-Indic and Persian digits read as their Latin ones, so any keyboard can type a number. */
const toLatinDigits = (text: string) =>
  text.replace(/[٠-٩۰-۹]/g, (digit) => {
    const code = digit.charCodeAt(0)
    return String(code - (code >= 0x06f0 ? 0x06f0 : 0x0660))
  })

const toWholeNumber = (text: string) => Number(toLatinDigits(text.trim()))

/** Refuses a code or name another type has, ignoring case; `editingId` is the type being edited. */
export function facilityTypeFormSchema(
  types: readonly TakenFacilityType[],
  editingId?: string
) {
  const others = types.filter((type) => type.id !== editingId)
  return z.object({
    code: z
      .string()
      .trim()
      .min(1, "Enter a code.")
      .refine(
        (code) => !others.some((type) => same(type.code, code)),
        "Another facility type already has this code."
      ),
    name: z
      .string()
      .trim()
      .min(1, "Enter a name.")
      .refine(
        (name) => !others.some((type) => same(type.name, name)),
        "Another facility type already has this name."
      ),
    displayOrder: z.string().superRefine((value, context) => {
      const text = toLatinDigits(value.trim())
      if (!text)
        context.addIssue({ code: "custom", message: "Enter a display order." })
      else if (!/^[0-9]+$/.test(text))
        context.addIssue({
          code: "custom",
          message: "Enter a whole number, such as 1 or 12.",
        })
      else if (Number(text) > MAX_WHOLE_NUMBER)
        context.addIssue({
          code: "custom",
          message: "Enter a number no larger than 2147483647.",
        })
    }),
    active: z.boolean(),
    primaryHealthCare: z.boolean(),
  })
}

export type FacilityTypeFormValues = z.infer<
  ReturnType<typeof facilityTypeFormSchema>
>

export const EMPTY_FACILITY_TYPE_FORM: FacilityTypeFormValues = {
  code: "",
  name: "",
  displayOrder: "1",
  active: true,
  primaryHealthCare: false,
}

export function toFacilityTypeFormValues(
  type: FacilityType
): FacilityTypeFormValues {
  return {
    code: type.code,
    name: type.name ?? "",
    displayOrder: type.displayOrder === null ? "" : String(type.displayOrder),
    active: type.active,
    primaryHealthCare: type.primaryHealthCare,
  }
}

/** The saved type with the form's values; a saved type keeps its code. */
export function toFacilityType(
  values: FacilityTypeFormValues,
  saved?: FacilityType
): Omit<FacilityType, "id"> {
  return {
    ...saved,
    code: saved?.code ?? values.code.trim(),
    name: values.name.trim(),
    displayOrder: toWholeNumber(values.displayOrder),
    active: values.active,
    primaryHealthCare: values.primaryHealthCare,
  }
}
