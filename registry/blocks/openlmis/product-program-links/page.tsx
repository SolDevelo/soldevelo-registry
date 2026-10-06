"use client"

import { useCallback, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  useColumnVisibility,
  useContainerSize,
} from "@/registry/blocks/openlmis/data-table/responsive-columns"
import { ProductProgramLinkDialog } from "@/registry/blocks/openlmis/product-program-link-dialog/product-program-link-dialog"
import {
  type NamedOption,
  type ProgramLink,
  withoutProgramLink,
  withProgramLink,
} from "@/registry/blocks/openlmis/product-program-link-dialog/program-link-form"

import {
  PROGRAM_LINK_HIDEABLE_COLUMNS,
  ProductProgramLinks,
  ProgramLinksToolbar,
} from "./product-program-links"
import { RemoveProgramLinkDialog } from "./remove-program-link-dialog"

const PROGRAMS: NamedOption[] = [
  { id: "family-planning", name: "Family Planning" },
  { id: "essential-meds", name: "Essential Meds" },
  { id: "new-program", name: "New Program" },
  { id: "epi", name: "EPI" },
]

const CATEGORIES: NamedOption[] = [
  { id: "contraceptives", name: "Contraceptives" },
  { id: "analgesics", name: "Analgesics" },
]

const LINKS: ProgramLink[] = [
  {
    programId: "family-planning",
    categoryId: "contraceptives",
    fullSupply: true,
    dosesPerPatient: 1,
    displayOrder: 2,
    pricePerPack: 4.5,
  },
  {
    programId: "essential-meds",
    categoryId: "analgesics",
    fullSupply: false,
    dosesPerPatient: null,
    displayOrder: 1,
    pricePerPack: null,
  },
  {
    programId: "new-program",
    categoryId: null,
    active: false,
    fullSupply: true,
    dosesPerPatient: null,
    displayOrder: null,
    pricePerPack: 12,
  },
]

type Scenario = "ready" | "read-only" | "empty" | "loading" | "error"

const SCENARIOS: { value: Scenario; label: string }[] = [
  { value: "ready", label: "Ready" },
  { value: "read-only", label: "Read Only" },
  { value: "empty", label: "Empty" },
  { value: "loading", label: "Loading" },
  { value: "error", label: "Load Failed" },
]

type OpenDialog = { kind: "link" | "remove"; programId: string }

export default function Page() {
  const [links, setLinks] = useState(LINKS)
  const [scenario, setScenario] = useState<Scenario>("ready")
  const [dialog, setDialog] = useState<OpenDialog>()
  const [choices, setChoices] = useState({})
  const [measure, size] = useContainerSize<HTMLDivElement>()
  const columns = useColumnVisibility(
    PROGRAM_LINK_HIDEABLE_COLUMNS,
    [choices, setChoices],
    size
  )
  const canEdit = scenario !== "read-only"
  const shown =
    scenario === "loading" ? undefined : scenario === "empty" ? [] : links
  const onEdit = useCallback(
    (programId: string) => setDialog({ kind: "link", programId }),
    []
  )
  const onRemove = useCallback(
    (programId: string) => setDialog({ kind: "remove", programId }),
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
        <ProgramLinksToolbar
          columnVisibility={columns.visibility}
          onAdd={
            canEdit
              ? () => setDialog({ kind: "link", programId: "new" })
              : undefined
          }
          onColumnReset={columns.onReset}
          onColumnVisibilityChange={columns.onVisibilityChange}
        />
        <ProductProgramLinks
          canEdit={canEdit}
          categories={CATEGORIES}
          columnVisibility={columns.visibility}
          error={scenario === "error" ? "Could Not Load Programs" : undefined}
          links={shown}
          onEdit={onEdit}
          onRemove={onRemove}
          onRetry={() => setScenario("ready")}
          programs={PROGRAMS}
        />
      </div>
      <ProductProgramLinkDialog
        categories={CATEGORIES}
        links={links}
        onClose={close}
        onSubmit={(link) => {
          setLinks((current) => withProgramLink(current, link))
          close()
        }}
        productName="Male Condom"
        programs={PROGRAMS}
        readOnly={!canEdit}
        target={dialog?.kind === "link" ? dialog.programId : undefined}
      />
      <RemoveProgramLinkDialog
        links={links}
        onClose={close}
        onConfirm={(programId) => {
          setLinks((current) => withoutProgramLink(current, programId))
          close()
        }}
        productName="Male Condom"
        programId={dialog?.kind === "remove" ? dialog.programId : undefined}
        programs={PROGRAMS}
      />
    </div>
  )
}
