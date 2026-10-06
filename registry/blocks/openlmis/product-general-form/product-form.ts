import { z } from "zod"

import {
  toWholeNumber,
  wholeNumberText,
} from "@/registry/components/openlmis/number-text/number-text"

/** What the product forms show and save; map your API's product onto it. */
export type Product = {
  id: string
  productCode: string
  fullProductName: string | null
  description: string | null
  dispensingUnit: string | null
  /** Set for a product sized by a size code, which then takes no dispensing unit. */
  sizeCode?: string | null
  netContent: number
  packRoundingThreshold: number
  roundToZero: boolean
}

/** A product's saved fields, trimmed, as a create or an update sends them. */
export type ProductValues = Omit<Product, "id" | "sizeCode">

/** The name a product is shown by: its full name, or its code when it has none. */
export const productName = (
  product: Pick<Product, "productCode" | "fullProductName">
) => product.fullProductName || product.productCode

const toCode = (text: string) => text.replace(/\s/g, "")

const sameCode = (a: string, b: string) =>
  toCode(a).toLowerCase() === toCode(b).toLowerCase()

const packSize = (required: string, min?: number) =>
  wholeNumberText(
    {
      required,
      invalid: "Enter a whole number, such as 1 or 12.",
      tooLarge: "Enter a number no larger than 9007199254740991.",
      tooSmall: "Enter a number of at least 1.",
    },
    { min, max: Number.MAX_SAFE_INTEGER }
  )

/** `takenCodes` are other products' codes, refused whatever their case or spacing. */
export function productFormSchema(
  takenCodes: readonly string[] = [],
  { unitRequired = true } = {}
) {
  return z.object({
    productCode: z
      .string()
      .trim()
      .min(1, "Enter a product code.")
      .refine(
        (code) => !takenCodes.some((taken) => sameCode(taken, code)),
        "Another product already has this code."
      ),
    fullProductName: z.string(),
    description: z.string(),
    dispensingUnit: unitRequired
      ? z.string().trim().min(1, "Enter a dispensing unit.")
      : z.string(),
    netContent: packSize("Enter the net content.", 1),
    packRoundingThreshold: packSize("Enter a pack rounding threshold."),
    roundToZero: z.boolean(),
  })
}

export type ProductFormValues = z.input<ReturnType<typeof productFormSchema>>

export const EMPTY_PRODUCT_FORM: ProductFormValues = {
  productCode: "",
  fullProductName: "",
  description: "",
  dispensingUnit: "",
  netContent: "",
  packRoundingThreshold: "",
  roundToZero: false,
}

export function toProductFormValues(product: Product): ProductFormValues {
  return {
    productCode: product.productCode,
    fullProductName: product.fullProductName ?? "",
    description: product.description ?? "",
    dispensingUnit: product.dispensingUnit ?? "",
    netContent: String(product.netContent),
    packRoundingThreshold: String(product.packRoundingThreshold),
    roundToZero: product.roundToZero,
  }
}

const optionalText = (text: string) => text.trim() || null

export function toProductValues(values: ProductFormValues): ProductValues {
  return {
    productCode: toCode(values.productCode),
    fullProductName: optionalText(values.fullProductName),
    description: optionalText(values.description),
    dispensingUnit: optionalText(values.dispensingUnit),
    netContent: toWholeNumber(values.netContent),
    packRoundingThreshold: toWholeNumber(values.packRoundingThreshold),
    roundToZero: values.roundToZero,
  }
}

const sameNumber = (text: string, saved: number) =>
  text.trim() !== "" && toWholeNumber(text) === saved

/** How many fields differ from the saved product. */
export function productChanges(values: ProductFormValues, saved: Product) {
  const next = toProductValues(values)
  return [
    next.productCode !== saved.productCode,
    next.fullProductName !== optionalText(saved.fullProductName ?? ""),
    next.description !== optionalText(saved.description ?? ""),
    next.dispensingUnit !== optionalText(saved.dispensingUnit ?? ""),
    !sameNumber(values.netContent, saved.netContent),
    !sameNumber(values.packRoundingThreshold, saved.packRoundingThreshold),
    next.roundToZero !== saved.roundToZero,
  ].filter(Boolean).length
}
