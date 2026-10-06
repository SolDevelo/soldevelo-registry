"use client"

import { revalidateLogic } from "@tanstack/react-form"
import { type ReactNode, useMemo } from "react"

import { FieldGroup } from "@/components/ui/field"
import {
  EMPTY_REASON,
  reasonFormSchema,
  type ReasonValues,
  toReasonValues,
} from "@/registry/blocks/openlmis/reason-general-form/reason-form"
import {
  type ReasonLookups,
  ReasonFormFields,
} from "@/registry/blocks/openlmis/reason-general-form/reason-form-fields"
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

type ReasonFormDialogProps = {
  open: boolean
  lookups?: ReasonLookups
  /** Other reasons' names, and any the server refused, turned down for the new one. */
  takenNames?: readonly string[]
  /** Called with trimmed values; create the reason, then close. */
  onSubmit: (values: ReasonValues) => void
  /** Keeps the dialog open and spins Create while the save runs. */
  pending?: boolean
  /** Shown above the fields, e.g. why the create failed; what was typed stays. */
  error?: ReactNode
  onClose: () => void
}

/** Add Reason from a list: say why stock moves; where it is offered comes later in the editor. */
export function ReasonFormDialog({
  open,
  pending = false,
  onClose,
  ...props
}: ReasonFormDialogProps) {
  const { shown, dialogProps } = useDialogTarget(open || undefined, onClose)

  return (
    <FormDialog {...dialogProps(pending)}>
      {shown && <AddReasonForm pending={pending} {...props} />}
    </FormDialog>
  )
}

function AddReasonForm({
  lookups,
  takenNames,
  onSubmit,
  pending,
  error,
}: Omit<ReasonFormDialogProps, "open" | "onClose"> & { pending: boolean }) {
  const schema = useMemo(() => reasonFormSchema(takenNames), [takenNames])
  const form = useAppForm({
    defaultValues: EMPTY_REASON,
    // Quiet until the first submit, then each field re-checks as it is corrected.
    validationLogic: revalidateLogic({
      mode: "submit",
      modeAfterSubmission: "change",
    }),
    validators: { onDynamic: schema },
    onSubmit: ({ value }) => onSubmit(toReasonValues(value)),
  })

  return (
    <FormDialogForm onSubmit={() => void form.handleSubmit()}>
      <FormDialogHeader>
        <FormDialogTitle>Add Reason</FormDialogTitle>
        <FormDialogDescription>
          Say why stock moves; choose where it is offered once it is created.
        </FormDialogDescription>
      </FormDialogHeader>
      <FormDialogBody>
        <FieldGroup>
          {error && (
            <FormDialogError
              description={error}
              title="Could Not Save Reason"
            />
          )}
          <ReasonFormFields form={form} lookups={lookups} />
        </FieldGroup>
      </FormDialogBody>
      <FormDialogFooter>
        <FormDialogCancel disabled={pending} />
        <FormDialogSubmit pending={pending}>Create</FormDialogSubmit>
      </FormDialogFooter>
    </FormDialogForm>
  )
}
