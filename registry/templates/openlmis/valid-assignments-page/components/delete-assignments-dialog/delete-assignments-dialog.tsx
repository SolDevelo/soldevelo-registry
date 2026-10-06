"use client"

import { AlertCircleIcon, Trash2Icon } from "lucide-react"
import { type RefObject, useRef } from "react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import {
  ASSIGNMENT_LABELS,
  type AssignmentKind,
} from "../add-assignment-dialog/assignment-form"
import { useDialogTarget } from "@/registry/components/openlmis/form-dialog/use-dialog-target"

/** Selected assignments by id, each with the name it is read out by. */
export type AssignmentTargets = ReadonlyMap<string, string>

/** How a delete went; the API has no bulk delete, so some can fail while others go. */
export type DeleteAssignmentsResult = {
  deleted: string[]
  failed: string[]
}

type DeleteAssignmentsDialogProps = {
  kind: AssignmentKind
  /** What to delete; the dialog is open while it is set, and must keep its identity. */
  targets: AssignmentTargets | undefined
  onClose: () => void
  onConfirm: (ids: string[]) => void
  /** Locks the dialog and spins Delete while the parent deletes. */
  pending?: boolean
  /** Shown when nothing was deleted, so the dialog stays open to try again. */
  error?: string
  focusAfterDelete?: RefObject<HTMLElement | null>
  deletedCount?: number
}

export function DeleteAssignmentsDialog({
  kind,
  targets,
  onClose,
  onConfirm,
  pending = false,
  error,
  focusAfterDelete,
  deletedCount = 0,
}: DeleteAssignmentsDialogProps) {
  const { shown, dialogProps } = useDialogTarget(targets, onClose)
  const cancelRef = useRef<HTMLButtonElement>(null)
  const labels = ASSIGNMENT_LABELS[kind]
  const count = shown?.size ?? 0
  const name = shown?.values().next().value ?? ""

  return (
    <AlertDialog {...dialogProps(pending)}>
      <AlertDialogContent
        finalFocus={() => {
          if (!deletedCount || !focusAfterDelete?.current) return true
          focusAfterDelete.current.focus()
          return false
        }}
        initialFocus={cancelRef}
      >
        <AlertDialogHeader>
          <AlertDialogMedia>
            <Trash2Icon />
          </AlertDialogMedia>
          <AlertDialogTitle>
            {count === 1
              ? `Delete ${labels.one}?`
              : `Delete ${count} ${labels.many}?`}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {count === 1
              ? `${name} will no longer be a ${labels.one.toLowerCase()}.`
              : `They will no longer be ${labels.many.toLowerCase()}.`}{" "}
            This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error && (
          <Alert variant="destructive">
            <AlertCircleIcon />
            <AlertTitle>Could Not Delete</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending} ref={cancelRef}>
            Cancel
          </AlertDialogCancel>
          <Button
            disabled={pending}
            focusableWhenDisabled
            onClick={() => shown && onConfirm([...shown.keys()])}
            variant="destructive"
          >
            {pending && <Spinner data-icon="inline-start" />}
            Delete
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
