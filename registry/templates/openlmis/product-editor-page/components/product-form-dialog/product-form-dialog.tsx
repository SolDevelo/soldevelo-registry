"use client"

import { revalidateLogic } from "@tanstack/react-form"
import { type ReactNode, useMemo } from "react"

import { FieldGroup } from "@/components/ui/field"
import { ProductFormFields } from "../product-general-form/product-form-fields"
import {
  EMPTY_PRODUCT_FORM,
  productFormSchema,
  type ProductValues,
  toProductValues,
} from "../product-general-form/product-form"
import {
  FormDialog,
  FormDialogBody,
  FormDialogCancel,
  FormDialogDescription,
  FormDialogError,
  FormDialogFooter,
  FormDialogForm,
  FormDialogHeader,
  FormDialogSubmit,
  FormDialogTitle,
} from "@/registry/components/openlmis/form-dialog/form-dialog"
import { useDialogTarget } from "@/registry/components/openlmis/form-dialog/use-dialog-target"
import { useAppForm } from "@/registry/components/openlmis/form-fields/form"

type ProductFormDialogProps = {
  open: boolean
  /** Existing products' codes, refused for the new one. */
  takenCodes?: readonly string[]
  /** Called with trimmed values; create the product, then close. */
  onSubmit: (values: ProductValues) => void
  /** Keeps the dialog open and spins Add Product while the create runs. */
  pending?: boolean
  /** Shown above the fields, e.g. why the create failed; what was typed stays. */
  error?: ReactNode
  onClose: () => void
}

/** Add Product: a code, a name and how it is packed. */
export function ProductFormDialog({
  open,
  takenCodes,
  onSubmit,
  pending = false,
  error,
  onClose,
}: ProductFormDialogProps) {
  const { shown, dialogProps } = useDialogTarget(open || undefined, onClose)

  return (
    <FormDialog {...dialogProps(pending)}>
      {shown && (
        <AddProductForm
          error={error}
          onSubmit={onSubmit}
          pending={pending}
          takenCodes={takenCodes}
        />
      )}
    </FormDialog>
  )
}

function AddProductForm({
  takenCodes,
  onSubmit,
  pending,
  error,
}: Omit<ProductFormDialogProps, "open" | "onClose"> & { pending: boolean }) {
  const schema = useMemo(() => productFormSchema(takenCodes), [takenCodes])
  const form = useAppForm({
    defaultValues: EMPTY_PRODUCT_FORM,
    // Quiet until the first submit, then each field re-checks as it is corrected.
    validationLogic: revalidateLogic({
      mode: "submit",
      modeAfterSubmission: "change",
    }),
    validators: { onDynamic: schema },
    onSubmit: ({ value }) => onSubmit(toProductValues(value)),
  })

  return (
    <FormDialogForm onSubmit={() => void form.handleSubmit()}>
      <FormDialogHeader>
        <FormDialogTitle>Add Product</FormDialogTitle>
        <FormDialogDescription>
          Give the product a code and say how it is packed.
        </FormDialogDescription>
      </FormDialogHeader>
      <FormDialogBody>
        <FieldGroup>
          {error && (
            <FormDialogError
              description={error}
              title="Could Not Save Product"
            />
          )}
          <ProductFormFields form={form} />
        </FieldGroup>
      </FormDialogBody>
      <FormDialogFooter>
        <FormDialogCancel disabled={pending} />
        <FormDialogSubmit pending={pending}>Add Product</FormDialogSubmit>
      </FormDialogFooter>
    </FormDialogForm>
  )
}
