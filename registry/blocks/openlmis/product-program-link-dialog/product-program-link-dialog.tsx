"use client"

import { revalidateLogic } from "@tanstack/react-form"
import { type ReactNode, useMemo, useState } from "react"

import { FieldGroup } from "@/components/ui/field"
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
  ChoiceCardSkeleton,
  FieldSkeleton,
  SkeletonLine,
} from "@/registry/components/openlmis/form-fields/form-fields"

import {
  EMPTY_PROGRAM_LINK_FORM,
  type NamedOption,
  type ProgramLink,
  programLinkFormSchema,
  toProgramLink,
  toProgramLinkFormValues,
  unlinkedPrograms,
} from "./program-link-form"

/** `"new"` adds a program; a program id edits, or views, that link. */
export type ProgramLinkDialogTarget = "new" | (string & {})

type ProductProgramLinkDialogProps = {
  /** Opens the dialog while set. */
  target: ProgramLinkDialogTarget | undefined
  /** The product's name, for the description. */
  productName: string
  /** The product's links, so Add offers only programs it is not in yet. */
  links: readonly ProgramLink[]
  /** Every program; the form shows a skeleton until they are set. */
  programs: readonly NamedOption[] | undefined
  categories: readonly NamedOption[] | undefined
  /** Shows the link without letting it change. */
  readOnly?: boolean
  /** Called with the link as it should be saved; save it, then clear `target`. */
  onSubmit: (link: ProgramLink) => void
  /** Keeps the dialog open and spins the submit while the save runs. */
  pending?: boolean
  /** Shown above the fields, e.g. why the save failed; what was typed stays. */
  error?: ReactNode
  onClose: () => void
}

/** Add a product to a program, or edit how it is offered in one. */
export function ProductProgramLinkDialog({
  target,
  pending = false,
  onClose,
  ...props
}: ProductProgramLinkDialogProps) {
  const { shown, dialogProps } = useDialogTarget(target, onClose)

  return (
    <FormDialog {...dialogProps(pending)}>
      {shown !== undefined && (
        <ProgramLinkContent
          key={shown}
          pending={pending}
          target={shown}
          {...props}
        />
      )}
    </FormDialog>
  )
}

type ContentProps = Omit<
  ProductProgramLinkDialogProps,
  "target" | "onClose"
> & {
  target: ProgramLinkDialogTarget
  pending: boolean
}

function ProgramLinkContent({
  target,
  links,
  programs,
  categories,
  readOnly = false,
  ...props
}: ContentProps) {
  const adding = target === "new"
  const link = links.find((item) => item.programId === target)

  if (!adding && !link) {
    return (
      <>
        <FormDialogHeader>
          <FormDialogTitle>Program</FormDialogTitle>
          <FormDialogDescription>
            This program is no longer linked to the product.
          </FormDialogDescription>
        </FormDialogHeader>
        <FormDialogFooter>
          <FormDialogCancel>Close</FormDialogCancel>
        </FormDialogFooter>
      </>
    )
  }
  if (!programs || !categories) {
    return (
      <ProgramLinkSkeleton
        adding={adding}
        readOnly={readOnly}
        title={adding ? "Add Program" : "Program"}
      />
    )
  }
  return (
    <ProgramLinkForm
      categories={categories}
      link={link}
      links={links}
      programs={programs}
      readOnly={readOnly}
      {...props}
    />
  )
}

type ProgramLinkFormProps = Omit<
  ContentProps,
  "target" | "programs" | "categories"
> & {
  link: ProgramLink | undefined
  programs: readonly NamedOption[]
  categories: readonly NamedOption[]
  readOnly: boolean
}

function ProgramLinkForm({
  link,
  links,
  programs,
  categories,
  productName,
  readOnly,
  onSubmit,
  pending,
  error,
}: ProgramLinkFormProps) {
  // The choices as the dialog opened, so a program just added never drops out of its own list.
  const [linksAtOpen] = useState(links)
  const programItems = useMemo(
    () =>
      unlinkedPrograms(programs, linksAtOpen).map((program) => ({
        value: program.id,
        label: program.name,
      })),
    [programs, linksAtOpen]
  )
  const categoryItems = useMemo(
    () =>
      categories.map((category) => ({
        value: category.id,
        label: category.name,
      })),
    [categories]
  )
  const linkedName = link
    ? (programs.find((program) => program.id === link.programId)?.name ??
      link.programId)
    : undefined

  const form = useAppForm({
    defaultValues: link
      ? toProgramLinkFormValues(link)
      : EMPTY_PROGRAM_LINK_FORM,
    // Quiet until the first submit, then each field re-checks as it is corrected.
    validationLogic: revalidateLogic({
      mode: "submit",
      modeAfterSubmission: "change",
    }),
    validators: { onDynamic: programLinkFormSchema },
    onSubmit: ({ value }) => onSubmit(toProgramLink(value, link)),
  })

  const title = !link
    ? "Add Program"
    : readOnly
      ? (linkedName ?? "")
      : `Edit ${linkedName}`
  const description = !link
    ? `Offer ${productName} in another program.`
    : readOnly
      ? `How ${productName} is offered in this program.`
      : `Change how ${productName} is offered in this program.`

  return (
    <FormDialogForm onSubmit={() => void form.handleSubmit()}>
      <FormDialogHeader>
        <FormDialogTitle>{title}</FormDialogTitle>
        <FormDialogDescription>{description}</FormDialogDescription>
      </FormDialogHeader>
      <FormDialogBody>
        <FieldGroup>
          {error && (
            <FormDialogError
              description={error}
              title="Could Not Save Program"
            />
          )}
          {!link && (
            <form.AppField name="programId">
              {(field) => (
                <field.ComboboxField
                  clearLabel="Clear Program"
                  emptyMessage="No programs left to add."
                  items={programItems}
                  label="Program"
                  placeholder="Choose A Program"
                  required
                />
              )}
            </form.AppField>
          )}
          <form.AppField name="categoryId">
            {(field) => (
              <field.ComboboxField
                clearLabel="Clear Category"
                description="Groups the product with others like it on requisitions."
                disabled={readOnly}
                emptyMessage="No categories match."
                items={categoryItems}
                label="Orderable Display Category"
                placeholder="Choose A Category"
                required
              />
            )}
          </form.AppField>
          <div className="grid gap-5 @md/field-group:grid-cols-2">
            <form.AppField name="dosesPerPatient">
              {(field) => (
                <field.NumberField
                  disabled={readOnly}
                  label="Doses Per Patient"
                />
              )}
            </form.AppField>
            <form.AppField name="displayOrder">
              {(field) => (
                <field.NumberField
                  description="Where the product appears within its category."
                  disabled={readOnly}
                  label="Display Order"
                />
              )}
            </form.AppField>
          </div>
          <form.AppField name="pricePerPack">
            {(field) => (
              <field.DecimalField disabled={readOnly} label="Price Per Pack" />
            )}
          </form.AppField>
          <form.AppField name="fullSupply">
            {(field) => (
              <field.SwitchField
                description="Listed on every requisition for the program. Off, it is added to a requisition only when asked for."
                disabled={readOnly}
                label="Full Supply"
              />
            )}
          </form.AppField>
        </FieldGroup>
      </FormDialogBody>
      <FormDialogFooter>
        <FormDialogCancel disabled={pending}>
          {readOnly ? "Close" : "Cancel"}
        </FormDialogCancel>
        {!readOnly && (
          <FormDialogSubmit pending={pending}>
            {link ? "Save" : "Add Program"}
          </FormDialogSubmit>
        )}
      </FormDialogFooter>
    </FormDialogForm>
  )
}

type ProgramLinkSkeletonProps = {
  title: string
  adding: boolean
  readOnly: boolean
}

/** The form as it will look, so nothing moves when the programs arrive. */
function ProgramLinkSkeleton({
  title,
  adding,
  readOnly,
}: ProgramLinkSkeletonProps) {
  return (
    <>
      <FormDialogHeader>
        <FormDialogTitle>{title}</FormDialogTitle>
        <SkeletonLine />
      </FormDialogHeader>
      <FormDialogBody>
        <div aria-busy>
          <FieldGroup>
            {adding && <FieldSkeleton label="Program" required />}
            <FieldSkeleton label="Orderable Display Category" required />
            <div className="grid gap-5 @md/field-group:grid-cols-2">
              <FieldSkeleton label="Doses Per Patient" />
              <FieldSkeleton label="Display Order" />
            </div>
            <FieldSkeleton label="Price Per Pack" />
            <ChoiceCardSkeleton label="Full Supply" />
          </FieldGroup>
        </div>
      </FormDialogBody>
      <FormDialogFooter>
        <FormDialogCancel>{readOnly ? "Close" : "Cancel"}</FormDialogCancel>
        {!readOnly && (
          <FormDialogSubmit disabled>
            {adding ? "Add Program" : "Save"}
          </FormDialogSubmit>
        )}
      </FormDialogFooter>
    </>
  )
}
