"use client"

import { revalidateLogic } from "@tanstack/react-form"
import { BuildingIcon, UsersIcon } from "lucide-react"
import { useMemo } from "react"

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
import { FieldSkeleton } from "@/registry/components/openlmis/form-fields/form-fields"

import {
  ASSIGNMENT_LABELS,
  type AssignmentChoice,
  type AssignmentChoices,
  type AssignmentKind,
  assignmentFormSchema,
  EMPTY_ASSIGNMENT_FORM,
  type NewAssignment,
  toNewAssignment,
} from "./assignment-form"

type AddAssignmentDialogProps = AssignmentChoices & {
  kind: AssignmentKind
  open: boolean
  onClose: () => void
  /** Offers organizations, places outside the system, as well as facilities. */
  canPickOrganizations?: boolean
  /** Locks the dialog and spins Add while the parent saves. */
  pending?: boolean
  /** Why the last save failed; what was picked stays on screen. */
  error?: string
  /** The parent saves it, then closes the dialog or passes `error`. */
  onSubmit: (assignment: NewAssignment) => void
}

export function AddAssignmentDialog({
  open,
  onClose,
  pending = false,
  ...props
}: AddAssignmentDialogProps) {
  const { shown, dialogProps } = useDialogTarget(open || undefined, onClose)

  return (
    <FormDialog {...dialogProps(pending)}>
      {shown && <AddAssignmentForm pending={pending} {...props} />}
    </FormDialog>
  )
}

const toItems = (choices: readonly AssignmentChoice[]) =>
  choices.map((choice) => ({
    value: choice.id,
    label: choice.name,
    description: choice.code,
  }))

function AddAssignmentForm({
  kind,
  canPickOrganizations = false,
  pending,
  error,
  onSubmit,
  programs,
  facilityTypes,
  facilities,
  organizations,
  geoLevels,
}: Omit<AddAssignmentDialogProps, "open" | "onClose"> & { pending: boolean }) {
  const labels = ASSIGNMENT_LABELS[kind]
  const programItems = useMemo(() => programs && toItems(programs), [programs])
  const typeItems = useMemo(
    () => facilityTypes && toItems(facilityTypes),
    [facilityTypes]
  )
  const facilityItems = useMemo(
    () => facilities && toItems(facilities),
    [facilities]
  )
  const organizationItems = useMemo(
    () => organizations && toItems(organizations),
    [organizations]
  )
  const levelItems = useMemo(
    () =>
      geoLevels?.map((level) => ({
        value: level.id,
        label: level.name,
        description: `Level ${level.levelNumber}`,
      })),
    [geoLevels]
  )

  const form = useAppForm({
    defaultValues: EMPTY_ASSIGNMENT_FORM,
    validationLogic: revalidateLogic({
      mode: "submit",
      modeAfterSubmission: "change",
    }),
    validators: { onDynamic: assignmentFormSchema },
    onSubmit: ({ value }) => onSubmit(toNewAssignment(value)),
  })

  const loading = !programItems || !typeItems

  return (
    <FormDialogForm onSubmit={() => void form.handleSubmit()}>
      <FormDialogHeader>
        <FormDialogTitle>Add {labels.one}</FormDialogTitle>
        <FormDialogDescription>
          Let facilities of a type {labels.flow} a facility or an organization
          in a program.
        </FormDialogDescription>
      </FormDialogHeader>
      <FormDialogBody>
        <FieldGroup>
          {error && <FormDialogError description={error} title="Not Added" />}
          {programItems ? (
            <form.AppField name="programId">
              {(field) => (
                <field.SelectField
                  disabled={pending}
                  items={programItems}
                  label="Program"
                  required
                />
              )}
            </form.AppField>
          ) : (
            <FieldSkeleton label="Program" required />
          )}
          {typeItems ? (
            <form.AppField name="facilityTypeId">
              {(field) => (
                <field.SelectField
                  disabled={pending}
                  items={typeItems}
                  label="Facility Type"
                  required
                />
              )}
            </form.AppField>
          ) : (
            <FieldSkeleton label="Facility Type" required />
          )}
          {canPickOrganizations && (
            <form.AppField name="nodeType">
              {(field) => (
                <field.RadioGroupField
                  columns="row"
                  disabled={pending}
                  label="Place"
                  options={[
                    {
                      value: "facility",
                      label: "Facility",
                      description: "A facility in the system.",
                      media: <BuildingIcon />,
                    },
                    {
                      value: "organization",
                      label: "Organization",
                      description:
                        "A place outside the system, such as an NGO.",
                      media: <UsersIcon />,
                    },
                  ]}
                />
              )}
            </form.AppField>
          )}
          <form.Subscribe selector={(state) => state.values.nodeType}>
            {(nodeType) =>
              nodeType === "organization" ? (
                organizationItems ? (
                  <form.AppField name="organizationId">
                    {(field) => (
                      <field.SelectField
                        disabled={pending}
                        items={organizationItems}
                        label="Organization"
                        required
                      />
                    )}
                  </form.AppField>
                ) : (
                  <FieldSkeleton label="Organization" required />
                )
              ) : facilityItems ? (
                <form.AppField name="facilityId">
                  {(field) => (
                    <field.ComboboxField
                      clearLabel="Clear Facility"
                      disabled={pending}
                      emptyMessage="No Matches"
                      items={facilityItems}
                      label="Facility"
                      required
                    />
                  )}
                </form.AppField>
              ) : (
                <FieldSkeleton label="Facility" required />
              )
            }
          </form.Subscribe>
          {levelItems ? (
            <form.AppField name="geoLevelAffinityId">
              {(field) => (
                <field.ComboboxField
                  clearLabel="Clear Geo Level Affinity"
                  description="Offer it only to facilities in the same zone at this level, such as the same district."
                  disabled={pending}
                  emptyMessage="No Matches"
                  items={levelItems}
                  label="Geo Level Affinity"
                />
              )}
            </form.AppField>
          ) : (
            <FieldSkeleton label="Geo Level Affinity" />
          )}
        </FieldGroup>
      </FormDialogBody>
      <FormDialogFooter>
        <FormDialogCancel disabled={pending} />
        <FormDialogSubmit disabled={loading} pending={pending}>
          Add
        </FormDialogSubmit>
      </FormDialogFooter>
    </FormDialogForm>
  )
}
