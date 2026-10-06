import { z } from "zod"

import {
  decimalText,
  toDecimal,
  toNumberText,
} from "@/registry/components/openlmis/number-text/number-text"
import type { NamedOption } from "../product-program-link-dialog/program-link-form"

/** How much stock facilities of one type keep, in periods of use. */
export type ApprovalStock = {
  maxPeriodsOfStock: number
  emergencyOrderPoint: number | null
  minPeriodsOfStock: number | null
}

/** One facility type approved to stock the product in one program. */
export type Approval = ApprovalStock & {
  id: string
  facilityType: NamedOption
  program: NamedOption
}

/** What Add and Save hand back: the pair is only set when adding, since an edit keeps it. */
export type ApprovalValues = ApprovalStock & {
  facilityTypeId: string
  programId: string
}

const periods = (optional: boolean) =>
  decimalText(
    {
      required: "Enter the most periods of stock.",
      invalid: "Enter a number of 0 or more, such as 3 or 1.5.",
      tooLarge: "Enter a smaller number.",
    },
    { optional }
  )

/** Refuses a facility type and program pair already approved, other than the one being edited. */
export function approvalFormSchema(
  approved: readonly Approval[],
  editingId?: string
) {
  return z
    .object({
      facilityTypeId: z
        .string()
        .nullable()
        .refine(Boolean, "Choose a facility type."),
      programId: z.string().nullable().refine(Boolean, "Choose a program."),
      maxPeriodsOfStock: periods(false),
      emergencyOrderPoint: periods(true),
      minPeriodsOfStock: periods(true),
    })
    .superRefine((values, context) => {
      const taken = approved.some(
        (approval) =>
          approval.id !== editingId &&
          approval.facilityType.id === values.facilityTypeId &&
          approval.program.id === values.programId
      )
      if (taken) {
        context.addIssue({
          code: "custom",
          path: ["programId"],
          message:
            "This facility type already stocks the product in this program.",
        })
      }
    })
}

export type ApprovalFormValues = z.input<ReturnType<typeof approvalFormSchema>>

export const EMPTY_APPROVAL_FORM: ApprovalFormValues = {
  facilityTypeId: null,
  programId: null,
  maxPeriodsOfStock: "",
  emergencyOrderPoint: "",
  minPeriodsOfStock: "",
}

export function toApprovalFormValues(approval: Approval): ApprovalFormValues {
  return {
    facilityTypeId: approval.facilityType.id,
    programId: approval.program.id,
    maxPeriodsOfStock: toNumberText(approval.maxPeriodsOfStock),
    emergencyOrderPoint: toNumberText(approval.emergencyOrderPoint),
    minPeriodsOfStock: toNumberText(approval.minPeriodsOfStock),
  }
}

export function toApprovalValues(values: ApprovalFormValues): ApprovalValues {
  return {
    facilityTypeId: values.facilityTypeId ?? "",
    programId: values.programId ?? "",
    maxPeriodsOfStock: toDecimal(values.maxPeriodsOfStock) ?? 0,
    emergencyOrderPoint: toDecimal(values.emergencyOrderPoint),
    minPeriodsOfStock: toDecimal(values.minPeriodsOfStock),
  }
}
