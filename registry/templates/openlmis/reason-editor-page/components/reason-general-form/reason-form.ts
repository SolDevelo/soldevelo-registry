import { z } from "zod"

import type { TagRefusal } from "@/registry/components/openlmis/form-fields/tags"

/** Why stock moved, as OpenLMIS groups reasons; a code the server adds later shows as it is. */
export const REASON_CATEGORIES: Record<string, string> = {
  TRANSFER: "Transfer",
  ADJUSTMENT: "Adjustment",
  PHYSICAL_INVENTORY: "Physical Inventory",
  AGGREGATION: "Aggregation",
}

/** Whether the reason adds stock, takes it away, or corrects it. */
export const REASON_TYPES: Record<string, string> = {
  CREDIT: "Credit",
  DEBIT: "Debit",
  BALANCE_ADJUSTMENT: "Balance Adjustment",
}

export const categoryLabel = (code: string) => REASON_CATEGORIES[code] ?? code
export const typeLabel = (code: string) => REASON_TYPES[code] ?? code

/** What the reason forms show and save; map your API's reason onto it. */
export type ReasonValues = {
  name: string
  category: string
  type: string
  isFreeTextAllowed: boolean
  tags: string[]
}

export const EMPTY_REASON: ReasonValues = {
  name: "",
  category: "",
  type: "",
  isFreeTextAllowed: false,
  tags: [],
}

const sameName = (a: string, b: string) =>
  a.trim().localeCompare(b.trim(), undefined, { sensitivity: "accent" }) === 0

/** `takenNames` holds other reasons' names, and any the server refused. */
export function reasonFormSchema(takenNames: readonly string[] = []) {
  return z.object({
    name: z
      .string()
      .trim()
      .min(1, "Enter a name.")
      .refine(
        (name) => !takenNames.some((other) => sameName(other, name)),
        "Another reason already has this name."
      ),
    category: z.string().min(1, "Choose a category."),
    type: z.string().min(1, "Choose a type."),
    isFreeTextAllowed: z.boolean(),
    tags: z.array(z.string()),
  })
}

export const toReasonValues = (values: ReasonValues): ReasonValues => ({
  ...values,
  name: values.name.trim(),
})

/** How many fields differ from the saved reason. */
export function reasonChanges(values: ReasonValues, saved: ReasonValues) {
  return [
    values.name.trim() !== saved.name.trim(),
    values.category !== saved.category,
    values.type !== saved.type,
    values.isFreeTextAllowed !== saved.isFreeTextAllowed,
    values.tags.join("\n") !== saved.tags.join("\n"),
  ].filter(Boolean).length
}

export const TAG_REFUSALS: Record<TagRefusal, string> = {
  "too-short": "A tag needs at least 3 characters.",
  "too-long": "A tag can have at most 255 characters.",
  duplicate: "This tag is already added.",
}

/** The codes as a select lists them, with a saved code the list lacks kept on the end. */
export function toCodeItems(
  codes: readonly string[],
  label: (code: string) => string,
  current?: string
) {
  const all = current && !codes.includes(current) ? [...codes, current] : codes
  return all.map((code) => ({ value: code, label: label(code) }))
}
