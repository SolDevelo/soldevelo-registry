"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { FieldGroup } from "@/components/ui/field"
import { useAppForm } from "@/registry/components/openlmis/form-fields/form"

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
} from "./form-dialog"
import { useDialogTarget } from "./use-dialog-target"

export default function Page() {
  // Open on load, so the catalog shows the dialog rather than its trigger.
  const [target, setTarget] = useState<"new" | undefined>("new")
  const { shown, dialogProps } = useDialogTarget(target, () =>
    setTarget(undefined)
  )

  return (
    // Tall enough for the open dialog, which is fixed and so adds nothing to the frame's height.
    <div className="min-h-104 w-full p-8">
      <Button onClick={() => setTarget("new")}>Add Program</Button>
      <FormDialog {...dialogProps()}>
        {shown && <ProgramForm onDone={() => setTarget(undefined)} />}
      </FormDialog>
    </div>
  )
}

function ProgramForm({ onDone }: { onDone: () => void }) {
  const form = useAppForm({
    defaultValues: { code: "", name: "", active: true },
    onSubmit: () => onDone(),
  })

  return (
    <FormDialogForm onSubmit={() => void form.handleSubmit()}>
      <FormDialogHeader>
        <FormDialogTitle>Add Program</FormDialogTitle>
        <FormDialogDescription>
          A program groups the products a facility orders together.
        </FormDialogDescription>
      </FormDialogHeader>
      <FormDialogBody>
        <FieldGroup>
          <form.AppField name="code">
            {(field) => <field.TextField label="Code" required />}
          </form.AppField>
          <form.AppField name="name">
            {(field) => <field.TextField label="Name" required />}
          </form.AppField>
          <form.AppField name="active">
            {(field) => (
              <field.SwitchField
                description="Only active programs can be requisitioned."
                label="Active"
              />
            )}
          </form.AppField>
        </FieldGroup>
      </FormDialogBody>
      <FormDialogFooter>
        <FormDialogCancel />
        <FormDialogSubmit>Add Program</FormDialogSubmit>
      </FormDialogFooter>
    </FormDialogForm>
  )
}
