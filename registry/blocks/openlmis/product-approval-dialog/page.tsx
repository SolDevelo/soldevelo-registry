"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import type { NamedOption } from "@/registry/blocks/openlmis/product-program-link-dialog/program-link-form"

import type { Approval } from "./approval-form"
import {
  type ApprovalDialogTarget,
  ProductApprovalDialog,
} from "./product-approval-dialog"

const HEALTH_CENTER = { id: "health-center", name: "Health Center" }
const FAMILY_PLANNING = { id: "family-planning", name: "Family Planning" }

const FACILITY_TYPES: NamedOption[] = [
  HEALTH_CENTER,
  { id: "district-hospital", name: "District Hospital" },
  { id: "warehouse", name: "Warehouse" },
]

const PROGRAMS: NamedOption[] = [
  FAMILY_PLANNING,
  { id: "essential-meds", name: "Essential Meds" },
]

const APPROVALS: Approval[] = [
  {
    id: "a1",
    facilityType: HEALTH_CENTER,
    program: FAMILY_PLANNING,
    maxPeriodsOfStock: 3,
    emergencyOrderPoint: 0.5,
    minPeriodsOfStock: 1,
  },
]

const named = (options: readonly NamedOption[], id: string) =>
  options.find((option) => option.id === id) ?? { id, name: id }

type Demo = "add" | "edit" | "view" | "loading" | "saving" | "error"

const DEMOS: { value: Demo; label: string }[] = [
  { value: "add", label: "Add" },
  { value: "edit", label: "Edit" },
  { value: "view", label: "View" },
  { value: "loading", label: "Loading" },
  { value: "saving", label: "Saving" },
  { value: "error", label: "Save Failed" },
]

export default function Page() {
  const [approvals, setApprovals] = useState(APPROVALS)
  // Open on load, so the catalog shows the dialog rather than its triggers.
  const [demo, setDemo] = useState<Demo | undefined>("add")
  const target: ApprovalDialogTarget | undefined =
    demo === undefined
      ? undefined
      : demo === "add" || demo === "loading"
        ? "new"
        : "a1"
  const loaded = demo !== "loading"

  return (
    // Tall enough for the open dialog, which is fixed and so adds nothing to the frame's height.
    <div className="flex min-h-200 w-full flex-wrap content-start gap-2 p-8">
      {DEMOS.map((item) => (
        <Button
          key={item.value}
          onClick={() => setDemo(item.value)}
          size="sm"
          variant="outline"
        >
          {item.label}
        </Button>
      ))}
      <p className="w-full text-sm text-muted-foreground">
        Health Center already stocks it in Family Planning, so that pair is
        refused.
      </p>
      <ProductApprovalDialog
        approvals={loaded ? approvals : undefined}
        error={
          demo === "error"
            ? "Something went wrong. Check your connection and try again."
            : undefined
        }
        facilityTypes={loaded ? FACILITY_TYPES : undefined}
        onClose={() => setDemo(undefined)}
        onSubmit={(values, existing) => {
          setApprovals((current) =>
            existing
              ? current.map((item) =>
                  item.id === existing.id ? { ...item, ...values } : item
                )
              : [
                  ...current,
                  {
                    ...values,
                    id: `${values.facilityTypeId}-${values.programId}`,
                    facilityType: named(FACILITY_TYPES, values.facilityTypeId),
                    program: named(PROGRAMS, values.programId),
                  },
                ]
          )
          setDemo(undefined)
        }}
        pending={demo === "saving"}
        productName="Male Condom"
        programs={loaded ? PROGRAMS : undefined}
        readOnly={demo === "view"}
        target={target}
      />
    </div>
  )
}
