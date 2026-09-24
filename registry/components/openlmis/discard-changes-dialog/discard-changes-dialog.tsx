"use client"

import type { ReactNode } from "react"

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"

type DiscardChangesDialogProps = {
  open: boolean
  /** How many unsaved changes would be lost. */
  changes: number
  /** Whose changes, e.g. the user being edited; left out of the sentence when missing. */
  subject?: string
  /** What discarding leads to, e.g. "Discard and Sign Out". */
  confirmLabel?: ReactNode
  keepEditingLabel?: ReactNode
  onKeepEditing: () => void
  onDiscard: () => void
}

/** Asked before leaving a page with unsaved changes; Escape and Keep Editing both stay. */
export function DiscardChangesDialog({
  open,
  changes,
  subject,
  confirmLabel = "Discard Changes",
  keepEditingLabel = "Keep Editing",
  onKeepEditing,
  onDiscard,
}: DiscardChangesDialogProps) {
  const counted =
    changes === 1 ? "1 unsaved change" : `${changes} unsaved changes`

  return (
    <AlertDialog onOpenChange={(next) => !next && onKeepEditing()} open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Discard Unsaved Changes?</AlertDialogTitle>
          <AlertDialogDescription>
            {subject
              ? `You have ${counted} to ${subject}. Leaving now loses them.`
              : `You have ${counted}. Leaving now loses them.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{keepEditingLabel}</AlertDialogCancel>
          <Button onClick={onDiscard} variant="destructive">
            {confirmLabel}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
