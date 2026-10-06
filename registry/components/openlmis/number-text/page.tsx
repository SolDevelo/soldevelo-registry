"use client"

import { useState } from "react"

import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

import {
  decimalText,
  toDecimal,
  toWholeNumber,
  wholeNumberText,
} from "./number-text"

const quantity = wholeNumberText({
  required: "Enter a quantity.",
  invalid: "Enter a whole number, such as 0 or 12.",
  tooLarge: "Enter a number no larger than 2147483647.",
})

const price = decimalText(
  {
    invalid: "Enter a price, such as 2 or 2.50.",
    tooLarge: "Enter a smaller price.",
    tooPrecise: "Enter no more than 2 decimals.",
  },
  { optional: true, maxDecimals: 2 }
)

function NumberTextField({
  id,
  label,
  initial,
  schema,
  toNumber,
}: {
  id: string
  label: string
  initial: string
  schema: typeof quantity
  toNumber: (text: string) => number | null
}) {
  const [text, setText] = useState(initial)
  const result = schema.safeParse(text)
  const message = result.success ? undefined : result.error.issues[0]?.message

  return (
    <Field data-invalid={!!message}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Input
        aria-invalid={!!message}
        id={id}
        inputMode="decimal"
        onChange={(event) => setText(event.target.value)}
        value={text}
      />
      {message ? (
        <FieldError errors={[{ message }]} />
      ) : (
        <FieldDescription>Saved as {String(toNumber(text))}.</FieldDescription>
      )}
    </Field>
  )
}

export default function Page() {
  return (
    <div className="w-full max-w-sm p-8">
      <FieldGroup>
        <NumberTextField
          id="quantity"
          initial="12"
          label="Quantity"
          schema={quantity}
          toNumber={toWholeNumber}
        />
        <NumberTextField
          id="price"
          initial="2.505"
          label="Price Per Pack"
          schema={price}
          toNumber={toDecimal}
        />
      </FieldGroup>
    </div>
  )
}
