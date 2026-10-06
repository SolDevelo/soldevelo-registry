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
import type { Approval } from "../product-approval-dialog/approval-form"
import { useDialogTarget } from "@/registry/components/openlmis/form-dialog/use-dialog-target"

type RemoveApprovalDialogProps = {
  /** The approval to remove; the dialog is open while it is set. */
  approvalId: string | undefined
  /** The product's approvals; one not among them shows as no longer there. */
  approvals: readonly Approval[]
  productName: string
  onConfirm: (approvalId: string) => void
  /** Locks the dialog and spins Remove while the removal runs. */
  pending?: boolean
  /** Why the removal failed; the dialog stays open to try again. */
  error?: string
  onClose: () => void
}

export function RemoveApprovalDialog({
  approvalId,
  approvals,
  productName,
  onConfirm,
  pending = false,
  error,
  onClose,
}: RemoveApprovalDialogProps) {
  const { shown, dialogProps } = useDialogTarget(approvalId, onClose)
  const cancelRef = useRef<HTMLButtonElement>(null)
  const current = approvals.find((approval) => approval.id === shown)
  // The approval as the dialog opened, so the removal does not turn it into Not Found while it closes.
  const [opened, setOpened] = useState<{
    id: string
    approval: Approval | undefined
  }>()
  if (shown !== undefined && opened?.id !== shown)
    setOpened({ id: shown, approval: current })
  const approval = opened && opened.id === shown ? opened.approval : current

  return (
    <AlertDialog {...dialogProps(pending)}>
      <AlertDialogContent initialFocus={cancelRef}>
        <AlertDialogHeader>
          <AlertDialogMedia>
            <Trash2Icon />
          </AlertDialogMedia>
          <AlertDialogTitle>
            {approval
              ? `Remove ${approval.facilityType.name} From ${approval.program.name}?`
              : "Facility Type Not Found"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {approval
              ? `Facilities of type ${approval.facilityType.name} will no longer stock ${productName} in ${approval.program.name}.`
              : "This facility type no longer stocks the product."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error && (
          <Alert variant="destructive">
            <AlertCircleIcon />
            <AlertTitle>Could Not Remove Facility Type</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending} ref={cancelRef}>
            {approval ? "Cancel" : "Close"}
          </AlertDialogCancel>
          {approval && (
            <Button
              disabled={pending}
              focusableWhenDisabled={pending}
              onClick={() => onConfirm(approval.id)}
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
