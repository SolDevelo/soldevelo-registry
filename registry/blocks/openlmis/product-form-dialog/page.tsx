"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"

import { ProductFormDialog } from "./product-form-dialog"

const TAKEN_CODES = ["C100", "C200", "C300"]

export default function Page() {
  // Open on load, so the catalog shows the dialog rather than its trigger.
  const [open, setOpen] = useState(true)
  const [error, setError] = useState<string>()
  const [added, setAdded] = useState<string>()
  const close = () => {
    setOpen(false)
    setError(undefined)
  }

  return (
    // Tall enough for the open dialog, which is fixed and so adds nothing to the frame's height.
    <div className="flex min-h-208 w-full flex-col items-start gap-2 p-8">
      <Button onClick={() => setOpen(true)}>Add Product</Button>
      {added && (
        <p className="text-sm text-muted-foreground">{added} is added.</p>
      )}
      <p className="text-sm text-muted-foreground">
        C100 is taken; a code of FAIL shows how a failed save reads.
      </p>
      <ProductFormDialog
        error={error}
        onClose={close}
        onSubmit={(values) => {
          if (values.productCode === "FAIL") {
            setError(
              "Something went wrong. Check your connection and try again."
            )
            return
          }
          setAdded(values.fullProductName || values.productCode)
          close()
        }}
        open={open}
        takenCodes={TAKEN_CODES}
      />
    </div>
  )
}
