"use client"

import { AlertCircleIcon, Trash2Icon } from "lucide-react"
import { useRef, useState } from "react"

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
import type {
  NamedOption,
  ProgramLink,
} from "../product-program-link-dialog/program-link-form"
import { useDialogTarget } from "@/registry/components/openlmis/form-dialog/use-dialog-target"

type RemoveProgramLinkDialogProps = {
  /** The program to remove; the dialog is open while it is set. */
  programId: string | undefined
  /** The product's links; a program not among them shows as no longer linked. */
  links: readonly ProgramLink[]
  programs: readonly NamedOption[]
  productName: string
  onConfirm: (programId: string) => void
  /** Locks the dialog and spins Remove while the save runs. */
  pending?: boolean
  /** Why the removal failed; the dialog stays open to try again. */
  error?: string
  onClose: () => void
}

export function RemoveProgramLinkDialog({
  programId,
  links,
  programs,
  productName,
  onConfirm,
  pending = false,
  error,
  onClose,
}: RemoveProgramLinkDialogProps) {
  const { shown, dialogProps } = useDialogTarget(programId, onClose)
  const cancelRef = useRef<HTMLButtonElement>(null)
  const linked = links.some((link) => link.programId === shown)
  // Whether it was linked as the dialog opened, so the removal does not turn it into Not Found while it closes.
  const [opened, setOpened] = useState<{ id: string; linked: boolean }>()
  if (shown !== undefined && opened?.id !== shown)
    setOpened({ id: shown, linked })
  const found = opened && opened.id === shown ? opened.linked : linked
  const programName =
    programs.find((program) => program.id === shown)?.name ?? shown

  return (
    <AlertDialog {...dialogProps(pending)}>
      <AlertDialogContent initialFocus={cancelRef}>
        <AlertDialogHeader>
          <AlertDialogMedia>
            <Trash2Icon />
          </AlertDialogMedia>
          <AlertDialogTitle>
            {found ? `Remove ${programName}?` : "Program Not Found"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {found
              ? `${productName} will no longer be offered in ${programName}.`
              : "This program is no longer linked to the product."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error && (
          <Alert variant="destructive">
            <AlertCircleIcon />
            <AlertTitle>Could Not Remove Program</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending} ref={cancelRef}>
            {found ? "Cancel" : "Close"}
          </AlertDialogCancel>
          {found && (
            <Button
              disabled={pending}
              focusableWhenDisabled={pending}
              onClick={() => shown && onConfirm(shown)}
              variant="destructive"
            >
              {pending && <Spinner data-icon="inline-start" />}
              Remove
            </Button>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
