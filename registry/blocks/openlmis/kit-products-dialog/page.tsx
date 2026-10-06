"use client"

import { useMemo, useState } from "react"

import { Button } from "@/components/ui/button"

import {
  type KitProduct,
  KitProductsDialog,
  kitProductLabel,
} from "./kit-products-dialog"

const ASPIRIN: KitProduct = {
  id: "p1",
  productCode: "C100",
  fullProductName: "Acetylsalicylic Acid",
  dispensingUnit: "10 tab strip",
}

const PRODUCTS: KitProduct[] = [
  { id: "kit", productCode: "K100", fullProductName: "Delivery Kit" },
  ASPIRIN,
  {
    id: "p2",
    productCode: "C101",
    fullProductName: "Gauze Bandage",
    dispensingUnit: "each",
  },
  { id: "p3", productCode: "C102", fullProductName: "Surgical Gloves" },
  {
    id: "p4",
    productCode: "C103",
    fullProductName: "Oxytocin",
    dispensingUnit: "ampoule",
  },
  { id: "p5", productCode: "C104", fullProductName: null },
]

export default function Page() {
  // Open on load, so the catalog shows the dialog rather than its trigger.
  const [open, setOpen] = useState(true)
  const [kit, setKit] = useState<KitProduct[]>([ASPIRIN])
  const excluded = useMemo(
    () => new Set(["kit", ...kit.map((product) => product.id)]),
    [kit]
  )

  return (
    // Tall enough for the open dialog, which is fixed and so adds nothing to the frame's height.
    <div className="flex min-h-120 w-full flex-col items-start gap-2 p-8">
      <Button onClick={() => setOpen(true)}>Add Products</Button>
      <ul className="text-sm text-muted-foreground">
        {kit.map((product) => (
          <li key={product.id}>{kitProductLabel(product)}</li>
        ))}
      </ul>
      <KitProductsDialog
        excluded={excluded}
        onAdd={(picked) => setKit((current) => [...current, ...picked])}
        onClose={() => setOpen(false)}
        open={open}
        limit={3}
        products={PRODUCTS}
      />
    </div>
  )
}
