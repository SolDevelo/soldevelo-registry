import { z } from "zod"

/** A lot of a product, as OpenLMIS keeps it; dates are `yyyy-MM-dd`. */
export type Lot = {
  id: string
  lotCode: string
  active: boolean
  tradeItemId: string
  expirationDate: string | null
  manufactureDate: string | null
}

/** The product a lot belongs to, found through its trade item. */
export type LotProduct = {
  id: string
  productCode: string
  fullProductName: string
}

const MAX_CODE_LENGTH = 20

// The characters GS1 allows in a lot number, which the server enforces.
const CODE_CHARACTERS = /^[!"%&'()*+,\-./0-9:;<=>?A-Z_a-z]*$/

/** `refusedCodes` are codes the server said another lot of the product has. */
export function lotFormSchema(refusedCodes: readonly string[]) {
  const refused = new Set(refusedCodes.map((code) => code.toLowerCase()))
  return z.object({
    lotCode: z
      .string()
      .refine((code) => code.trim().length > 0, "Enter a lot code.")
      .refine(
        (code) => code.length <= MAX_CODE_LENGTH,
        "Use at most 20 characters."
      )
      .refine(
        (code) => CODE_CHARACTERS.test(code),
        "Use only letters, digits and ! \" % & ' ( ) * + , - . / : ; < = > ? _"
      )
      .refine(
        (code) => !refused.has(code.toLowerCase()),
        "Another lot of this product already has this code."
      ),
    expirationDate: z.string(),
    manufactureDate: z.string(),
  })
}

export type LotFormValues = z.infer<ReturnType<typeof lotFormSchema>>

export function toLotFormValues(lot: Lot): LotFormValues {
  return {
    lotCode: lot.lotCode,
    expirationDate: lot.expirationDate ?? "",
    manufactureDate: lot.manufactureDate ?? "",
  }
}

/** The saved lot with the form's values; an empty date is no date. */
export function toLot(values: LotFormValues, saved: Lot): Lot {
  return {
    ...saved,
    lotCode: values.lotCode,
    expirationDate: values.expirationDate || null,
    manufactureDate: values.manufactureDate || null,
  }
}
