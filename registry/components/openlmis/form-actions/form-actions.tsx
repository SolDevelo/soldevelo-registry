"use client"

import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"

/** What a form hands its Cancel and Save buttons, wherever they are placed. */
export type FormActionState = {
  /** The form's id, for a submit button placed outside it. */
  formId: string
  changed: boolean
  pending: boolean
  /** Puts the form back to the saved values. */
  cancel: () => void
}

/** Cancel and Save for a form, e.g. in a `WorkspaceFooter`. */
export function FormActions({
  actions: { formId, changed, pending, cancel },
  saveLabel,
  cancelDisabled = !changed,
}: {
  actions: FormActionState
  saveLabel: ReactNode
  /** A navigation Cancel may stay available while the form is unchanged. */
  cancelDisabled?: boolean
}) {
  return (
    <>
      <Button
        disabled={cancelDisabled || pending}
        onClick={cancel}
        size="lg"
        type="button"
        variant="outline"
      >
        Cancel
      </Button>
      <Button
        disabled={!changed || pending}
        focusableWhenDisabled={pending}
        form={formId}
        size="lg"
        type="submit"
      >
        {pending && <Spinner data-icon="inline-start" />}
        {saveLabel}
      </Button>
    </>
  )
}
