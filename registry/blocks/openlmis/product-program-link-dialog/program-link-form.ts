import { z } from "zod"

import {
  decimalText,
  toDecimal,
  toNumberText,
  toOptionalWholeNumber,
  wholeNumberText,
} from "@/registry/components/openlmis/number-text/number-text"

/** A program, or an orderable display category: anything picked by id and shown by name. */
export type NamedOption = {
  id: string
  name: string
}

/** How a product is offered in one program. */
export type ProgramLink = {
  programId: string
  /** The orderable display category, which groups the product on requisitions. */
  categoryId: string | null
  /** False once the program stops offering it; left out, it counts as active. */
  active?: boolean
  fullSupply: boolean
  dosesPerPatient: number | null
  displayOrder: number | null
  pricePerPack: number | null
}

const optionalWholeNumber = () =>
  wholeNumberText(
    {
      invalid: "Enter a whole number, such as 1 or 12.",
      tooLarge: "Enter a number no larger than 2147483647.",
    },
    { optional: true }
  )

export const programLinkFormSchema = z.object({
  programId: z.string().nullable().refine(Boolean, "Choose a program."),
  fullSupply: z.boolean(),
  dosesPerPatient: optionalWholeNumber(),
  categoryId: z
    .string()
    .nullable()
    .refine(Boolean, "Choose a display category."),
  displayOrder: optionalWholeNumber(),
  pricePerPack: decimalText(
    {
      invalid: "Enter a price such as 20 or 20.75.",
      tooLarge: "Enter a smaller price.",
      tooPrecise: "Enter a price with no more than two decimals.",
    },
    { optional: true, maxDecimals: 2 }
  ),
})

export type ProgramLinkFormValues = z.input<typeof programLinkFormSchema>

export const EMPTY_PROGRAM_LINK_FORM: ProgramLinkFormValues = {
  programId: null,
  fullSupply: false,
  dosesPerPatient: "",
  categoryId: null,
  displayOrder: "",
  pricePerPack: "",
}

export function toProgramLinkFormValues(
  link: ProgramLink
): ProgramLinkFormValues {
  return {
    programId: link.programId,
    fullSupply: link.fullSupply,
    dosesPerPatient: toNumberText(link.dosesPerPatient),
    categoryId: link.categoryId,
    displayOrder: toNumberText(link.displayOrder),
    pricePerPack: toNumberText(link.pricePerPack),
  }
}

export function toProgramLink(
  values: ProgramLinkFormValues,
  saved?: ProgramLink
): ProgramLink {
  return {
    programId: values.programId ?? "",
    active: saved?.active ?? true,
    fullSupply: values.fullSupply,
    dosesPerPatient: toOptionalWholeNumber(values.dosesPerPatient),
    categoryId: values.categoryId,
    displayOrder: toOptionalWholeNumber(values.displayOrder),
    pricePerPack: toDecimal(values.pricePerPack),
  }
}

/** The links with `link` added, or replacing the one for its program. */
export function withProgramLink(
  links: readonly ProgramLink[],
  link: ProgramLink
) {
  return links.some((item) => item.programId === link.programId)
    ? links.map((item) => (item.programId === link.programId ? link : item))
    : [...links, link]
}

export const withoutProgramLink = (
  links: readonly ProgramLink[],
  programId: string
) => links.filter((link) => link.programId !== programId)

/** Programs the product is not offered in yet, by name. */
export function unlinkedPrograms(
  programs: readonly NamedOption[],
  links: readonly ProgramLink[]
) {
  const linked = new Set(links.map((link) => link.programId))
  return (
    programs
      .filter((program) => !linked.has(program.id))
      // oxlint-disable-next-line unicorn/no-array-sort -- sorts a fresh array; toSorted needs the ES2023 lib
      .sort((a, b) => a.name.localeCompare(b.name))
  )
}
