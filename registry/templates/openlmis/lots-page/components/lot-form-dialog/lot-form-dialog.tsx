"use client"

import { revalidateLogic } from "@tanstack/react-form"
import { type ReactNode, useEffect, useMemo } from "react"

import { FieldGroup } from "@/components/ui/field"
import {
  FormDialog,
  FormDialogBody,
  FormDialogCancel,
  FormDialogDescription,
  FormDialogError,
  FormDialogFooter,
  FormDialogForm,
  FormDialogHeader,
  FormDialogLoadError,
  FormDialogSubmit,
  FormDialogTitle,
} from "@/registry/components/openlmis/form-dialog/form-dialog"
import { useDialogTarget } from "@/registry/components/openlmis/form-dialog/use-dialog-target"
import { useAppForm } from "@/registry/components/openlmis/form-fields/form"
import {
  FieldSkeleton,
  SkeletonLine,
} from "@/registry/components/openlmis/form-fields/form-fields"

import {
  type Lot,
  type LotFormValues,
  type LotProduct,
  lotFormSchema,
  toLotFormValues,
} from "./lot-form"

const NO_CODES: readonly string[] = []

const TITLE = "Edit Lot"

type LotFormDialogProps = {
  /** The id of the lot to edit; opens the dialog while set. */
  target: string | undefined
  /** The lot being edited; a skeleton shows until it is set. */
  lot?: Lot | undefined
  /** The lot's product: `undefined` while it loads, `null` when no product has the lot's trade item. */
  product?: LotProduct | null | undefined
  /** Shown in place of the product when it could not be loaded. */
  productError?: string | undefined
  /** Codes the server refused as taken by another lot of the product. */
  refusedCodes?: readonly string[]
  /** The lot no longer exists. */
  notFound?: boolean
  /** Loading the lot failed; shows the error with Try Again. */
  onRetry?: (() => void) | undefined
  /** Called with the values; save them, then clear `target` to close. */
  onSubmit: (values: LotFormValues, lot: Lot) => void
  /** Keeps the dialog open and shows a spinner while the lot is saved. */
  pending?: boolean
  /** Shown above the fields, e.g. why the save failed. */
  error?: ReactNode
  onClose: () => void
}

export function LotFormDialog({
  target,
  lot,
  product,
  productError,
  refusedCodes = NO_CODES,
  notFound = false,
  onRetry,
  onSubmit,
  pending = false,
  error,
  onClose,
}: LotFormDialogProps) {
  const { shown, dialogProps } = useDialogTarget(target, onClose)

  return (
    <FormDialog {...dialogProps(pending)}>
      {shown &&
        (notFound ? (
          <>
            <FormDialogHeader>
              <FormDialogTitle>{TITLE}</FormDialogTitle>
              <FormDialogDescription>
                This lot no longer exists.
              </FormDialogDescription>
            </FormDialogHeader>
            <FormDialogFooter>
              <FormDialogCancel>Close</FormDialogCancel>
            </FormDialogFooter>
          </>
        ) : onRetry ? (
          <FormDialogLoadError
            errorTitle="Could Not Load Lot"
            onRetry={onRetry}
            title={TITLE}
          />
        ) : lot === undefined ? (
          <LotFormSkeleton />
        ) : (
          <LotForm
            error={error}
            // Keyed, so opening another lot starts a fresh form.
            key={lot.id}
            lot={lot}
            onSubmit={onSubmit}
            pending={pending}
            product={product}
            productError={productError}
            refusedCodes={refusedCodes}
          />
        ))}
    </FormDialog>
  )
}

function LotProductLine({
  product,
  error,
}: Pick<LotFormDialogProps, "product"> & { error: string | undefined }) {
  if (error) return <FormDialogDescription>{error}</FormDialogDescription>
  if (product === undefined) return <SkeletonLine />
  return (
    <FormDialogDescription>
      {product
        ? `A lot of ${product.fullProductName} (${product.productCode}).`
        : "No product has this lot's trade item."}
    </FormDialogDescription>
  )
}

type LotFormProps = Pick<
  LotFormDialogProps,
  "product" | "productError" | "onSubmit" | "error"
> & {
  lot: Lot
  refusedCodes: readonly string[]
  pending: boolean
}

function LotForm({
  lot,
  product,
  productError,
  refusedCodes,
  onSubmit,
  pending,
  error,
}: LotFormProps) {
  const schema = useMemo(() => lotFormSchema(refusedCodes), [refusedCodes])

  const form = useAppForm({
    defaultValues: toLotFormValues(lot),
    // Quiet until the first submit, then each field re-checks as it is corrected.
    validationLogic: revalidateLogic({
      mode: "submit",
      modeAfterSubmission: "change",
    }),
    validators: { onDynamic: schema },
    onSubmit: ({ value }) => onSubmit(value, lot),
  })

  // A code the server just refused shows its error at once, without another submit.
  useEffect(() => {
    if (refusedCodes.length > 0) void form.validate("change")
  }, [refusedCodes, form])

  return (
    <FormDialogForm onSubmit={form.handleSubmit}>
      <FormDialogHeader>
        <FormDialogTitle>{TITLE}</FormDialogTitle>
        <LotProductLine error={productError} product={product} />
      </FormDialogHeader>
      <FormDialogBody>
        <FieldGroup>
          {error && (
            <FormDialogError description={error} title="Could Not Save Lot" />
          )}
          <form.AppField name="lotCode">
            {(field) => (
              <field.TextField
                autoComplete="off"
                dir="ltr"
                label="Lot Code"
                required
              />
            )}
          </form.AppField>
          <form.AppField name="expirationDate">
            {(field) => (
              <field.DateField
                clearLabel="Clear Expiry Date"
                label="Expiry Date"
                placeholder="Pick A Date"
              />
            )}
          </form.AppField>
          <form.AppField name="manufactureDate">
            {(field) => (
              <field.DateField
                clearLabel="Clear Manufacture Date"
                label="Manufacture Date"
                placeholder="Pick A Date"
              />
            )}
          </form.AppField>
        </FieldGroup>
      </FormDialogBody>
      <FormDialogFooter>
        <FormDialogCancel disabled={pending} />
        <FormDialogSubmit pending={pending}>Save</FormDialogSubmit>
      </FormDialogFooter>
    </FormDialogForm>
  )
}

/** Laid out like the form, so nothing moves when the lot arrives. */
function LotFormSkeleton() {
  return (
    <>
      <FormDialogHeader>
        <FormDialogTitle>{TITLE}</FormDialogTitle>
        <SkeletonLine />
      </FormDialogHeader>
      <FormDialogBody>
        <div aria-busy>
          <FieldGroup>
            <FieldSkeleton label="Lot Code" required />
            <FieldSkeleton label="Expiry Date" />
            <FieldSkeleton label="Manufacture Date" />
          </FieldGroup>
        </div>
      </FormDialogBody>
      <FormDialogFooter>
        <FormDialogCancel />
        <FormDialogSubmit disabled>Save</FormDialogSubmit>
      </FormDialogFooter>
    </>
  )
}
