import { z } from "zod"

import type { KitProduct } from "../kit-products-dialog/kit-products-dialog"
import {
  toNumberText,
  toWholeNumber,
  wholeNumberText,
} from "@/registry/components/openlmis/number-text/number-text"

/** One product a kit unpacks into, and how many of it. */
export type KitChild = {
  product: KitProduct
  quantity: number | null
}

/** What Save hands back: each product by id, with its quantity. */
export type KitChildValues = {
  productId: string
  quantity: number
}

export const kitFormSchema = z.object({
  children: z.array(
    z.object({
      id: z.string(),
      code: z.string(),
      name: z.string(),
      quantity: wholeNumberText({
        required: "Enter a quantity.",
        invalid: "Enter a whole number, such as 0 or 12.",
        tooLarge: "Enter a number no larger than 2147483647.",
      }),
    })
  ),
})

export type KitFormValues = z.input<typeof kitFormSchema>

export type KitRow = KitFormValues["children"][number]

export const toKitRow = (product: KitProduct, quantity = ""): KitRow => ({
  id: product.id,
  code: product.productCode,
  name: product.fullProductName ?? "",
  quantity,
})

export const toKitFormValues = (
  children: readonly KitChild[]
): KitFormValues => ({
  children: children.map((child) =>
    toKitRow(child.product, toNumberText(child.quantity))
  ),
})

export const toKitChildValues = (values: KitFormValues): KitChildValues[] =>
  values.children.map((row) => ({
    productId: row.id,
    quantity: toWholeNumber(row.quantity),
  }))

/** Rows added, removed, or with a new quantity, against the saved list. */
export function kitChanges(
  rows: readonly KitRow[],
  saved: readonly KitChild[]
) {
  const savedQuantities = new Map(
    saved.map((child) => [child.product.id, child.quantity])
  )
  const kept = new Set(rows.map((row) => row.id))
  const removed = saved.filter((child) => !kept.has(child.product.id)).length
  const changed = rows.filter(
    (row) =>
      !savedQuantities.has(row.id) ||
      row.quantity.trim() === "" ||
      toWholeNumber(row.quantity) !== savedQuantities.get(row.id)
  ).length
  return removed + changed
}
