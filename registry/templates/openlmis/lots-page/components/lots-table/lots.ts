import type { ResponsiveColumn } from "@/registry/blocks/openlmis/data-table/responsive-columns"
import type { Lot, LotProduct } from "../lot-form-dialog/lot-form"

/** A lot with the product of its trade item, or `null` when no product has it. */
export type LotRow = Lot & { product: LotProduct | null }

/** The columns the View menu lists, in order; the lot code always shows. */
export const LOT_HIDEABLE_COLUMNS: (ResponsiveColumn & { label: string })[] = [
  { id: "productCode", label: "Product Code", hideBelow: "3xl" },
  { id: "productName", label: "Product Name" },
  { id: "expirationDate", label: "Expiry Date", hideBelow: "lg" },
  { id: "manufactureDate", label: "Manufacture Date", hideBelow: "2xl" },
]
