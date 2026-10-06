"use client"

import { revalidateLogic } from "@tanstack/react-form"
import { useMemo, useState } from "react"

import { FieldGroup } from "@/components/ui/field"
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
  addProgramSchema,
  availablePrograms,
  EMPTY_ADD_PROGRAM,
  type FacilityProgram,
  type ProgramOption,
  programName,
  toFacilityProgram,
} from "./facility-program"

type FacilityProgramDialogProps = {
  open: boolean
  /** The facility's rows, so only programs it does not support yet are offered. */
  rows: readonly FacilityProgram[]
  /** Every program; the form shows a skeleton until they are set. */
  programs: readonly ProgramOption[] | undefined
  /** Called with the new row; add it, then close. */
  onAdd: (row: FacilityProgram) => void
  onClose: () => void
}

/** Add Program: a program the facility supports, and the date it starts. */
export function FacilityProgramDialog({
  open,
  onClose,
  ...props
}: FacilityProgramDialogProps) {
  const { shown, dialogProps } = useDialogTarget(open || undefined, onClose)

  return (
    <FormDialog {...dialogProps()}>
      {shown && <AddProgramContent {...props} />}
    </FormDialog>
  )
}

function AddProgramHeader() {
  return (
    <FormDialogHeader>
      <FormDialogTitle>Add Program</FormDialogTitle>
      <FormDialogDescription>
        Choose a program this facility supports, and the date it starts.
      </FormDialogDescription>
    </FormDialogHeader>
  )
}

function AddProgramContent({
  programs,
  ...props
}: Omit<FacilityProgramDialogProps, "open" | "onClose">) {
  if (!programs) {
    return (
      <>
        <AddProgramHeader />
        <FormDialogBody>
          <div aria-busy>
            <FieldGroup>
              <FieldSkeleton label="Program" required />
              <FieldSkeleton label="Start Date" required />
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
  return <AddProgramForm programs={programs} {...props} />
}

function AddProgramForm({
  rows,
  programs,
  onAdd,
}: Omit<FacilityProgramDialogProps, "open" | "onClose" | "programs"> & {
  programs: readonly ProgramOption[]
}) {
  // The choices as the dialog opened, so the program just added never drops out while it closes.
  const [rowsAtOpen] = useState(rows)
  const items = useMemo(
    () =>
      availablePrograms(programs, rowsAtOpen).map((program) => ({
        value: program.id,
        label: programName(program),
      })),
    [programs, rowsAtOpen]
  )

  const form = useAppForm({
    defaultValues: EMPTY_ADD_PROGRAM,
    // Quiet until the first submit, then each field re-checks as it is corrected.
    validationLogic: revalidateLogic({
      mode: "submit",
      modeAfterSubmission: "change",
    }),
    validators: { onDynamic: addProgramSchema },
    onSubmit: ({ value }) => {
      const program = programs.find((item) => item.id === value.programId)
      if (program) onAdd(toFacilityProgram(program, value.startDate))
    },
  })

  return (
    <FormDialogForm onSubmit={() => void form.handleSubmit()}>
      <AddProgramHeader />
      <FormDialogBody>
        <FieldGroup>
          <form.AppField name="programId">
            {(field) => (
              <field.ComboboxField
                clearLabel="Clear Program"
                emptyMessage="No Matches"
                items={items}
                label="Program"
                placeholder="Select A Program"
                required
              />
            )}
          </form.AppField>
          <form.AppField name="startDate">
            {(field) => (
              <field.DateField
                description="The program start date determines the first date available for users to enter requisitions related to the program."
                label="Start Date"
                placeholder="Pick A Date"
                required
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
