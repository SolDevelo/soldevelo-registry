"use client"

import { Combobox as ComboboxPrimitive } from "@base-ui/react/combobox"
import { EyeIcon, EyeOffIcon, XIcon } from "lucide-react"
import { type ReactNode, useMemo, useState } from "react"

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"

import { useFieldContext } from "./form-context"
import { useFormatError } from "./form-messages"

type FieldProps = {
  label: ReactNode
  description?: ReactNode
  required?: boolean
  disabled?: boolean
}

/** The field's errors as display text, and whether there are any. */
function useFieldErrors() {
  const field = useFieldContext<unknown>()
  const formatError = useFormatError()
  const errors = field.state.meta.errors.map((error: unknown) => ({
    message:
      typeof error === "string"
        ? formatError(error)
        : error && typeof error === "object" && "message" in error
          ? formatError(String(error.message))
          : undefined,
  }))
  return { errors, isInvalid: errors.length > 0 }
}

/** A label's text with the required mark, for any label, including a skeleton's. */
export function FieldLabelText({
  label,
  required,
}: Pick<FieldProps, "label" | "required">) {
  return (
    <span>
      {label}
      {required && (
        <span aria-hidden="true" className="ms-0.5 text-destructive">
          *
        </span>
      )}
    </span>
  )
}

function RequiredLabel({
  label,
  required,
}: Pick<FieldProps, "label" | "required">) {
  const field = useFieldContext<unknown>()
  return (
    <FieldLabel htmlFor={field.name}>
      <FieldLabelText label={label} required={required} />
    </FieldLabel>
  )
}

type TextFieldProps = FieldProps & {
  type?: "text" | "email" | "tel"
  autoComplete?: string
  placeholder?: string
}

export function TextField({
  label,
  description,
  required,
  disabled,
  type = "text",
  autoComplete,
  placeholder,
}: TextFieldProps) {
  const field = useFieldContext<string>()
  const { errors, isInvalid } = useFieldErrors()

  return (
    <Field className="gap-1" data-disabled={disabled} data-invalid={isInvalid}>
      <RequiredLabel label={label} required={required} />
      <Input
        aria-invalid={isInvalid}
        aria-required={required}
        autoComplete={autoComplete}
        disabled={disabled}
        id={field.name}
        name={field.name}
        onBlur={field.handleBlur}
        onChange={(event) => field.handleChange(event.target.value)}
        placeholder={placeholder}
        type={type}
        value={field.state.value}
      />
      {description && <FieldDescription>{description}</FieldDescription>}
      {isInvalid && <FieldError errors={errors} />}
    </Field>
  )
}

type PasswordFieldProps = FieldProps & {
  autoComplete?: "new-password" | "current-password"
  placeholder?: string
  /** Names the button that reveals the password, for screen readers. */
  showLabel?: string
  hideLabel?: string
}

export function PasswordField({
  label,
  description,
  required,
  disabled,
  autoComplete = "new-password",
  placeholder,
  showLabel = "Show Password",
  hideLabel = "Hide Password",
}: PasswordFieldProps) {
  const field = useFieldContext<string>()
  const { errors, isInvalid } = useFieldErrors()
  const [visible, setVisible] = useState(false)

  return (
    <Field className="gap-1" data-disabled={disabled} data-invalid={isInvalid}>
      <RequiredLabel label={label} required={required} />
      <InputGroup>
        <InputGroupInput
          aria-invalid={isInvalid}
          aria-required={required}
          autoComplete={autoComplete}
          disabled={disabled}
          id={field.name}
          name={field.name}
          onBlur={field.handleBlur}
          onChange={(event) => field.handleChange(event.target.value)}
          placeholder={placeholder}
          type={visible ? "text" : "password"}
          value={field.state.value}
        />
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            aria-label={visible ? hideLabel : showLabel}
            disabled={disabled}
            onClick={() => setVisible((shown) => !shown)}
            size="icon-xs"
            type="button"
            variant="ghost"
          >
            {visible ? <EyeOffIcon /> : <EyeIcon />}
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
      {description && <FieldDescription>{description}</FieldDescription>}
      {isInvalid && <FieldError errors={errors} />}
    </Field>
  )
}

type ChoiceCardProps = {
  /** The control's id, so a click anywhere on the card reaches it. */
  htmlFor?: string
  label: ReactNode
  /** Text goes in a description line; any other node, such as a skeleton, is placed as it is. */
  description?: ReactNode
  disabled?: boolean
  /** The switch or radio, or a placeholder while loading. */
  children: ReactNode
}

/** The card around one choice: label and description at the start, the control at the end. */
export function ChoiceCard({
  htmlFor,
  label,
  description,
  disabled,
  children,
}: ChoiceCardProps) {
  return (
    <FieldLabel htmlFor={htmlFor}>
      <Field data-disabled={disabled} orientation="horizontal">
        <FieldContent>
          <FieldTitle>{label}</FieldTitle>
          {typeof description === "string" ? (
            <FieldDescription>{description}</FieldDescription>
          ) : (
            description
          )}
        </FieldContent>
        {children}
      </Field>
    </FieldLabel>
  )
}

/** A yes/no setting as a `ChoiceCard`, all one click target. */
export function SwitchField({
  label,
  description,
  disabled,
}: Omit<FieldProps, "required">) {
  const field = useFieldContext<boolean>()

  return (
    <ChoiceCard
      description={description}
      disabled={disabled}
      htmlFor={field.name}
      label={label}
    >
      <Switch
        checked={field.state.value}
        disabled={disabled}
        id={field.name}
        name={field.name}
        onBlur={field.handleBlur}
        onCheckedChange={(checked) => field.handleChange(checked)}
      />
    </ChoiceCard>
  )
}

export type RadioGroupFieldOption = {
  value: string
  label: ReactNode
  description?: ReactNode
}

type RadioGroupFieldProps = {
  /** Names the group; shown above the options. */
  label: ReactNode
  options: readonly RadioGroupFieldOption[]
  disabled?: boolean
}

/** One choice from a few, each drawn as a card like `SwitchField`. */
export function RadioGroupField({
  label,
  options,
  disabled,
}: RadioGroupFieldProps) {
  const field = useFieldContext<string>()

  return (
    <FieldSet>
      <FieldLegend variant="label">{label}</FieldLegend>
      <RadioGroup
        disabled={disabled}
        name={field.name}
        onBlur={field.handleBlur}
        onValueChange={(value) => field.handleChange(String(value))}
        value={field.state.value}
      >
        {options.map((option) => {
          const id = `${field.name}-${option.value}`
          return (
            <ChoiceCard
              description={option.description}
              disabled={disabled}
              htmlFor={id}
              key={option.value}
              label={option.label}
            >
              <RadioGroupItem id={id} value={option.value} />
            </ChoiceCard>
          )
        })}
      </RadioGroup>
    </FieldSet>
  )
}

export type ComboboxFieldItem = {
  value: string
  label: string
}

type ComboboxFieldProps = FieldProps & {
  items: readonly ComboboxFieldItem[]
  placeholder?: string
  emptyMessage?: ReactNode
  /** Names the button that empties the field, for screen readers. */
  clearLabel?: string
  /** Most matches rendered at once, so a list of thousands stays quick to type into. */
  limit?: number
}

/** Picks one item by typing to filter; the field's value is the item's `value`, or null for none. */
export function ComboboxField({
  label,
  description,
  required,
  disabled,
  items,
  placeholder,
  emptyMessage = "No matches.",
  clearLabel = "Clear",
  limit = 50,
}: ComboboxFieldProps) {
  const field = useFieldContext<string | null>()
  const { errors, isInvalid } = useFieldErrors()
  const selected = useMemo(
    () => items.find((item) => item.value === field.state.value) ?? null,
    [items, field.state.value]
  )

  return (
    <Field className="gap-1" data-disabled={disabled} data-invalid={isInvalid}>
      <RequiredLabel label={label} required={required} />
      <Combobox
        disabled={disabled}
        isItemEqualToValue={(item, value) => item.value === value.value}
        itemToStringLabel={(item) => item.label}
        items={items}
        limit={limit}
        onValueChange={(item) => field.handleChange(item?.value ?? null)}
        value={selected}
      >
        <ComboboxInput
          aria-invalid={isInvalid}
          aria-required={required}
          className="w-full"
          disabled={disabled}
          id={field.name}
          onBlur={field.handleBlur}
          placeholder={placeholder}
        >
          {/* Its own clear button, since the stock one has no accessible name. */}
          {selected && (
            <InputGroupAddon align="inline-end">
              <ComboboxPrimitive.Clear
                aria-label={clearLabel}
                // The slot hides the stock dropdown trigger while a value can be cleared.
                data-slot="combobox-clear"
                disabled={disabled}
                render={<InputGroupButton size="icon-xs" variant="ghost" />}
              >
                <XIcon />
              </ComboboxPrimitive.Clear>
            </InputGroupAddon>
          )}
        </ComboboxInput>
        <ComboboxContent>
          <ComboboxEmpty>{emptyMessage}</ComboboxEmpty>
          <ComboboxList>
            {(item: ComboboxFieldItem) => (
              <ComboboxItem key={item.value} value={item}>
                {item.label}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
      {description && <FieldDescription>{description}</FieldDescription>}
      {isInvalid && <FieldError errors={errors} />}
    </Field>
  )
}

/** One line of small text: its line height with a bar inside, so it takes the room the text will. */
export function SkeletonLine({
  width = "medium",
}: {
  width?: "short" | "medium"
}) {
  return (
    <div className="flex h-4 items-center">
      <Skeleton className={width === "short" ? "h-3 w-32" : "h-3 w-56"} />
    </div>
  )
}

/** A field's real label over a placeholder input, for a form whose values are still loading. */
export function FieldSkeleton({
  label,
  required = false,
}: Pick<FieldProps, "label" | "required">) {
  return (
    <Field className="gap-1">
      <FieldLabel>
        <FieldLabelText label={label} required={required} />
      </FieldLabel>
      <Skeleton className="h-8 w-full" />
    </Field>
  )
}

/** A `ChoiceCard` whose value is still loading; pass `description` when it is known already. */
export function ChoiceCardSkeleton({
  label,
  description,
  control = "switch",
}: {
  label: ReactNode
  description?: string
  control?: "switch" | "radio"
}) {
  return (
    <ChoiceCard description={description ?? <SkeletonLine />} label={label}>
      {/* Plain elements, since Skeleton owns its corner radius and both controls are round. */}
      {control === "radio" ? (
        <div className="size-4 shrink-0 animate-pulse rounded-full bg-muted" />
      ) : (
        <div className="h-4.5 w-8 shrink-0 animate-pulse rounded-full bg-muted" />
      )}
    </ChoiceCard>
  )
}
