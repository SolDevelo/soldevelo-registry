"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import type { KitProduct } from "@/registry/blocks/openlmis/kit-products-dialog/kit-products-dialog"

import type { KitChild } from "./kit-form"
import { ProductKitUnpackList } from "./product-kit-unpack-list"

const ASPIRIN: KitProduct = {
  id: "p1",
  productCode: "C100",
  fullProductName: "Acetylsalicylic Acid",
  dispensingUnit: "10 tab strip",
}
const GAUZE: KitProduct = {
  id: "p2",
  productCode: "C101",
  fullProductName: "Gauze Bandage",
  dispensingUnit: "each",
}
const UNNAMED: KitProduct = {
  id: "p5",
  productCode: "C104",
  fullProductName: null,
}

const PRODUCTS: KitProduct[] = [
  { id: "kit", productCode: "K100", fullProductName: "Delivery Kit" },
  ASPIRIN,
  GAUZE,
  { id: "p3", productCode: "C102", fullProductName: "Surgical Gloves" },
  {
    id: "p4",
    productCode: "C103",
    fullProductName: "Oxytocin",
    dispensingUnit: "ampoule",
  },
  UNNAMED,
]

const CHILDREN: KitChild[] = [
  { product: ASPIRIN, quantity: 20 },
  { product: GAUZE, quantity: 4 },
  { product: UNNAMED, quantity: 1 },
]

const NO_CHILDREN: KitChild[] = []

type Scenario = "ready" | "read-only" | "empty" | "loading" | "saving" | "error"

const SCENARIOS: { value: Scenario; label: string }[] = [
  { value: "ready", label: "Ready" },
  { value: "read-only", label: "Read Only" },
  { value: "empty", label: "Empty" },
  { value: "loading", label: "Loading" },
  { value: "saving", label: "Saving" },
  { value: "error", label: "Save Failed" },
]

const byId = new Map(PRODUCTS.map((product) => [product.id, product]))

export default function Page() {
  const [children, setChildren] = useState(CHILDREN)
  const [scenario, setScenario] = useState<Scenario>("ready")

  return (
    <div className="@container/main flex w-full max-w-4xl flex-col gap-4 p-8">
      <div className="flex flex-wrap gap-2">
        {SCENARIOS.map((item) => (
          <Button
            key={item.value}
            onClick={() => setScenario(item.value)}
            size="sm"
            variant={scenario === item.value ? "default" : "outline"}
          >
            {item.label}
          </Button>
        ))}
      </div>
      <ProductKitUnpackList
        error={
          scenario === "error"
            ? "Something went wrong. Check your connection and try again."
            : undefined
        }
        key={scenario === "empty" ? "empty" : "kit"}
        kitChildren={
          scenario === "loading"
            ? undefined
            : scenario === "empty"
              ? NO_CHILDREN
              : children
        }
        kitId="kit"
        onSubmit={(values) =>
          setChildren(
            values.flatMap(({ productId, quantity }) => {
              const product = byId.get(productId)
              return product ? [{ product, quantity }] : []
            })
          )
        }
        pending={scenario === "saving"}
        products={PRODUCTS}
        searchLimit={3}
        readOnly={scenario === "read-only"}
      />
    </div>
  )
}
