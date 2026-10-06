import { z } from "zod"

const MAX_WHOLE_NUMBER = 2_147_483_647

type NumberMessages = {
  required?: string
  invalid: string
  tooLarge: string
  tooSmall?: string
  tooPrecise?: string
}

type WholeNumberRules = {
  min?: number
  max?: number
  optional?: boolean
}

/** A text field holding a whole number, kept as text so a half-typed value is never lost. */
export function wholeNumberText(
  messages: NumberMessages,
  { min, max = MAX_WHOLE_NUMBER, optional = false }: WholeNumberRules = {}
) {
  return z.string().superRefine((value, context) => {
    const text = value.trim()
    const issue = (message: string | undefined) =>
      context.addIssue({ code: "custom", message: message ?? messages.invalid })
    if (!text) {
      if (!optional) issue(messages.required)
    } else if (!/^[0-9]+$/.test(text)) issue(messages.invalid)
    else if (Number(text) > max) issue(messages.tooLarge)
    else if (min !== undefined && Number(text) < min) issue(messages.tooSmall)
  })
}

export const toWholeNumber = (text: string) => Number(text.trim())

export const toOptionalWholeNumber = (text: string) =>
  text.trim() ? toWholeNumber(text) : null

/** A text field holding a number of 0 or more, with at most `maxDecimals` decimals. */
export function decimalText(
  messages: NumberMessages,
  {
    optional = false,
    maxDecimals,
  }: { optional?: boolean; maxDecimals?: number } = {}
) {
  return z.string().superRefine((value, context) => {
    const text = value.trim()
    const issue = (message: string | undefined) =>
      context.addIssue({ code: "custom", message: message ?? messages.invalid })
    if (!text) {
      if (!optional) issue(messages.required)
    } else if (!/^[0-9]+(\.[0-9]+)?$/.test(text)) issue(messages.invalid)
    else if (Number(text) > Number.MAX_SAFE_INTEGER) issue(messages.tooLarge)
    else if (
      maxDecimals !== undefined &&
      (text.split(".")[1]?.length ?? 0) > maxDecimals
    )
      issue(messages.tooPrecise)
  })
}

export const toDecimal = (text: string) =>
  text.trim() ? Number(text.trim()) : null

export const toNumberText = (value: number | null | undefined) =>
  value == null ? "" : String(value)
