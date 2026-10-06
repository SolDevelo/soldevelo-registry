"use client"

import { revalidateLogic, useStore } from "@tanstack/react-form"
import { useEffect, useId, useMemo, useRef } from "react"

import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { useAppForm } from "@/registry/components/openlmis/form-fields/form"
import { FieldSkeleton } from "@/registry/components/openlmis/form-fields/form-fields"

import {
  reasonChanges,
  reasonFormSchema,
  type ReasonValues,
  toReasonValues,
} from "./reason-form"
import { type ReasonLookups, ReasonFormFields } from "./reason-form-fields"

type ReasonGeneralFormProps = {
  /** The reason's values, or `EMPTY_REASON` to add one; a skeleton shows until it is set. */
  reason: ReasonValues | undefined
  /** Whether the reason is stored, which fixes its category and type. */
  saved?: boolean
  lookups?: ReasonLookups
  /** Other reasons' names, and any the server refused, turned down as this one's. */
  takenNames?: readonly string[]
  readOnly?: boolean
  /** The form's id, for a Save placed elsewhere, e.g. in a page's `WorkspaceFooter`. */
  formId?: string
  /** Called with trimmed values once every field is valid. */
  onSubmit: (values: ReasonValues) => void
  /** Called when a submit finds errors. */
  onInvalid?: () => void
  /** Tells the page how many fields are unsaved, e.g. to ask before leaving. */
  onChangesChange?: (changes: number) => void
}

/** A stock reason's details: name, tags, category, type and free text. */
export function ReasonGeneralForm({
  reason,
  ...props
}: ReasonGeneralFormProps) {
  if (!reason) return <ReasonGeneralFormSkeleton />
  return <GeneralForm reason={reason} {...props} />
}

function GeneralForm({
  reason,
  saved = false,
  lookups,
  takenNames,
  readOnly = false,
  formId: givenFormId,
  onSubmit,
  onInvalid,
  onChangesChange,
}: ReasonGeneralFormProps & { reason: ReasonValues }) {
  const generatedFormId = useId()
  const formId = givenFormId ?? generatedFormId
  // Keyed on the names, so an inline array does not re-run validation each render.
  const takenKey = takenNames?.join("\n") ?? ""
  const schema = useMemo(
    () => reasonFormSchema(takenKey ? takenKey.split("\n") : []),
    [takenKey]
  )

  const form = useAppForm({
    defaultValues: reason,
    // Quiet until the first submit, then each field re-checks as it is corrected.
    validationLogic: revalidateLogic({
      mode: "submit",
      modeAfterSubmission: "change",
    }),
    validators: { onDynamic: schema },
    onSubmit: ({ value }) => onSubmit(toReasonValues(value)),
    onSubmitInvalid: () => onInvalid?.(),
  })
  const changes = useStore(form.store, (state) =>
    reasonChanges(state.values, reason)
  )

  // Starts again only when the values differ, so an equal new object keeps the draft.
  const reasonKey = JSON.stringify(reason)
  const resetKey = useRef(reasonKey)
  useEffect(() => {
    if (resetKey.current === reasonKey) return
    resetKey.current = reasonKey
    form.reset(reason)
  }, [form, reason, reasonKey])
  // A name the server refused shows its error at once, rather than on the next submit.
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
        <ReasonFormFields
          form={form}
          lookups={lookups}
          readOnly={readOnly}
          saved={saved ? reason : undefined}
        />
      </FieldGroup>
    </form>
  )
}

/** The form as it will look, so nothing moves when the reason arrives. */
export function ReasonGeneralFormSkeleton() {
  return (
    <div aria-busy>
      <FieldGroup>
        <div className="grid grid-cols-1 gap-x-6 gap-y-5 @3xl/main:grid-cols-2">
          <FieldSkeleton label="Name" required />
          <FieldSkeleton label="Tags" />
          <FieldSkeleton label="Category" required />
          <FieldSkeleton label="Type" required />
          <Field orientation="horizontal">
            <div className="flex min-h-8 flex-1 items-center">
              <FieldLabel>Allow Free Text</FieldLabel>
            </div>
            {/* A plain element, since Skeleton owns its corner radius and the switch is round. */}
            <div className="h-4.5 w-8 shrink-0 animate-pulse rounded-full bg-muted" />
          </Field>
        </div>
      </FieldGroup>
    </div>
  )
}
