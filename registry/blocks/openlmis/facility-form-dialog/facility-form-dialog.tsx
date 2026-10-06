"use client"

import { revalidateLogic } from "@tanstack/react-form"
import { type ReactNode, useMemo } from "react"

import { FieldGroup } from "@/components/ui/field"
import {
  EMPTY_FACILITY,
  facilityFormSchema,
  type FacilityValues,
  toFacilityValues,
} from "@/registry/blocks/openlmis/facility-general-form/facility-form"
import {
  type FacilityLookups,
  FacilityFormFields,
} from "@/registry/blocks/openlmis/facility-general-form/facility-form-fields"
import { FacilityGeneralFormSkeleton } from "@/registry/blocks/openlmis/facility-general-form/facility-general-form"
import {
  FormDialog,
  FormDialogBody,
  FormDialogCancel,
  FormDialogDescription,
  FormDialogError,
  FormDialogFooter,
  FormDialogForm,
  FormDialogHeader,
  FormDialogSubmit,
  FormDialogTitle,
} from "@/registry/components/openlmis/form-dialog/form-dialog"
import { useDialogTarget } from "@/registry/components/openlmis/form-dialog/use-dialog-target"
import { useAppForm } from "@/registry/components/openlmis/form-fields/form"

type FacilityFormDialogProps = {
  open: boolean
  /** The types, zones and operators to pick from; skeletons show until set. */
  lookups: FacilityLookups | undefined
  /** Other facilities' codes, and any the server refused, turned down for the new one. */
  takenCodes?: readonly string[]
  /** Called with trimmed values; create the facility, then close. */
  onSubmit: (values: FacilityValues) => void
  /** Keeps the dialog open and spins Create while the save runs. */
  pending?: boolean
  /** Shown above the fields, e.g. why the create failed; what was typed stays. */
  error?: ReactNode
  onClose: () => void
}

/** Add Facility from a list: its details now, its programs later in the editor. */
export function FacilityFormDialog({
  open,
  pending = false,
  onClose,
  ...props
}: FacilityFormDialogProps) {
  const { shown, dialogProps } = useDialogTarget(open || undefined, onClose)

  return (
    <FormDialog {...dialogProps(pending)}>
      {shown && <AddFacilityContent pending={pending} {...props} />}
    </FormDialog>
  )
}

function AddFacilityHeader() {
  return (
    <FormDialogHeader>
      <FormDialogTitle>Add Facility</FormDialogTitle>
      <FormDialogDescription>
        Set up a facility; add the programs it supports once it is created.
      </FormDialogDescription>
    </FormDialogHeader>
  )
}

type ContentProps = Omit<FacilityFormDialogProps, "open" | "onClose"> & {
  pending: boolean
}

function AddFacilityContent({ lookups, ...props }: ContentProps) {
  if (!lookups) {
    return (
      <>
        <AddFacilityHeader />
        <FormDialogBody>
          <FacilityGeneralFormSkeleton />
        </FormDialogBody>
        <FormDialogFooter>
          <FormDialogCancel />
          <FormDialogSubmit disabled>Create</FormDialogSubmit>
        </FormDialogFooter>
      </>
    )
  }
  return <AddFacilityForm lookups={lookups} {...props} />
}

function AddFacilityForm({
  lookups,
  takenCodes,
  onSubmit,
  pending,
  error,
}: ContentProps & { lookups: FacilityLookups }) {
  const schema = useMemo(() => facilityFormSchema({ takenCodes }), [takenCodes])
  const form = useAppForm({
    defaultValues: EMPTY_FACILITY,
    // Quiet until the first submit, then each field re-checks as it is corrected.
    validationLogic: revalidateLogic({
      mode: "submit",
      modeAfterSubmission: "change",
    }),
    validators: { onDynamic: schema },
    onSubmit: ({ value }) => onSubmit(toFacilityValues(value)),
  })

  return (
    <FormDialogForm onSubmit={() => void form.handleSubmit()}>
      <AddFacilityHeader />
      <FormDialogBody>
        <FieldGroup>
          {error && (
            <FormDialogError
              description={error}
              title="Could Not Save Facility"
            />
          )}
          <FacilityFormFields form={form} lookups={lookups} />
        </FieldGroup>
      </FormDialogBody>
      <FormDialogFooter>
        <FormDialogCancel disabled={pending} />
        <FormDialogSubmit pending={pending}>Create</FormDialogSubmit>
      </FormDialogFooter>
    </FormDialogForm>
  )
}
