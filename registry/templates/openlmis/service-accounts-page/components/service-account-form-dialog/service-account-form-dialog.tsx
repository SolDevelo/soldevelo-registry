"use client"

import { AlertCircleIcon, KeyRoundIcon, Trash2Icon } from "lucide-react"
import { type ReactNode, useRef, useState } from "react"

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
  CopyableValue,
  type CopyState,
} from "@/registry/components/openlmis/copyable-value/copyable-value"
import { useDialogTarget } from "@/registry/components/openlmis/form-dialog/use-dialog-target"

import type { ServiceAccount } from "../service-account"

function DialogError({
  title,
  description,
}: {
  title: string
  description: ReactNode
}) {
  return (
    <Alert variant="destructive">
      <AlertCircleIcon />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{description}</AlertDescription>
    </Alert>
  )
}

type AddServiceAccountDialogProps = CopyState & {
  open: boolean
  /** The account just added; the dialog then shows its key to copy. */
  created?: ServiceAccount | undefined
  /** Called on Add; add the account, then pass it back as `created`. */
  onAdd: () => void
  /** Keeps the dialog open and shows a spinner while the account is added. */
  pending?: boolean
  /** Why adding failed, e.g. "Something went wrong. Check your connection and try again." */
  error?: ReactNode
  /** Called when the dialog closes; clear `created` and `error` here. */
  onClose: () => void
}

/** Asks before adding an account, then shows its new key once to copy. */
export function AddServiceAccountDialog({
  open,
  created,
  onAdd,
  pending = false,
  error,
  onClose,
  ...copy
}: AddServiceAccountDialogProps) {
  const { dialogProps } = useDialogTarget(open || undefined, onClose)
  // Kept until the close animation ends, so the key stays on screen after the caller clears it.
  const [key, setKey] = useState(created)
  if (created && created !== key) setKey(created)
  const props = dialogProps(pending)

  return (
    <AlertDialog
      {...props}
      onOpenChangeComplete={(next) => {
        props.onOpenChangeComplete(next)
        if (!next) setKey(undefined)
      }}
    >
      <AlertDialogContent>
        {key ? (
          <>
            <AlertDialogHeader>
              <AlertDialogMedia>
                <KeyRoundIcon />
              </AlertDialogMedia>
              <AlertDialogTitle>Service Account Added</AlertDialogTitle>
              <AlertDialogDescription>
                Copy the key into the system that will use it. It stays listed
                here until you delete it.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <CopyableValue
              copiedLabel="Key Copied"
              copyLabel="Copy Key"
              focusOnMount
              value={key.token}
              {...copy}
            />
            <AlertDialogFooter>
              <Button onClick={onClose}>Done</Button>
            </AlertDialogFooter>
          </>
        ) : (
          <>
            <AlertDialogHeader>
              <AlertDialogMedia>
                <KeyRoundIcon />
              </AlertDialogMedia>
              <AlertDialogTitle>Add A Service Account?</AlertDialogTitle>
              <AlertDialogDescription>
                OpenLMIS creates a new key. Any system that sends it can use the
                API until the key is deleted.
              </AlertDialogDescription>
            </AlertDialogHeader>
            {error && (
              <DialogError
                description={error}
                title="Could Not Add Service Account"
              />
            )}
            <AlertDialogFooter>
              <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
              <Button disabled={pending} focusableWhenDisabled onClick={onAdd}>
                {pending && <Spinner data-icon="inline-start" />}
                Add Service Account
              </Button>
            </AlertDialogFooter>
          </>
        )}
      </AlertDialogContent>
    </AlertDialog>
  )
}

type DeleteServiceAccountDialogProps = CopyState & {
  /** The key to delete; opens the dialog while set. */
  token: string | undefined
  /** Called on Delete; delete it, then clear `token` to close. */
  onDelete: (token: string) => void
  pending?: boolean
  /** Why deleting failed. */
  error?: ReactNode
  onClose: () => void
}

/** Confirms deleting a key, which stops every system that uses it. */
export function DeleteServiceAccountDialog({
  token,
  onDelete,
  pending = false,
  error,
  onClose,
  ...copy
}: DeleteServiceAccountDialogProps) {
  const { shown, dialogProps } = useDialogTarget(token, onClose)
  const cancelRef = useRef<HTMLButtonElement>(null)

  return (
    <AlertDialog {...dialogProps(pending)}>
      {/* Cancel first, not the key's Copy button: deleting cannot be undone. */}
      <AlertDialogContent initialFocus={cancelRef}>
        <AlertDialogHeader>
          <AlertDialogMedia>
            <Trash2Icon />
          </AlertDialogMedia>
          <AlertDialogTitle>Delete This Service Account?</AlertDialogTitle>
          <AlertDialogDescription>
            Any system that uses this key stops working at once. This cannot be
            undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {shown && (
          <CopyableValue
            copiedLabel="Key Copied"
            copyLabel="Copy Key"
            value={shown}
            {...copy}
          />
        )}
        {error && (
          <DialogError
            description={error}
            title="Could Not Delete Service Account"
          />
        )}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending} ref={cancelRef}>
            Cancel
          </AlertDialogCancel>
          <Button
            disabled={pending}
            focusableWhenDisabled
            onClick={() => shown && onDelete(shown)}
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
