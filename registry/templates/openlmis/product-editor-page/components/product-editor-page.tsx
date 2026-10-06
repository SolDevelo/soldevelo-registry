"use client"

import { PackageIcon } from "lucide-react"
import { type ReactNode, useCallback, useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import type { ColumnVisibilityState } from "@tanstack/react-table"
import {
  useColumnVisibility,
  useContainerSize,
} from "@/registry/blocks/openlmis/data-table/responsive-columns"
import {
  APPROVAL_HIDEABLE_COLUMNS,
  ApprovalsToolbar,
  FacilityApprovedProducts,
} from "./facility-approved-products/facility-approved-products"
import { RemoveApprovalDialog } from "./facility-approved-products/remove-approval-dialog"
import type {
  Approval,
  ApprovalValues,
} from "./product-approval-dialog/approval-form"
import { ProductApprovalDialog } from "./product-approval-dialog/product-approval-dialog"
import { type Product, productName } from "./product-general-form/product-form"
import { ProductGeneralForm } from "./product-general-form/product-general-form"
import type {
  KitChild,
  KitChildValues,
} from "./product-kit-unpack-list/kit-form"
import { ProductKitUnpackList } from "./product-kit-unpack-list/product-kit-unpack-list"
import { ProductProgramLinkDialog } from "./product-program-link-dialog/product-program-link-dialog"
import {
  type NamedOption,
  type ProgramLink,
  withoutProgramLink,
  withProgramLink,
} from "./product-program-link-dialog/program-link-form"
import {
  PROGRAM_LINK_HIDEABLE_COLUMNS,
  ProductProgramLinks,
  ProgramLinksToolbar,
} from "./product-program-links/product-program-links"
import { RemoveProgramLinkDialog } from "./product-program-links/remove-program-link-dialog"
import {
  Workspace,
  WorkspaceContent,
  WorkspaceDescription,
  WorkspaceFooter,
  WorkspaceHeader,
  WorkspaceHeading,
  WorkspaceIcon,
  WorkspaceTitle,
} from "@/registry/blocks/openlmis/workspace/workspace"
import { FormActions } from "@/registry/components/openlmis/form-actions/form-actions"
import { Callout } from "@/registry/components/openlmis/callout/callout"
import { DiscardChangesDialog } from "@/registry/components/openlmis/discard-changes-dialog/discard-changes-dialog"
import {
  WorkspaceTabs,
  WorkspaceTabsContent,
  WorkspaceTabsList,
  WorkspaceTabsTrigger,
} from "@/registry/components/openlmis/workspace-tabs/workspace-tabs"

import {
  MOCK_APPROVALS,
  MOCK_CATEGORIES,
  MOCK_FACILITY_TYPES,
  MOCK_KIT_CHILDREN,
  MOCK_LINKS,
  MOCK_PRODUCT,
  MOCK_PRODUCTS,
  MOCK_PROGRAMS,
} from "./mock-product"

const TABS = [
  { value: "general", label: "General" },
  { value: "programs", label: "Programs" },
  { value: "facility-types", label: "Facility Types" },
  { value: "kit-unpack-list", label: "Kit Unpack List" },
] as const

/** A tab, and the part of the product it saves. */
export type ProductTab = (typeof TABS)[number]["value"]

const FORM_IDS = {
  general: "product-general-form",
  kit: "kit-unpack-list-form",
} as const

const SAVE_ERROR = "Something went wrong. Check your connection and try again."

type ProductEditorPageProps = {
  /** Without it, every product tab is read only. */
  canEditProduct?: boolean
  /** Without it, the Facility Types tab is read only. */
  canEditApprovals?: boolean
  /** Saves in these tabs fail, to show how a failed save reads; nothing is sent anywhere. */
  failingSaves?: readonly ProductTab[]
  /** The tab shown first. */
  defaultTab?: ProductTab
  /** Leaves the page, e.g. back to the products list; asked first when there are unsaved changes. */
  onBack?: () => void
}

type OpenDialog =
  | { kind: "program" | "remove-program"; id: string }
  | { kind: "approval" | "remove-approval"; id: string }

const NO_ACTIONS = () => null
const NO_FAILURES: readonly ProductTab[] = []

/** Edit Product on mock data: General, Programs, Facility Types and Kit Unpack List, each saved on its own. */
export function ProductEditorPage({
  canEditProduct = true,
  canEditApprovals = true,
  failingSaves = NO_FAILURES,
  defaultTab = "general",
  onBack,
}: ProductEditorPageProps) {
  const [product, setProduct] = useState<Product>(MOCK_PRODUCT)
  const [links, setLinks] = useState<readonly ProgramLink[]>(MOCK_LINKS)
  const [approvals, setApprovals] =
    useState<readonly Approval[]>(MOCK_APPROVALS)
  const [kitChildren, setKitChildren] =
    useState<readonly KitChild[]>(MOCK_KIT_CHILDREN)
  const [tab, setTab] = useState<ProductTab>(defaultTab)
  const [changes, setChanges] = useState(0)
  // Where to go once unsaved changes are discarded: another tab, or out of the page.
  const [leaving, setLeaving] = useState<ProductTab | "back">()
  const [dialog, setDialog] = useState<OpenDialog>()
  const [error, setError] = useState<{ area: string; message: string }>()
  const [saved, setSaved] = useState<string>()
  // Bumped on discard, so a form left mounted starts again from the saved values.
  const [formKey, setFormKey] = useState(0)

  const name = productName(product)
  const fails = (area: ProductTab) => failingSaves.includes(area)
  const errorFor = (area: string) =>
    error?.area === area ? error.message : undefined
  const succeed = (message: string) => {
    setError(undefined)
    setSaved(message)
  }
  const fail = (area: string) => {
    setSaved(undefined)
    setError({ area, message: SAVE_ERROR })
  }
  const closeDialog = () => {
    setDialog(undefined)
    setError(undefined)
  }

  const go = (next: ProductTab | "back") => {
    setChanges(0)
    setFormKey((key) => key + 1)
    setError(undefined)
    setSaved(undefined)
    if (next === "back") onBack?.()
    else setTab(next)
  }
  const leave = (next: ProductTab | "back") => {
    if (changes > 0) setLeaving(next)
    else go(next)
  }

  const takenCodes = useMemo(
    () =>
      MOCK_PRODUCTS.filter((item) => item.id !== product.id).map(
        (item) => item.productCode
      ),
    [product.id]
  )
  const linkedPrograms = useMemo(() => {
    const linked = new Set(links.map((link) => link.programId))
    return MOCK_PROGRAMS.filter((program) => linked.has(program.id))
  }, [links])

  const onEditLink = useCallback(
    (id: string) => setDialog({ kind: "program", id }),
    []
  )
  const onRemoveLink = useCallback(
    (id: string) => setDialog({ kind: "remove-program", id }),
    []
  )
  const onEditApproval = useCallback(
    (id: string) => setDialog({ kind: "approval", id }),
    []
  )
  const onRemoveApproval = useCallback(
    (id: string) => setDialog({ kind: "remove-approval", id }),
    []
  )

  const saveLink = (link: ProgramLink) => {
    if (fails("programs")) return fail("program")
    const program = programName(link.programId)
    const added = !links.some((item) => item.programId === link.programId)
    setLinks((current) => withProgramLink(current, link))
    setDialog(undefined)
    succeed(
      added
        ? `${name} is now offered in ${program}.`
        : `Changes to ${program} for ${name} are saved.`
    )
  }
  const removeLink = (programId: string) => {
    if (fails("programs")) return fail("remove-program")
    setLinks((current) => withoutProgramLink(current, programId))
    setDialog(undefined)
    succeed(`${name} is no longer offered in ${programName(programId)}.`)
  }
  const saveApproval = (values: ApprovalValues, existing?: Approval) => {
    if (fails("facility-types")) return fail("approval")
    const facilityType = named(MOCK_FACILITY_TYPES, values.facilityTypeId)
    const program = named(MOCK_PROGRAMS, values.programId)
    const stock = {
      maxPeriodsOfStock: values.maxPeriodsOfStock,
      emergencyOrderPoint: values.emergencyOrderPoint,
      minPeriodsOfStock: values.minPeriodsOfStock,
    }
    setApprovals((current) =>
      existing
        ? current.map((item) =>
            item.id === existing.id ? { ...item, ...stock } : item
          )
        : [
            ...current,
            {
              ...stock,
              id: `${facilityType.id}-${program.id}`,
              facilityType,
              program,
            },
          ]
    )
    setDialog(undefined)
    succeed(
      existing
        ? `Changes to ${facilityType.name} in ${program.name} are saved.`
        : `Facilities of type ${facilityType.name} can now stock ${name} in ${program.name}.`
    )
  }
  const removeApproval = (id: string) => {
    if (fails("facility-types")) return fail("remove-approval")
    const removed = approvals.find((item) => item.id === id)
    setApprovals((current) => current.filter((item) => item.id !== id))
    setDialog(undefined)
    if (removed)
      succeed(
        `Facilities of type ${removed.facilityType.name} no longer stock ${name} in ${removed.program.name}.`
      )
  }
  const saveKit = (values: KitChildValues[]) => {
    if (fails("kit-unpack-list")) return fail("kit")
    const products = new Map(MOCK_PRODUCTS.map((item) => [item.id, item]))
    setKitChildren(
      values.flatMap(({ productId, quantity }) => {
        const kitProduct = products.get(productId)
        return kitProduct ? [{ product: kitProduct, quantity }] : []
      })
    )
    succeed(`The kit unpack list of ${name} is saved.`)
    onBack?.()
  }

  const back = <BackButton onClick={() => leave("back")} />
  const formFooter = (formId: string, saveLabel: string, readOnly: boolean) =>
    readOnly ? (
      back
    ) : (
      <FormActions
        actions={{
          formId,
          changed: changes > 0,
          pending: false,
          cancel: () => leave("back"),
        }}
        cancelDisabled={false}
        saveLabel={saveLabel}
      />
    )
  const footer: Record<ProductTab, ReactNode> = {
    general: formFooter(FORM_IDS.general, "Save Product", !canEditProduct),
    programs: back,
    "facility-types": back,
    "kit-unpack-list": formFooter(
      FORM_IDS.kit,
      "Save Kit Unpack List",
      !canEditProduct
    ),
  }

  return (
    // One column, so the bar sits under the page wherever this renders.
    <div className="flex w-full flex-1 flex-col">
      <Workspace>
        <WorkspaceHeader>
          <WorkspaceHeading>
            <WorkspaceIcon>
              <PackageIcon />
            </WorkspaceIcon>
            <WorkspaceTitle>Edit {name}</WorkspaceTitle>
            <WorkspaceDescription>
              Change the details of product {product.productCode}.
            </WorkspaceDescription>
          </WorkspaceHeading>
        </WorkspaceHeader>
        <WorkspaceContent>
          <WorkspaceTabs
            onValueChange={(next) => {
              if (next !== tab) leave(next as ProductTab)
            }}
            value={tab}
          >
            <WorkspaceTabsList label="Product Sections" wrap="grid">
              {TABS.map((item) => (
                <WorkspaceTabsTrigger key={item.value} value={item.value}>
                  {item.label}
                </WorkspaceTabsTrigger>
              ))}
            </WorkspaceTabsList>
            {saved && (
              <Callout title="Saved" tone="success">
                {saved}
              </Callout>
            )}
            <WorkspaceTabsContent value="general">
              {tab === "general" && (
                <ProductGeneralForm
                  key={formKey}
                  error={errorFor("general")}
                  formId={FORM_IDS.general}
                  onChangesChange={setChanges}
                  onSubmit={(values) => {
                    if (fails("general")) return fail("general")
                    const next = { ...product, ...values }
                    setProduct(next)
                    succeed(`Changes to ${productName(next)} are saved.`)
                    onBack?.()
                  }}
                  product={product}
                  readOnly={!canEditProduct}
                  renderActions={NO_ACTIONS}
                  takenCodes={takenCodes}
                />
              )}
            </WorkspaceTabsContent>
            <WorkspaceTabsContent value="programs">
              {tab === "programs" && (
                <ProgramsTab
                  canEdit={canEditProduct}
                  links={links}
                  onAdd={() => setDialog({ kind: "program", id: "new" })}
                  onEdit={onEditLink}
                  onRemove={onRemoveLink}
                />
              )}
            </WorkspaceTabsContent>
            <WorkspaceTabsContent value="facility-types">
              {tab === "facility-types" && (
                <FacilityTypesTab
                  approvals={approvals}
                  canEdit={canEditApprovals}
                  onAdd={() => setDialog({ kind: "approval", id: "new" })}
                  onEdit={onEditApproval}
                  onRemove={onRemoveApproval}
                />
              )}
            </WorkspaceTabsContent>
            <WorkspaceTabsContent value="kit-unpack-list">
              {tab === "kit-unpack-list" && (
                <ProductKitUnpackList
                  key={formKey}
                  error={errorFor("kit")}
                  formId={FORM_IDS.kit}
                  kitChildren={kitChildren}
                  kitId={product.id}
                  onChangesChange={setChanges}
                  onSubmit={saveKit}
                  products={MOCK_PRODUCTS}
                  readOnly={!canEditProduct}
                  renderActions={NO_ACTIONS}
                />
              )}
            </WorkspaceTabsContent>
          </WorkspaceTabs>
        </WorkspaceContent>
      </Workspace>
      <WorkspaceFooter>{footer[tab]}</WorkspaceFooter>

      <ProductProgramLinkDialog
        categories={MOCK_CATEGORIES}
        error={errorFor("program")}
        links={links}
        onClose={closeDialog}
        onSubmit={saveLink}
        productName={name}
        programs={MOCK_PROGRAMS}
        readOnly={!canEditProduct}
        target={dialog?.kind === "program" ? dialog.id : undefined}
      />
      <RemoveProgramLinkDialog
        error={errorFor("remove-program")}
        links={links}
        onClose={closeDialog}
        onConfirm={removeLink}
        productName={name}
        programId={
          canEditProduct && dialog?.kind === "remove-program"
            ? dialog.id
            : undefined
        }
        programs={MOCK_PROGRAMS}
      />
      <ProductApprovalDialog
        approvals={approvals}
        error={errorFor("approval")}
        facilityTypes={MOCK_FACILITY_TYPES}
        onClose={closeDialog}
        onSubmit={saveApproval}
        productName={name}
        programs={linkedPrograms}
        readOnly={!canEditApprovals}
        target={dialog?.kind === "approval" ? dialog.id : undefined}
      />
      <RemoveApprovalDialog
        approvalId={
          canEditApprovals && dialog?.kind === "remove-approval"
            ? dialog.id
            : undefined
        }
        approvals={approvals}
        error={errorFor("remove-approval")}
        onClose={closeDialog}
        onConfirm={removeApproval}
        productName={name}
      />
      <DiscardChangesDialog
        changes={changes}
        onDiscard={() => {
          if (leaving) go(leaving)
          setLeaving(undefined)
        }}
        onKeepEditing={() => setLeaving(undefined)}
        open={leaving !== undefined}
        subject={tab === "kit-unpack-list" ? "the kit unpack list" : name}
      />
    </div>
  )
}

const named = (options: readonly NamedOption[], id: string) =>
  options.find((option) => option.id === id) ?? { id, name: id }

const programName = (id: string) => named(MOCK_PROGRAMS, id).name

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <Button onClick={onClick} size="lg" variant="outline">
      Back To Products
    </Button>
  )
}

/** Each table tab measures its own room, so its columns fit before the user picks any. */
function useTabColumns(columns: Parameters<typeof useColumnVisibility>[0]) {
  const [choices, setChoices] = useState<ColumnVisibilityState>({})
  const [measure, size] = useContainerSize<HTMLDivElement>()
  return {
    measure,
    ...useColumnVisibility(columns, [choices, setChoices], size),
  }
}

type TableTabProps = {
  canEdit: boolean
  onAdd: () => void
  onEdit: (id: string) => void
  onRemove: (id: string) => void
}

function ProgramsTab({
  links,
  canEdit,
  onAdd,
  onEdit,
  onRemove,
}: TableTabProps & { links: readonly ProgramLink[] }) {
  const { measure, visibility, onReset, onVisibilityChange } = useTabColumns(
    PROGRAM_LINK_HIDEABLE_COLUMNS
  )
  return (
    <div className="flex flex-col gap-4" ref={measure}>
      <ProgramLinksToolbar
        columnVisibility={visibility}
        onAdd={canEdit ? onAdd : undefined}
        onColumnReset={onReset}
        onColumnVisibilityChange={onVisibilityChange}
      />
      <section aria-label="Programs">
        <ProductProgramLinks
          canEdit={canEdit}
          categories={MOCK_CATEGORIES}
          columnVisibility={visibility}
          links={links}
          onEdit={onEdit}
          onRemove={onRemove}
          programs={MOCK_PROGRAMS}
        />
      </section>
    </div>
  )
}

function FacilityTypesTab({
  approvals,
  canEdit,
  onAdd,
  onEdit,
  onRemove,
}: TableTabProps & { approvals: readonly Approval[] }) {
  const { measure, visibility, onReset, onVisibilityChange } = useTabColumns(
    APPROVAL_HIDEABLE_COLUMNS
  )
  return (
    <div className="flex flex-col gap-4" ref={measure}>
      <ApprovalsToolbar
        columnVisibility={visibility}
        onAdd={canEdit ? onAdd : undefined}
        onColumnReset={onReset}
        onColumnVisibilityChange={onVisibilityChange}
      />
      <section aria-label="Facility Types">
        <FacilityApprovedProducts
          approvals={approvals}
          canEdit={canEdit}
          columnVisibility={visibility}
          onEdit={onEdit}
          onRemove={onRemove}
        />
      </section>
    </div>
  )
}
