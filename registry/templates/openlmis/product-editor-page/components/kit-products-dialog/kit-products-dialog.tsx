"use client"

import { useMemo, useState } from "react"

import { FieldGroup } from "@/components/ui/field"
import {
  FormDialog,
  FormDialogBody,
  FormDialogCancel,
  FormDialogDescription,
  FormDialogFooter,
  FormDialogForm,
  FormDialogHeader,
  FormDialogSubmit,
  FormDialogTitle,
} from "@/registry/components/openlmis/form-dialog/form-dialog"
import { useDialogTarget } from "@/registry/components/openlmis/form-dialog/use-dialog-target"
import { useAppForm } from "@/registry/components/openlmis/form-fields/form"

/** A product that can go into a kit. */
export type KitProduct = {
  id: string
  productCode: string
  fullProductName: string | null
  dispensingUnit?: string | null
}

/** Code and name, then the unit, so two packings of one product tell apart. */
export function kitProductLabel(product: KitProduct) {
  const name = product.fullProductName
    ? `${product.productCode} - ${product.fullProductName}`
    : product.productCode
  return product.dispensingUnit ? `${name} (${product.dispensingUnit})` : name
}

type KitProductsDialogProps = {
  open: boolean
  /** The products to pick from. */
  products: readonly KitProduct[]
  /** Left out of the choices: the kit itself and the products already in it. */
  excluded: ReadonlySet<string>
  onAdd: (products: KitProduct[]) => void
  onClose: () => void
  /** Lists only the first this many matches, with a hint to type more, as a server search would. */
  limit?: number
}

/** Pick, by code or name, the products a kit unpacks into. */
export function KitProductsDialog({
  open,
  onClose,
  ...props
}: KitProductsDialogProps) {
  const { shown, dialogProps } = useDialogTarget(open || undefined, onClose)

  return (
    <FormDialog {...dialogProps()}>
      {shown && <KitProductsForm onDone={onClose} {...props} />}
    </FormDialog>
  )
}

function KitProductsForm({
  products,
  excluded,
  onAdd,
  onDone,
  limit,
}: Omit<KitProductsDialogProps, "open" | "onClose"> & { onDone: () => void }) {
  const [typed, setTyped] = useState("")
  const matches = useMemo(() => {
    const query = typed.trim().toLowerCase()
    return products
      .filter((product) => !excluded.has(product.id))
      .map((product) => ({
        value: product.id,
        label: kitProductLabel(product),
      }))
      .filter((item) => item.label.toLowerCase().includes(query))
  }, [products, excluded, typed])
  const items = limit === undefined ? matches : matches.slice(0, limit)

  const form = useAppForm({
    defaultValues: { picked: [] as string[] },
    onSubmit: ({ value }) => {
      const picked = new Set(value.picked)
      onAdd(products.filter((product) => picked.has(product.id)))
      onDone()
    },
  })

  return (
    <FormDialogForm onSubmit={() => void form.handleSubmit()}>
      <FormDialogHeader>
        <FormDialogTitle>Add Products</FormDialogTitle>
        <FormDialogDescription>
          Search by code or name and pick the products this kit unpacks into.
          Enter their quantities in the list.
        </FormDialogDescription>
      </FormDialogHeader>
      <FormDialogBody>
        <FieldGroup>
          <form.AppField name="picked">
            {(field) => (
              <field.MultiComboboxField
                description={
                  items.length < matches.length
                    ? `The first ${items.length} of ${matches.length} matches are listed. Type more of the code or name to narrow them down.`
                    : "The kit itself and products already in it are left out."
                }
                emptyMessage="No products match."
                items={items}
                label="Products"
                onSearch={setTyped}
                placeholder="Search By Code Or Name"
                removeLabel={(label) => `Remove ${label}`}
              />
            )}
          </form.AppField>
        </FieldGroup>
      </FormDialogBody>
      <FormDialogFooter>
        <FormDialogCancel />
        <form.Subscribe selector={(state) => state.values.picked.length}>
          {(count) => (
            <FormDialogSubmit disabled={count === 0}>
              {count === 0
                ? "Add Products"
                : count === 1
                  ? "Add 1 Product"
                  : `Add ${count} Products`}
            </FormDialogSubmit>
          )}
        </form.Subscribe>
      </FormDialogFooter>
    </FormDialogForm>
  )
}
