"use client"

import { revalidateLogic } from "@tanstack/react-form"
import { type ReactNode, useEffect, useMemo, useRef } from "react"

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
  FormDialogLoadError,
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
  EMPTY_PROGRAM_FORM,
  type Program,
  type ProgramFormValues,
  programFormSchema,
  toProgramFormValues,
} from "./program-form"

type SwitchName = {
  [K in keyof ProgramFormValues]: ProgramFormValues[K] extends boolean
    ? K
    : never
}[keyof ProgramFormValues]

const SWITCHES: readonly {
  name: SwitchName
  label: string
  description?: string
}[] = [
  { name: "active", label: "Active" },
  {
    name: "showNonFullSupplyTab",
    label: "Display Non-Full Supply Tab",
    description:
      "Enable the Non-Full Supply tab for this program's requisition form.",
  },
  {
    name: "periodsSkippable",
    label: "Allow Skipping Periods",
    description: "Enable skipping periods for this program's requisition form.",
  },
  {
    name: "skipAuthorization",
    label: "Skip Authorization Step",
    description:
      "When selected, requisitions from this program will not go through authorization.",
  },
  {
    name: "enableDatePhysicalStockCountCompleted",
    label: "Enable Field For Date Physical Stock Count Completed",
    description:
      "Require users to enter this date when a requisition is submitted; the date can be edited when a requisition is authorized.",
  },
]

const NO_CODES: readonly string[] = []

/** `new` to add a program, or the id of the program to edit. */
export type ProgramFormDialogTarget = "new" | (string & {})

type ProgramFormDialogProps = {
  /** Opens the dialog while set. */
  target: ProgramFormDialogTarget | undefined
  /** The program being edited; a skeleton shows until it is set. */
  program?: Program | undefined
  /** Codes already taken, refused for a new program; include any the server refused. */
  takenCodes?: readonly string[]
  /** The program to edit no longer exists. */
  notFound?: boolean
  /** Loading the program failed; shows the error with Try Again. */
  onRetry?: (() => void) | undefined
  /** Called with the values; save them, then clear `target` to close. */
  onSubmit: (values: ProgramFormValues, program: Program | undefined) => void
  /** Keeps the dialog open and shows a spinner while the program is saved. */
  pending?: boolean
  /** Shown above the fields, e.g. why the save failed. */
  error?: ReactNode
  onClose: () => void
}

export function ProgramFormDialog({
  target,
  program,
  takenCodes = NO_CODES,
  notFound = false,
  onRetry,
  onSubmit,
  pending = false,
  error,
  onClose,
}: ProgramFormDialogProps) {
  const { shown, dialogProps } = useDialogTarget(target, onClose)
  const isNew = shown === "new"
  const title = isNew ? "Add Program" : "Edit Program"
  const submitLabel = isNew ? "Add Program" : "Save"

  return (
    <FormDialog {...dialogProps(pending)}>
      {shown &&
        (isNew ? (
          <ProgramForm
            error={error}
            key="new"
            onSubmit={onSubmit}
            pending={pending}
            takenCodes={takenCodes}
          />
        ) : notFound ? (
          <>
            <FormDialogHeader>
              <FormDialogTitle>{title}</FormDialogTitle>
              <FormDialogDescription>
                This program no longer exists.
              </FormDialogDescription>
            </FormDialogHeader>
            <FormDialogFooter>
              <FormDialogCancel>Close</FormDialogCancel>
            </FormDialogFooter>
          </>
        ) : onRetry ? (
          <FormDialogLoadError
            errorTitle="Could Not Load Program"
            onRetry={onRetry}
            title={title}
          />
        ) : program === undefined ? (
          <ProgramFormSkeleton submitLabel={submitLabel} title={title} />
        ) : (
          <ProgramForm
            error={error}
            // Keyed, so opening another program starts a fresh form.
            key={program.id}
            onSubmit={onSubmit}
            pending={pending}
            program={program}
            takenCodes={takenCodes}
          />
        ))}
    </FormDialog>
  )
}

type ProgramFormProps = Pick<
  ProgramFormDialogProps,
  "program" | "onSubmit" | "error"
> & {
  takenCodes: readonly string[]
  pending: boolean
}

function ProgramForm({
  program,
  takenCodes,
  onSubmit,
  pending,
  error,
}: ProgramFormProps) {
  // Keyed on the codes themselves, so an equal array passed inline does not rebuild or re-check.
  // A saved program's code is locked, so only a new one is checked against the others.
  const codesKey = program ? "[]" : JSON.stringify(takenCodes)
  const schema = useMemo(
    () => programFormSchema(JSON.parse(codesKey) as string[]),
    [codesKey]
  )
  const checkedKey = useRef(codesKey)

  const form = useAppForm({
    defaultValues: program ? toProgramFormValues(program) : EMPTY_PROGRAM_FORM,
    // Quiet until the first submit, then each field re-checks as it is corrected.
    validationLogic: revalidateLogic({
      mode: "submit",
      modeAfterSubmission: "change",
    }),
    validators: { onDynamic: schema },
    onSubmit: ({ value }) => onSubmit(value, program),
  })

  // A code the server just refused shows its error at once, without another submit.
  useEffect(() => {
    if (checkedKey.current === codesKey) return
    checkedKey.current = codesKey
    void form.validate("change")
  }, [codesKey, form])

  return (
    <FormDialogForm onSubmit={form.handleSubmit}>
      <FormDialogHeader>
        <FormDialogTitle>
          {program ? "Edit Program" : "Add Program"}
        </FormDialogTitle>
        <FormDialogDescription>
          Changes are effective immediately.
        </FormDialogDescription>
      </FormDialogHeader>
      <FormDialogBody>
        <FieldGroup>
          {error && (
            <FormDialogError
              description={error}
              title="Could Not Save Program"
            />
          )}
          <form.AppField name="code">
            {(field) => (
              <field.TextField
                autoComplete="off"
                description={
                  program
                    ? "The code can't be changed once the program exists."
                    : undefined
                }
                dir="ltr"
                disabled={Boolean(program)}
                label="Program Code"
                required
              />
            )}
          </form.AppField>
          <form.AppField name="name">
            {(field) => (
              <field.TextField
                autoComplete="off"
                label="Program Name"
                required
              />
            )}
          </form.AppField>
          <form.AppField name="description">
            {(field) => <field.TextareaField label="Description" />}
          </form.AppField>
          {SWITCHES.map((setting) => (
            <form.AppField key={setting.name} name={setting.name}>
              {(field) => (
                <field.SwitchField
                  description={setting.description}
                  label={setting.label}
                />
              )}
            </form.AppField>
          ))}
        </FieldGroup>
      </FormDialogBody>
      <FormDialogFooter>
        <FormDialogCancel disabled={pending} />
        <FormDialogSubmit pending={pending}>
          {program ? "Save" : "Add Program"}
        </FormDialogSubmit>
      </FormDialogFooter>
    </FormDialogForm>
  )
}

/** A switch row whose value is still loading, laid out like `SwitchField`. */
function SwitchSkeleton() {
  return (
    <div
      aria-hidden
      className="flex min-h-8 items-center justify-between gap-3"
    >
      <SkeletonLine width="short" />
      {/* A plain element, since Skeleton owns its corner radius and a switch is round. */}
      <div className="h-4.5 w-8 shrink-0 animate-pulse rounded-full bg-muted" />
    </div>
  )
}

/** Laid out like the form, so nothing moves when the program arrives. */
function ProgramFormSkeleton({
  title,
  submitLabel,
}: {
  title: string
  submitLabel: string
}) {
  return (
    <>
      <FormDialogHeader>
        <FormDialogTitle>{title}</FormDialogTitle>
        <SkeletonLine />
      </FormDialogHeader>
      <FormDialogBody>
        <div aria-busy>
          <FieldGroup>
            <FieldSkeleton label="Program Code" required />
            <FieldSkeleton label="Program Name" required />
            <FieldSkeleton label="Description" />
            {SWITCHES.map((setting) => (
              <SwitchSkeleton key={setting.name} />
            ))}
          </FieldGroup>
        </div>
      </FormDialogBody>
      <FormDialogFooter>
        <FormDialogCancel />
        <FormDialogSubmit disabled>{submitLabel}</FormDialogSubmit>
      </FormDialogFooter>
    </>
  )
}
