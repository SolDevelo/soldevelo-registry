"use client"

import { revalidateLogic, useStore } from "@tanstack/react-form"
import { useEffect, useId, useMemo, useRef } from "react"

import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { useAppForm } from "@/registry/components/openlmis/form-fields/form"
import { FieldSkeleton } from "@/registry/components/openlmis/form-fields/form-fields"

import {
  facilityChanges,
  facilityFormSchema,
  type FacilityValues,
  toFacilityValues,
} from "./facility-form"
import {
  type FacilityLookups,
  FacilityFormFields,
} from "./facility-form-fields"

type FacilityGeneralFormProps = {
  /** The facility's saved values, or `EMPTY_FACILITY` to add one; a skeleton shows until it is set. */
  facility: FacilityValues | undefined
  /** The types, zones and operators to pick from; their fields show skeletons until set. */
  lookups: FacilityLookups | undefined
  /** Other facilities' codes, and any the server refused, turned down as this one's. */
  takenCodes?: readonly string[]
  /** A saved facility must keep its operational date. */
  goLiveDateRequired?: boolean
  /** Managed by another system: name, code, zone, description and Active cannot change. */
  locked?: boolean
  readOnly?: boolean
  /** The form's id, for a Save placed elsewhere, e.g. in a page's `WorkspaceFooter`. */
  formId?: string
  /** Called with trimmed values once every field is valid. */
  onSubmit: (values: FacilityValues) => void
  /** Called when a submit finds errors, e.g. to open the tab that holds them. */
  onInvalid?: () => void
  /** Tells the page how many fields are unsaved, e.g. to ask before leaving. */
  onChangesChange?: (changes: number) => void
}

/** A facility's Information tab: name, code, type, zone, dates and status. */
export function FacilityGeneralForm({
  facility,
  lookups,
  ...props
}: FacilityGeneralFormProps) {
  if (!facility || !lookups) {
    return (
      <FacilityGeneralFormSkeleton
        goLiveDateRequired={props.goLiveDateRequired}
      />
    )
  }
  return <GeneralForm facility={facility} lookups={lookups} {...props} />
}

function GeneralForm({
  facility,
  lookups,
  takenCodes,
  goLiveDateRequired = false,
  locked = false,
  readOnly = false,
  formId: givenFormId,
  onSubmit,
  onInvalid,
  onChangesChange,
}: FacilityGeneralFormProps & {
  facility: FacilityValues
  lookups: FacilityLookups
}) {
  const generatedFormId = useId()
  const formId = givenFormId ?? generatedFormId
  // Keyed on the codes, so an inline array does not re-run validation each render.
  const takenKey = takenCodes?.join("\n") ?? ""
  const schema = useMemo(
    () =>
      facilityFormSchema({
        takenCodes: takenKey ? takenKey.split("\n") : [],
        goLiveDateRequired,
        locked,
      }),
    [takenKey, goLiveDateRequired, locked]
  )

  const form = useAppForm({
    defaultValues: facility,
    // Quiet until the first submit, then each field re-checks as it is corrected.
    validationLogic: revalidateLogic({
      mode: "submit",
      modeAfterSubmission: "change",
    }),
    validators: { onDynamic: schema },
    onSubmit: ({ value }) => onSubmit(toFacilityValues(value)),
    onSubmitInvalid: () => onInvalid?.(),
  })
  const changes = useStore(form.store, (state) =>
    facilityChanges(state.values, facility)
  )

  // Starts again only when the values differ, so an equal new object keeps the draft.
  const facilityKey = JSON.stringify(facility)
  const resetKey = useRef(facilityKey)
  useEffect(() => {
    if (resetKey.current === facilityKey) return
    resetKey.current = facilityKey
    form.reset(facility)
  }, [form, facility, facilityKey])
  // A code the server refused shows its error at once, rather than on the next submit.
  useEffect(() => {
    if (form.state.submissionAttempts === 0) return
    form.update({ ...form.options, validators: { onDynamic: schema } })
    void form.validate("change")
  }, [form, schema])
  useEffect(() => {
    onChangesChange?.(changes)
  }, [changes, onChangesChange])

  return (
    <form
      id={formId}
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        void form.handleSubmit()
      }}
    >
      <FieldGroup>
        <FacilityFormFields
          form={form}
          goLiveDateRequired={goLiveDateRequired}
          locked={locked}
          lookups={lookups}
          readOnly={readOnly}
        />
      </FieldGroup>
    </form>
  )
}

function SwitchRowSkeleton({ label }: { label: string }) {
  return (
    <Field orientation="horizontal">
      <div className="flex min-h-8 flex-1 items-center">
        <FieldLabel>{label}</FieldLabel>
      </div>
      {/* A plain element, since Skeleton owns its corner radius and the switch is round. */}
      <div className="h-4.5 w-8 shrink-0 animate-pulse rounded-full bg-muted" />
    </Field>
  )
}

/** The form as it will look, so nothing moves when the facility arrives. */
export function FacilityGeneralFormSkeleton({
  goLiveDateRequired = false,
}: {
  goLiveDateRequired?: boolean
}) {
  return (
    <div aria-busy>
      <FieldGroup>
        <div className="grid gap-x-6 gap-y-5 @3xl/main:grid-cols-2">
          <FieldSkeleton label="Facility Name" required />
          <FieldSkeleton label="Facility Code" required />
          <FieldSkeleton label="Facility Type" required />
          <FieldSkeleton label="Geographic Zone" required />
          <FieldSkeleton
            label="Operational Date"
            required={goLiveDateRequired}
          />
          <FieldSkeleton label="Facility Operator" />
          <FieldSkeleton label="Description" />
          <div className="@3xl/main:col-start-1">
            <SwitchRowSkeleton label="Active Facility" />
          </div>
          <SwitchRowSkeleton label="Enabled" />
        </div>
      </FieldGroup>
    </div>
  )
}
