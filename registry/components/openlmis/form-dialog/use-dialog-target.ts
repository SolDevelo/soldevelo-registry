"use client"

import { useState } from "react"

/** Open while `target` is set, showing the last target until the close animation ends; an object target must keep its identity. */
export function useDialogTarget<T>(target: T | undefined, onClose: () => void) {
  const [shown, setShown] = useState(target)
  if (target !== undefined && target !== shown) setShown(target)

  return {
    shown,
    /** The `FormDialog` props; `locked` keeps it open, e.g. while a save runs. */
    dialogProps: (locked = false) => ({
      open: target !== undefined,
      onOpenChange: (open: boolean) => {
        if (!open && !locked) onClose()
      },
      onOpenChangeComplete: (open: boolean) => {
        if (!open) setShown(undefined)
      },
    }),
  }
}
