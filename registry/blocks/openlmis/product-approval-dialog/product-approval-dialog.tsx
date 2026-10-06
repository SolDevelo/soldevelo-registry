"use client"

import { revalidateLogic } from "@tanstack/react-form"
import { type ReactNode, useMemo } from "react"

import { FieldGroup } from "@/components/ui/field"
import type { NamedOption } from "@/registry/blocks/openlmis/product-program-link-dialog/program-link-form"
import {
  FormDialog,
  FormDialogBody,
  FormDialogCancel,
  FormDialogDescription,
  FormDialogError,
  FormDialogFooter,
  FormDialogForm,
  FormDialogHeader,
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
  type Approval,
  approvalFormSchema,
  type ApprovalValues,
  EMPTY_APPROVAL_FORM,
  toApprovalFormValues,
  toApprovalValues,
} from "./approval-form"

/** `"new"` adds a facility type; an approval id edits, or views, that approval. */
export type ApprovalDialogTarget = "new" | (string & {})

type ProductApprovalDialogProps = {
  /** Opens the dialog while set. */
  target: ApprovalDialogTarget | undefined
  productName: string
  /** The product's approvals; the form shows a skeleton until they are set. */
  approvals: readonly Approval[] | undefined
  /** Every facility type; the form shows a skeleton until they are set. */
  facilityTypes: readonly NamedOption[] | undefined
  /** The programs the product is in, the only ones it can be approved for. */
  programs: readonly NamedOption[] | undefined
  /** Shows the approval without letting it change. */
  readOnly?: boolean
  /** Called with the values to save; save them, then clear `target`. */
  onSubmit: (values: ApprovalValues, existing?: Approval) => void
  /** Keeps the dialog open and spins the submit while the save runs. */
  pending?: boolean
  /** Shown above the fields, e.g. why the save failed; what was typed stays. */
  error?: ReactNode
  onClose: () => void
}

/** Let a type of facility stock the product in a program, or change how much it keeps. */
export function ProductApprovalDialog({
  target,
  pending = false,
  onClose,
  ...props
}: ProductApprovalDialogProps) {
  const { shown, dialogProps } = useDialogTarget(target, onClose)

  return (
    <FormDialog {...dialogProps(pending)}>
      {shown !== undefined && (
        <ApprovalContent
          key={shown}
          pending={pending}
          target={shown}
          {...props}
        />
      )}
    </FormDialog>
  )
}

type ContentProps = Omit<ProductApprovalDialogProps, "target" | "onClose"> & {
  target: ApprovalDialogTarget
  pending: boolean
}

function ApprovalContent({
  target,
  approvals,
  facilityTypes,
  programs,
  readOnly = false,
  ...props
}: ContentProps) {
  const adding = target === "new"
  const title = adding ? "Add Facility Type" : "Facility Type"

  if (!approvals || !facilityTypes || !programs) {
    return (
      <ApprovalSkeleton adding={adding} readOnly={readOnly} title={title} />
    )
  }
  const approval = approvals.find((item) => item.id === target)
  if (!adding && !approval) {
    return (
      <>
        <FormDialogHeader>
          <FormDialogTitle>{title}</FormDialogTitle>
          <FormDialogDescription>
            This facility type no longer stocks the product.
          </FormDialogDescription>
        </FormDialogHeader>
        <FormDialogFooter>
          <FormDialogCancel>Close</FormDialogCancel>
        </FormDialogFooter>
      </>
    )
  }
  return (
    <ApprovalForm
      approval={approval}
      approvals={approvals}
      facilityTypes={facilityTypes}
      programs={programs}
      readOnly={readOnly}
      {...props}
    />
  )
}

type ApprovalFormProps = Omit<
  ContentProps,
  "target" | "approvals" | "facilityTypes" | "programs"
> & {
  approval: Approval | undefined
  approvals: readonly Approval[]
  facilityTypes: readonly NamedOption[]
  programs: readonly NamedOption[]
  readOnly: boolean
}

const byLabel = (a: { label: string }, b: { label: string }) =>
  a.label.localeCompare(b.label)

function ApprovalForm({
  approval,
  approvals,
  facilityTypes,
  programs,
  productName,
  readOnly,
  onSubmit,
  pending,
  error,
}: ApprovalFormProps) {
  const schema = useMemo(
    () => approvalFormSchema(approvals, approval?.id),
    [approvals, approval]
  )
  const facilityTypeItems = useMemo(
    () =>
      facilityTypes
        .map((type) => ({ value: type.id, label: type.name }))
        // oxlint-disable-next-line unicorn/no-array-sort -- sorts a fresh array; toSorted needs the ES2023 lib
        .sort(byLabel),
    [facilityTypes]
  )
  const programItems = useMemo(() => {
    const items = programs.map((program) => ({
      value: program.id,
      label: program.name,
    }))
    // An approval for a program the product has since left still shows its program.
    if (approval && !items.some((item) => item.value === approval.program.id)) {
      items.push({ value: approval.program.id, label: approval.program.name })
    }
    // oxlint-disable-next-line unicorn/no-array-sort -- sorts a fresh array; toSorted needs the ES2023 lib
    return items.sort(byLabel)
  }, [programs, approval])

  const form = useAppForm({
    defaultValues: approval
      ? toApprovalFormValues(approval)
      : EMPTY_APPROVAL_FORM,
    // Quiet until the first submit, then each field re-checks as it is corrected.
    validationLogic: revalidateLogic({
      mode: "submit",
      modeAfterSubmission: "change",
    }),
    validators: { onDynamic: schema },
    onSubmit: ({ value }) => onSubmit(toApprovalValues(value), approval),
  })

  const facilityType = approval?.facilityType.name
  const title = !approval
    ? "Add Facility Type"
    : readOnly
      ? (facilityType ?? "")
      : `Edit ${facilityType}`

  return (
    <FormDialogForm onSubmit={() => void form.handleSubmit()}>
      <FormDialogHeader>
        <FormDialogTitle>{title}</FormDialogTitle>
        <FormDialogDescription>
          {approval
            ? `How much ${productName} facilities of type ${facilityType} keep for ${approval.program.name}.`
            : `Let a type of facility stock ${productName} in one of its programs.`}
        </FormDialogDescription>
      </FormDialogHeader>
      <FormDialogBody>
        <FieldGroup>
          {error && (
            <FormDialogError
              description={error}
              title="Could Not Save Facility Type"
            />
          )}
          <form.AppField name="facilityTypeId">
            {(field) => (
              <field.ComboboxField
                clearLabel="Clear Facility Type"
                description={
                  approval && !readOnly
                    ? "The facility type and program stay as they are; remove this one and add another to change them."
                    : undefined
                }
                disabled={Boolean(approval)}
                emptyMessage="No facility types match."
                items={facilityTypeItems}
                label="Facility Type"
                placeholder="Choose A Facility Type"
                required
              />
            )}
          </form.AppField>
          <form.AppField name="programId">
            {(field) => (
              <field.ComboboxField
                clearLabel="Clear Program"
                description={
                  approval ? undefined : "Only the programs the product is in."
                }
                disabled={Boolean(approval)}
                emptyMessage="Add the product to a program first."
                items={programItems}
                label="Program"
                placeholder="Choose A Program"
                required
              />
            )}
          </form.AppField>
          <form.AppField name="maxPeriodsOfStock">
            {(field) => (
              <field.DecimalField
                description="The most stock a facility keeps, in periods of use."
                disabled={readOnly}
                label="Max Periods Of Stock"
                required
              />
            )}
          </form.AppField>
          <div className="grid gap-5 @md/field-group:grid-cols-2">
            <form.AppField name="emergencyOrderPoint">
              {(field) => (
                <field.DecimalField
                  description="Stock, in periods, below which a facility orders at once."
                  disabled={readOnly}
                  label="Emergency Order Point"
                />
              )}
            </form.AppField>
            <form.AppField name="minPeriodsOfStock">
              {(field) => (
                <field.DecimalField
                  description="The least stock a facility keeps, in periods of use."
                  disabled={readOnly}
                  label="Min Periods Of Stock"
                />
              )}
            </form.AppField>
          </div>
        </FieldGroup>
      </FormDialogBody>
      <FormDialogFooter>
        <FormDialogCancel disabled={pending}>
          {readOnly ? "Close" : "Cancel"}
        </FormDialogCancel>
        {!readOnly && (
          <FormDialogSubmit pending={pending}>
            {approval ? "Save" : "Add Facility Type"}
          </FormDialogSubmit>
        )}
      </FormDialogFooter>
    </FormDialogForm>
  )
}

type ApprovalSkeletonProps = {
  title: string
  adding: boolean
  readOnly: boolean
}

/** The form as it will look, so nothing moves when its choices arrive. */
function ApprovalSkeleton({ title, adding, readOnly }: ApprovalSkeletonProps) {
  return (
    <>
      <FormDialogHeader>
        <FormDialogTitle>{title}</FormDialogTitle>
        <SkeletonLine />
      </FormDialogHeader>
      <FormDialogBody>
        <div aria-busy>
          <FieldGroup>
            <FieldSkeleton label="Facility Type" required />
            <FieldSkeleton label="Program" required />
            <FieldSkeleton label="Max Periods Of Stock" required />
            <div className="grid gap-5 @md/field-group:grid-cols-2">
              <FieldSkeleton label="Emergency Order Point" />
              <FieldSkeleton label="Min Periods Of Stock" />
            </div>
          </FieldGroup>
        </div>
      </FormDialogBody>
      <FormDialogFooter>
        <FormDialogCancel>{readOnly ? "Close" : "Cancel"}</FormDialogCancel>
        {!readOnly && (
          <FormDialogSubmit disabled>
            {adding ? "Add Facility Type" : "Save"}
          </FormDialogSubmit>
        )}
      </FormDialogFooter>
    </>
  )
}
