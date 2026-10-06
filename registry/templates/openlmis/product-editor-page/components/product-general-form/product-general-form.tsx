"use client"

import { revalidateLogic, useStore } from "@tanstack/react-form"
import { type ReactNode, useEffect, useId, useMemo, useRef } from "react"

import { FieldGroup } from "@/components/ui/field"
import {
  type FormActionState,
  FormActions,
} from "@/registry/components/openlmis/form-actions/form-actions"
import { FormDialogError } from "@/registry/components/openlmis/form-dialog/form-dialog"
import { useAppForm } from "@/registry/components/openlmis/form-fields/form"
import {
  ChoiceCardSkeleton,
  FieldSkeleton,
} from "@/registry/components/openlmis/form-fields/form-fields"

import {
  type Product,
  productChanges,
  productFormSchema,
  type ProductValues,
  toProductFormValues,
  toProductValues,
} from "./product-form"
import { ProductFormFields } from "./product-form-fields"

type ProductGeneralFormProps = {
  /** The product; a skeleton shows until it is set. */
  product: Product | undefined
  /** Other products' codes, refused as this one's. */
  takenCodes?: readonly string[]
  /** Disables every field, e.g. without the right to edit products. */
  readOnly?: boolean
  /** Called with trimmed values; save them, then pass the saved product back. */
  onSubmit: (values: ProductValues) => void
  /** Locks Save and spins it while the save runs. */
  pending?: boolean
  /** Shown above the fields, e.g. why the save failed; what was typed stays. */
  error?: ReactNode
  /** Runs on Cancel instead of putting the form back, e.g. to leave the page. */
  onCancel?: () => void
  /** Tells the page how many changes are unsaved, e.g. to ask before leaving. */
  onChangesChange?: (changes: number) => void
  /** The form's id, for a Save placed elsewhere, e.g. in a page's `WorkspaceFooter`. */
  formId?: string
  /** Places Cancel and Save; by default they sit in a row under the form, and not at all when read only. */
  renderActions?: (actions: FormActionState) => ReactNode
}

/** A product's General tab: code, name, description and pack size. */
export function ProductGeneralForm({
  product,
  ...props
}: ProductGeneralFormProps) {
  if (!product) return <ProductGeneralFormSkeleton />
  return <GeneralForm product={product} {...props} />
}

function GeneralForm({
  product,
  takenCodes,
  readOnly = false,
  onSubmit,
  pending = false,
  error,
  onCancel,
  onChangesChange,
  renderActions,
  formId: givenFormId,
}: ProductGeneralFormProps & { product: Product }) {
  const generatedFormId = useId()
  const formId = givenFormId ?? generatedFormId
  const unitRequired = !product.sizeCode
  const schema = useMemo(
    () => productFormSchema(takenCodes, { unitRequired }),
    [takenCodes, unitRequired]
  )

  const form = useAppForm({
    defaultValues: toProductFormValues(product),
    // Quiet until the first submit, then each field re-checks as it is corrected.
    validationLogic: revalidateLogic({
      mode: "submit",
      modeAfterSubmission: "change",
    }),
    validators: { onDynamic: schema },
    onSubmit: ({ value }) => onSubmit(toProductValues(value)),
  })
  const changes = useStore(form.store, (state) =>
    productChanges(state.values, product)
  )

  // Start again only from saved values that differ, so a rebuilt but equal product keeps the draft.
  const savedKey = JSON.stringify(toProductFormValues(product))
  const lastSavedKey = useRef(savedKey)
  useEffect(() => {
    if (savedKey === lastSavedKey.current) return
    lastSavedKey.current = savedKey
    form.reset(toProductFormValues(product))
  }, [form, product, savedKey])
  useEffect(() => {
    onChangesChange?.(changes)
  }, [changes, onChangesChange])

  const actions: FormActionState = {
    formId,
    changed: changes > 0,
    pending,
    cancel: onCancel ?? (() => form.reset(toProductFormValues(product))),
  }

  return (
    <>
      <form
        className="max-w-xl"
        id={formId}
        noValidate
        onSubmit={(event) => {
          event.preventDefault()
          if (changes > 0) void form.handleSubmit()
        }}
      >
        <FieldGroup>
          {error && (
            <FormDialogError
              description={error}
              title="Could Not Save Product"
            />
          )}
          <ProductFormFields
            disabled={readOnly}
            form={form}
            sizeCode={product.sizeCode}
          />
        </FieldGroup>
      </form>
      {renderActions
        ? renderActions(actions)
        : !readOnly && (
            <div className="flex max-w-xl justify-end gap-2">
              <FormActions actions={actions} saveLabel="Save Product" />
            </div>
          )}
    </>
  )
}

export function ProductGeneralFormSkeleton() {
  return (
    <div aria-busy className="max-w-xl">
      <FieldGroup>
        <FieldSkeleton label="Product Code" required />
        <FieldSkeleton label="Name" />
        <FieldSkeleton label="Description" />
        <FieldSkeleton label="Dispensing Unit" required />
        <div className="grid gap-5 @md/field-group:grid-cols-2">
          <FieldSkeleton label="Net Content" required />
          <FieldSkeleton label="Pack Rounding Threshold" required />
        </div>
        <ChoiceCardSkeleton label="Round To Zero" />
      </FieldGroup>
    </div>
  )
}
