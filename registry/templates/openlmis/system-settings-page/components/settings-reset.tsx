"use client"

import { RotateCcwIcon } from "lucide-react"
import { useState } from "react"

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

type SettingsResetProps = {
  label: string
  title: string
  description: string
  confirmLabel: string
  disabled: boolean
  pending?: boolean
  onConfirm: () => void
}

/** A header button that asks before putting a section back to the app's defaults. */
export function SettingsReset({
  label,
  title,
  description,
  confirmLabel,
  disabled,
  pending = false,
  onConfirm,
}: SettingsResetProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        disabled={disabled}
        focusableWhenDisabled
        onClick={() => setOpen(true)}
        size="lg"
        type="button"
        variant="outline"
      >
        <RotateCcwIcon data-icon="inline-start" />
        {label}
      </Button>
      <AlertDialog
        onOpenChange={(next) => !pending && setOpen(next)}
        open={open}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia>
              <RotateCcwIcon />
            </AlertDialogMedia>
            <AlertDialogTitle>{title}</AlertDialogTitle>
            <AlertDialogDescription>{description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
            <Button
              disabled={pending}
              focusableWhenDisabled
              onClick={() => {
                onConfirm()
                setOpen(false)
              }}
              variant="destructive"
            >
              {pending && <Spinner data-icon="inline-start" />}
              {confirmLabel}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
