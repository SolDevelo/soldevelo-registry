"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"

import type { Product } from "./product-form"
import { ProductGeneralForm } from "./product-general-form"

const PRODUCT: Product = {
  id: "p1",
  productCode: "C100",
  fullProductName: "Acetylsalicylic Acid",
  description: "Pain relief and fever reducer, 300 mg tablets.",
  dispensingUnit: "10 tab strip",
  netContent: 16,
  packRoundingThreshold: 8,
  roundToZero: false,
}

const SIZED: Product = {
  ...PRODUCT,
  id: "p2",
  productCode: "C200",
  fullProductName: "Male Condom",
  description: null,
  dispensingUnit: null,
  sizeCode: "EACH",
}

type Scenario =
  | "ready"
  | "read-only"
  | "size-code"
  | "loading"
  | "saving"
  | "error"

const SCENARIOS: { value: Scenario; label: string }[] = [
  { value: "ready", label: "Ready" },
  { value: "read-only", label: "Read Only" },
  { value: "size-code", label: "Size Code" },
  { value: "loading", label: "Loading" },
  { value: "saving", label: "Saving" },
  { value: "error", label: "Save Failed" },
]

export default function Page() {
  const [product, setProduct] = useState(PRODUCT)
  const [scenario, setScenario] = useState<Scenario>("ready")
  const shown = scenario === "size-code" ? SIZED : product

  return (
    <div className="flex w-full max-w-4xl flex-col gap-4 p-8">
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
      <ProductGeneralForm
        error={
          scenario === "error"
            ? "Something went wrong. Check your connection and try again."
            : undefined
        }
        key={shown.id}
        onSubmit={(values) => setProduct({ ...product, ...values })}
        pending={scenario === "saving"}
        product={scenario === "loading" ? undefined : shown}
        readOnly={scenario === "read-only"}
        takenCodes={["C200", "C300"]}
      />
    </div>
  )
}
