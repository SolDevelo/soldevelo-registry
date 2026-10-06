"use client"

import { revalidateLogic } from "@tanstack/react-form"
import { type ReactNode, useEffect, useMemo, useRef } from "react"

import { FieldGroup } from "@/components/ui/field"
import {
  FormDialog,
  FormDialogBody,
  FormDialogCancel,
  FormDialogDescription,
  FormDialogError,
  FormDialogFooter,
  FormDialogForm,
  FormDialogHeader,
  FormDialogLoadError,
  FormDialogSubmit,
  FormDialogTitle,
} from "@/registry/components/openlmis/form-dialog/form-dialog"
import { useDialogTarget } from "@/registry/components/openlmis/form-dialog/use-dialog-target"
import { useAppForm } from "@/registry/components/openlmis/form-fields/form"
import {
  FieldSkeleton,
  SkeletonLine,
} from "@/registry/components/openlmis/form-fields/form-fields"

import {
  EMPTY_FACILITY_TYPE_FORM,
  type FacilityType,
  type FacilityTypeFormValues,
  facilityTypeFormSchema,
  type TakenFacilityType,
  toFacilityTypeFormValues,
} from "./facility-type-form"

const NO_TYPES: readonly TakenFacilityType[] = []

/** `new` to create a facility type, or the id of the type to edit. */
export type FacilityTypeFormDialogTarget = "new" | (string & {})

type FacilityTypeFormDialogProps = {
  /** Opens the dialog while set. */
  target: FacilityTypeFormDialogTarget | undefined
  /** The type being edited; a skeleton shows until it is set. */
  type?: FacilityType | undefined
  /** Every type, so a code or name already taken is refused; add any the server refused. */
  types?: readonly TakenFacilityType[]
  /** The type to edit no longer exists. */
  notFound?: boolean
  /** Loading the type failed; shows the error with Try Again. */
  onRetry?: (() => void) | undefined
  /** Called with the values; save them, then clear `target` to close. */
  onSubmit: (
    values: FacilityTypeFormValues,
    type: FacilityType | undefined
  ) => void
  /** Keeps the dialog open and shows a spinner while the type is saved. */
  pending?: boolean
  /** Shown above the fields, e.g. why the save failed. */
  error?: ReactNode
  onClose: () => void
}

export function FacilityTypeFormDialog({
  target,
  type,
  types = NO_TYPES,
  notFound = false,
  onRetry,
  onSubmit,
  pending = false,
  error,
  onClose,
}: FacilityTypeFormDialogProps) {
  const { shown, dialogProps } = useDialogTarget(target, onClose)
  const isNew = shown === "new"
  const title = isNew ? "Create Facility Type" : "Edit Facility Type"
  const submitLabel = isNew ? "Create" : "Save"

  return (
    <FormDialog {...dialogProps(pending)}>
      {shown &&
        (isNew ? (
          <FacilityTypeForm
            error={error}
            key="new"
            onSubmit={onSubmit}
            pending={pending}
            types={types}
          />
        ) : notFound ? (
          <>
            <FormDialogHeader>
              <FormDialogTitle>{title}</FormDialogTitle>
              <FormDialogDescription>
                This facility type no longer exists.
              </FormDialogDescription>
            </FormDialogHeader>
            <FormDialogFooter>
              <FormDialogCancel>Close</FormDialogCancel>
            </FormDialogFooter>
          </>
        ) : onRetry ? (
          <FormDialogLoadError
            errorTitle="Could Not Load Facility Type"
            onRetry={onRetry}
            title={title}
          />
        ) : type === undefined ? (
          <FacilityTypeFormSkeleton submitLabel={submitLabel} title={title} />
        ) : (
          <FacilityTypeForm
            error={error}
            // Keyed, so opening another type starts a fresh form.
            key={type.id}
            onSubmit={onSubmit}
            pending={pending}
            type={type}
            types={types}
          />
        ))}
    </FormDialog>
  )
}

type FacilityTypeFormProps = Pick<
  FacilityTypeFormDialogProps,
  "type" | "onSubmit" | "error"
> & {
  types: readonly TakenFacilityType[]
  pending: boolean
}

function FacilityTypeForm({
  type,
  types,
  onSubmit,
  pending,
  error,
}: FacilityTypeFormProps) {
  // Keyed on the values themselves, so an equal array passed inline does not rebuild or re-check.
  const typesKey = JSON.stringify(types)
  const editingId = type?.id
  const schema = useMemo(
    () =>
      facilityTypeFormSchema(
        JSON.parse(typesKey) as TakenFacilityType[],
        editingId
      ),
    [typesKey, editingId]
  )
  const checkedKey = useRef(typesKey)

  const form = useAppForm({
    defaultValues: type
      ? toFacilityTypeFormValues(type)
      : EMPTY_FACILITY_TYPE_FORM,
    // Quiet until the first submit, then each field re-checks as it is corrected.
    validationLogic: revalidateLogic({
      mode: "submit",
      modeAfterSubmission: "change",
    }),
    validators: { onDynamic: schema },
    onSubmit: ({ value }) => onSubmit(value, type),
  })

  // A code or name the server just refused shows its error at once, without another submit.
  useEffect(() => {
    if (checkedKey.current === typesKey) return
    checkedKey.current = typesKey
    void form.validate("change")
  }, [typesKey, form])

  return (
    <FormDialogForm onSubmit={form.handleSubmit}>
      <FormDialogHeader>
        <FormDialogTitle>
          {type ? "Edit Facility Type" : "Create Facility Type"}
        </FormDialogTitle>
        <FormDialogDescription>
          {type
            ? "Change the name, display order and settings of this type."
            : "Give the type a code, a name and its place in lists."}
        </FormDialogDescription>
      </FormDialogHeader>
      <FormDialogBody>
        <FieldGroup>
          {error && (
            <FormDialogError
              description={error}
              title="Could Not Save Facility Type"
            />
          )}
          <form.AppField name="code">
            {(field) => (
              <field.TextField
                autoComplete="off"
                description={
                  type
                    ? "The code can't be changed once the type exists."
                    : undefined
                }
                dir="ltr"
                disabled={Boolean(type)}
                label="Facility Type Code"
                required
              />
            )}
          </form.AppField>
          <form.AppField name="name">
            {(field) => (
              <field.TextField
                autoComplete="off"
                label="Facility Type Name"
                required
              />
            )}
          </form.AppField>
          <form.AppField name="displayOrder">
            {(field) => (
              <field.NumberField
                description="Lists show facility types from the lowest number up."
                label="Facility Type Display Order"
                required
              />
            )}
          </form.AppField>
          <form.AppField name="active">
            {(field) => (
              <field.SwitchField
                description="Facilities can be given this type."
                label="Active"
              />
            )}
          </form.AppField>
          <form.AppField name="primaryHealthCare">
            {(field) => (
              <field.SwitchField
                description="Facilities of this type give primary health care."
                label="Primary Health Care"
              />
            )}
          </form.AppField>
        </FieldGroup>
      </FormDialogBody>
      <FormDialogFooter>
        <FormDialogCancel disabled={pending} />
        <FormDialogSubmit pending={pending}>
          {type ? "Save" : "Create"}
        </FormDialogSubmit>
      </FormDialogFooter>
    </FormDialogForm>
  )
}

/** A switch row whose value is still loading, laid out like `SwitchField`. */
function SwitchSkeleton() {
  return (
    <div
      aria-hidden
      className="flex min-h-8 items-center justify-between gap-3"
    >
      <SkeletonLine width="short" />
      {/* A plain element, since Skeleton owns its corner radius and a switch is round. */}
      <div className="h-4.5 w-8 shrink-0 animate-pulse rounded-full bg-muted" />
    </div>
  )
}

/** Laid out like the form, so nothing moves when the type arrives. */
function FacilityTypeFormSkeleton({
  title,
  submitLabel,
}: {
  title: string
  submitLabel: string
}) {
  return (
    <>
      <FormDialogHeader>
        <FormDialogTitle>{title}</FormDialogTitle>
        <SkeletonLine />
      </FormDialogHeader>
      <FormDialogBody>
        <div aria-busy>
          <FieldGroup>
            <FieldSkeleton label="Facility Type Code" required />
            <FieldSkeleton label="Facility Type Name" required />
            <FieldSkeleton label="Facility Type Display Order" required />
            <SwitchSkeleton />
            <SwitchSkeleton />
          </FieldGroup>
        </div>
      </FormDialogBody>
      <FormDialogFooter>
        <FormDialogCancel />
        <FormDialogSubmit disabled>{submitLabel}</FormDialogSubmit>
      </FormDialogFooter>
    </>
  )
}
