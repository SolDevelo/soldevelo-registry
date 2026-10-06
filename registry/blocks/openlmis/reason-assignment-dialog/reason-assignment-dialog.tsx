"use client"

import { revalidateLogic } from "@tanstack/react-form"
import { useMemo, useState } from "react"

import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import {
  FormDialog,
  FormDialogBody,
  FormDialogCancel,
  FormDialogDescription,
  FormDialogFooter,
  FormDialogForm,
  FormDialogHeader,
  FormDialogSubmit,
  FormDialogTitle,
} from "@/registry/components/openlmis/form-dialog/form-dialog"
import { useDialogTarget } from "@/registry/components/openlmis/form-dialog/use-dialog-target"
import { useAppForm } from "@/registry/components/openlmis/form-fields/form"
import { FieldSkeleton } from "@/registry/components/openlmis/form-fields/form-fields"

import {
  addAssignmentSchema,
  type AssignmentOption,
  EMPTY_ASSIGNMENT,
  type ReasonAssignment,
} from "./reason-assignment"

type ReasonAssignmentDialogProps = {
  open: boolean
  /** The reason's assignments, so a pair already listed is refused. */
  rows: readonly ReasonAssignment[]
  /** The programs and active facility types to pick from; skeletons show until set. */
  programs: readonly AssignmentOption[] | undefined
  facilityTypes: readonly AssignmentOption[] | undefined
  /** Called with the new assignment; add it, then close. */
  onAdd: (assignment: ReasonAssignment) => void
  onClose: () => void
}

/** Offer a reason for one more program and facility type. */
export function ReasonAssignmentDialog({
  open,
  onClose,
  ...props
}: ReasonAssignmentDialogProps) {
  const { shown, dialogProps } = useDialogTarget(open || undefined, onClose)

  return (
    <FormDialog {...dialogProps()}>
      {shown && <AddAssignmentContent {...props} />}
    </FormDialog>
  )
}

function AddAssignmentHeader() {
  return (
    <FormDialogHeader>
      <FormDialogTitle>Add Program And Facility Type</FormDialogTitle>
      <FormDialogDescription>
        Offer this reason for one more program and facility type.
      </FormDialogDescription>
    </FormDialogHeader>
  )
}

type ContentProps = Omit<ReasonAssignmentDialogProps, "open" | "onClose">

function AddAssignmentContent({
  programs,
  facilityTypes,
  ...props
}: ContentProps) {
  if (!programs || !facilityTypes) {
    return (
      <>
        <AddAssignmentHeader />
        <FormDialogBody>
          <div aria-busy>
            <FieldGroup>
              <FieldSkeleton label="Program" required />
              <FieldSkeleton label="Facility Type" required />
              <Field orientation="horizontal">
                <div className="flex min-h-8 flex-1 items-center">
                  <FieldLabel>Show</FieldLabel>
                </div>
                {/* A plain element, since Skeleton owns its corner radius and the switch is round. */}
                <div className="h-4.5 w-8 shrink-0 animate-pulse rounded-full bg-muted" />
              </Field>
            </FieldGroup>
          </div>
        </FormDialogBody>
        <FormDialogFooter>
          <FormDialogCancel />
          <FormDialogSubmit disabled>Add</FormDialogSubmit>
        </FormDialogFooter>
      </>
    )
  }
  return (
    <AddAssignmentForm
      facilityTypes={facilityTypes}
      programs={programs}
      {...props}
    />
  )
}

const byLabel = (a: { label: string }, b: { label: string }) =>
  a.label.localeCompare(b.label)

const toItems = (options: readonly AssignmentOption[]) =>
  options
    .map((item) => ({ value: item.id, label: item.name }))
    // oxlint-disable-next-line unicorn/no-array-sort -- sorts the new array without requiring ES2023
    .sort(byLabel)

function AddAssignmentForm({
  rows,
  programs,
  facilityTypes,
  onAdd,
}: Omit<ContentProps, "programs" | "facilityTypes"> & {
  programs: readonly AssignmentOption[]
  facilityTypes: readonly AssignmentOption[]
}) {
  // The rows as the dialog opened, so the pair just added is not refused while it closes.
  const [rowsAtOpen] = useState(rows)
  const programItems = useMemo(() => toItems(programs), [programs])
  const typeItems = useMemo(() => toItems(facilityTypes), [facilityTypes])
  const schema = useMemo(() => addAssignmentSchema(rowsAtOpen), [rowsAtOpen])

  const form = useAppForm({
    defaultValues: EMPTY_ASSIGNMENT,
    // Quiet until the first submit, then each field re-checks as it is corrected.
    validationLogic: revalidateLogic({
      mode: "submit",
      modeAfterSubmission: "change",
    }),
    validators: { onDynamic: schema },
    onSubmit: ({ value }) => onAdd(value),
  })

  return (
    <FormDialogForm onSubmit={() => void form.handleSubmit()}>
      <AddAssignmentHeader />
      <FormDialogBody>
        <FieldGroup>
          <form.AppField name="programId">
            {(field) => (
              <field.SelectField
                items={programItems}
                label="Program"
                required
              />
            )}
          </form.AppField>
          <form.AppField name="facilityTypeId">
            {(field) => (
              <field.SelectField
                items={typeItems}
                label="Facility Type"
                required
              />
            )}
          </form.AppField>
          <form.AppField name="show">
            {(field) => (
              <field.SwitchField
                description="Show the reason in the requisition and stock adjustment forms."
                label="Show"
              />
            )}
          </form.AppField>
        </FieldGroup>
      </FormDialogBody>
      <FormDialogFooter>
        <FormDialogCancel />
        <FormDialogSubmit>Add</FormDialogSubmit>
      </FormDialogFooter>
    </FormDialogForm>
  )
}
