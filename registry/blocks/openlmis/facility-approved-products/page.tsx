"use client"

import { useCallback, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  useColumnVisibility,
  useContainerSize,
} from "@/registry/blocks/openlmis/data-table/responsive-columns"
import type { Approval } from "@/registry/blocks/openlmis/product-approval-dialog/approval-form"
import { ProductApprovalDialog } from "@/registry/blocks/openlmis/product-approval-dialog/product-approval-dialog"
import type { NamedOption } from "@/registry/blocks/openlmis/product-program-link-dialog/program-link-form"

import {
  APPROVAL_HIDEABLE_COLUMNS,
  ApprovalsToolbar,
  FacilityApprovedProducts,
} from "./facility-approved-products"
import { RemoveApprovalDialog } from "./remove-approval-dialog"

const HEALTH_CENTER = { id: "health-center", name: "Health Center" }
const DISTRICT_HOSPITAL = { id: "district-hospital", name: "District Hospital" }
const FAMILY_PLANNING = { id: "family-planning", name: "Family Planning" }
const ESSENTIAL_MEDS = { id: "essential-meds", name: "Essential Meds" }

const FACILITY_TYPES: NamedOption[] = [
  HEALTH_CENTER,
  DISTRICT_HOSPITAL,
  { id: "warehouse", name: "Warehouse" },
]
const PROGRAMS: NamedOption[] = [FAMILY_PLANNING, ESSENTIAL_MEDS]

const APPROVALS: Approval[] = [
  {
    id: "a1",
    facilityType: HEALTH_CENTER,
    program: FAMILY_PLANNING,
    maxPeriodsOfStock: 3,
    emergencyOrderPoint: 0.5,
    minPeriodsOfStock: 1,
  },
  {
    id: "a2",
    facilityType: HEALTH_CENTER,
    program: ESSENTIAL_MEDS,
    maxPeriodsOfStock: 2.25,
    emergencyOrderPoint: null,
    minPeriodsOfStock: null,
  },
  {
    id: "a3",
    facilityType: DISTRICT_HOSPITAL,
    program: FAMILY_PLANNING,
    maxPeriodsOfStock: 4,
    emergencyOrderPoint: 1,
    minPeriodsOfStock: 2,
  },
]

const named = (options: readonly NamedOption[], id: string) =>
  options.find((option) => option.id === id) ?? { id, name: id }

type Scenario = "ready" | "read-only" | "empty" | "loading" | "error"

const SCENARIOS: { value: Scenario; label: string }[] = [
  { value: "ready", label: "Ready" },
  { value: "read-only", label: "Read Only" },
  { value: "empty", label: "Empty" },
  { value: "loading", label: "Loading" },
  { value: "error", label: "Load Failed" },
]

type OpenDialog = { kind: "approval" | "remove"; id: string }

export default function Page() {
  const [approvals, setApprovals] = useState(APPROVALS)
  const [scenario, setScenario] = useState<Scenario>("ready")
  const [dialog, setDialog] = useState<OpenDialog>()
  const [choices, setChoices] = useState({})
  const [measure, size] = useContainerSize<HTMLDivElement>()
  const columns = useColumnVisibility(
    APPROVAL_HIDEABLE_COLUMNS,
    [choices, setChoices],
    size
  )
  const canEdit = scenario !== "read-only"
  const onEdit = useCallback(
    (id: string) => setDialog({ kind: "approval", id }),
    []
  )
  const onRemove = useCallback(
    (id: string) => setDialog({ kind: "remove", id }),
    []
  )
  const close = () => setDialog(undefined)

  return (
    <div className="flex w-full max-w-6xl flex-col gap-4 p-8">
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
      <div className="@container/main flex flex-col gap-4" ref={measure}>
        <ApprovalsToolbar
          columnVisibility={columns.visibility}
          onAdd={
            canEdit
              ? () => setDialog({ kind: "approval", id: "new" })
              : undefined
          }
          onColumnReset={columns.onReset}
          onColumnVisibilityChange={columns.onVisibilityChange}
        />
        <FacilityApprovedProducts
          approvals={
            scenario === "loading"
              ? undefined
              : scenario === "empty"
                ? []
                : approvals
          }
          canEdit={canEdit}
          columnVisibility={columns.visibility}
          error={
            scenario === "error" ? "Could Not Load Facility Types" : undefined
          }
          onEdit={onEdit}
          onRemove={onRemove}
          onRetry={() => setScenario("ready")}
        />
      </div>
      <ProductApprovalDialog
        approvals={approvals}
        facilityTypes={FACILITY_TYPES}
        onClose={close}
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
          close()
        }}
        productName="Male Condom"
        programs={PROGRAMS}
        readOnly={!canEdit}
        target={dialog?.kind === "approval" ? dialog.id : undefined}
      />
      <RemoveApprovalDialog
        approvalId={dialog?.kind === "remove" ? dialog.id : undefined}
        approvals={approvals}
        onClose={close}
        onConfirm={(id) => {
          setApprovals((current) => current.filter((item) => item.id !== id))
          close()
        }}
        productName="Male Condom"
      />
    </div>
  )
}
