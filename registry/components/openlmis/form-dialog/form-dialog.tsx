"use client"

import { AlertCircleIcon } from "lucide-react"
import type { ReactNode } from "react"

import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Spinner } from "@/components/ui/spinner"

type FormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Runs once the close animation ends, e.g. to drop the content it was showing. */
  onOpenChangeComplete?: (open: boolean) => void
  children: ReactNode
}

/** A dialog sized for a form, that stays inside the viewport and scrolls its body when it has to. */
export function FormDialog({
  open,
  onOpenChange,
  onOpenChangeComplete,
  children,
}: FormDialogProps) {
  return (
    <Dialog
      // A click outside would throw away everything typed, so only Cancel, Close and Escape close it.
      disablePointerDismissal
      onOpenChange={onOpenChange}
      onOpenChangeComplete={onOpenChangeComplete}
      open={open}
    >
      {/* Flex instead of grid, so the form can hand the leftover height to its body. */}
      {/* oxlint-disable-next-line shadcn/no-arbitrary-values -- no scale value keeps a margin inside the dynamic viewport */}
      <DialogContent className="flex max-h-[calc(100dvh-2rem)] flex-col sm:max-w-lg">
        {children}
      </DialogContent>
    </Dialog>
  )
}

type FormDialogFormProps = {
  onSubmit: () => void
  children: ReactNode
}

/** Lays out the header, body and footer so only the body scrolls. */
export function FormDialogForm({ onSubmit, children }: FormDialogFormProps) {
  return (
    <form
      className="flex min-h-0 flex-1 flex-col gap-4"
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        event.stopPropagation()
        onSubmit()
      }}
    >
      {children}
    </form>
  )
}

export function FormDialogHeader({ children }: { children: ReactNode }) {
  // Room at the end for the close button, so a long title never runs under it.
  return <DialogHeader className="gap-1 pe-8">{children}</DialogHeader>
}

export function FormDialogTitle({ children }: { children: ReactNode }) {
  return <DialogTitle>{children}</DialogTitle>
}

export function FormDialogDescription({ children }: { children: ReactNode }) {
  return <DialogDescription>{children}</DialogDescription>
}

/** Scrolls on its own, so the header and footer stay in view on a short screen. */
export function FormDialogBody({ children }: { children: ReactNode }) {
  // Bleeds to the dialog's edges, so focus rings are not clipped and the scrollbar sits at the edge.
  return (
    <div className="-mx-4 min-h-0 flex-1 overflow-y-auto px-4 py-1">
      {children}
    </div>
  )
}

export function FormDialogFooter({ children }: { children: ReactNode }) {
  return <DialogFooter>{children}</DialogFooter>
}

type FormDialogCancelProps = {
  disabled?: boolean
  children?: ReactNode
}

export function FormDialogCancel({
  disabled = false,
  children = "Cancel",
}: FormDialogCancelProps) {
  return (
    <DialogClose
      disabled={disabled}
      render={<Button type="button" variant="outline" />}
    >
      {children}
    </DialogClose>
  )
}

type FormDialogSubmitProps = {
  pending?: boolean
  disabled?: boolean
  children: ReactNode
}

export function FormDialogSubmit({
  pending = false,
  disabled = false,
  children,
}: FormDialogSubmitProps) {
  return (
    <Button disabled={pending || disabled} type="submit">
      {pending && <Spinner data-icon="inline-start" />}
      {children}
    </Button>
  )
}

type FormDialogErrorProps = {
  title: ReactNode
  description: ReactNode
  /** A button beside the message, such as Try Again. */
  action?: ReactNode
}

/** A failed save or load, shown inside the dialog so what was typed stays on screen. */
export function FormDialogError({
  title,
  description,
  action,
}: FormDialogErrorProps) {
  return (
    <Alert variant="destructive">
      <AlertCircleIcon />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{description}</AlertDescription>
      {action && <AlertAction>{action}</AlertAction>}
    </Alert>
  )
}

type FormDialogLoadErrorProps = {
  /** The dialog's own title, so it still says what failed to open. */
  title: ReactNode
  errorTitle: ReactNode
  errorDescription?: ReactNode
  onRetry: () => void
  retryLabel?: ReactNode
  cancelLabel?: ReactNode
}

/** The whole dialog when what it edits could not be loaded: its title, the error, Try Again. */
export function FormDialogLoadError({
  title,
  errorTitle,
  errorDescription = "Check your connection and try again.",
  onRetry,
  retryLabel = "Try Again",
  cancelLabel,
}: FormDialogLoadErrorProps) {
  return (
    <>
      <FormDialogHeader>
        <FormDialogTitle>{title}</FormDialogTitle>
      </FormDialogHeader>
      <FormDialogError
        action={
          <Button onClick={onRetry} size="sm" type="button" variant="outline">
            {retryLabel}
          </Button>
        }
        description={errorDescription}
        title={errorTitle}
      />
      <FormDialogFooter>
        <FormDialogCancel>{cancelLabel}</FormDialogCancel>
      </FormDialogFooter>
    </>
  )
}
