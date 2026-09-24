"use client"

import { revalidateLogic } from "@tanstack/react-form"
import { type ReactNode, useMemo } from "react"

import { Badge } from "@/components/ui/badge"
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
  SwitchField,
  ChoiceCardSkeleton,
  ComboboxField,
  FieldSkeleton,
  SkeletonLine,
} from "@/registry/components/openlmis/form-fields/form-fields"
import { StatusBadge } from "@/registry/components/openlmis/status-badge/status-badge"

import {
  canNotify,
  EMPTY_USER_FORM,
  type Facility,
  toSavedValues,
  toUserFormValues,
  type UserDetails,
  type UserFormValues,
  userFormSchema,
} from "./user-form"

/** `"new"` adds a user; an id edits that user. */
export type UserFormDialogTarget = "new" | (string & {})

type UserFormDialogProps = {
  /** Opens the dialog while set. */
  target: UserFormDialogTarget | undefined
  /** The user being edited; the form shows a skeleton until it is set. */
  user?: UserDetails | undefined
  /** The home facility choices; the field shows a skeleton until they are set. */
  facilities: readonly Facility[] | undefined
  /** Called with trimmed values; save them, then clear `target` to close. */
  onSubmit: (values: UserFormValues, existing?: UserDetails) => void
  /** Keeps the dialog open and shows a spinner while the save runs. */
  pending?: boolean
  /** Shown above the fields, e.g. why the save failed; what was typed stays. */
  error?: ReactNode
  onClose: () => void
}

export function UserFormDialog({
  target,
  user,
  facilities,
  onSubmit,
  pending = false,
  error,
  onClose,
}: UserFormDialogProps) {
  const { shown, dialogProps } = useDialogTarget(target, onClose)
  const form = { facilities, onSubmit, pending, error }

  return (
    <FormDialog {...dialogProps(pending)}>
      {shown === "new" && <UserForm {...form} />}
      {shown !== undefined &&
        shown !== "new" &&
        (user?.id === shown ? (
          // Keyed, so another user's values never carry over.
          <UserForm {...form} details={user} key={user.id} />
        ) : (
          <UserFormSkeleton />
        ))}
    </FormDialog>
  )
}

type UserFormProps = Pick<
  UserFormDialogProps,
  "facilities" | "onSubmit" | "error"
> & {
  pending: boolean
  details?: UserDetails
}

function UserForm({
  details,
  facilities,
  onSubmit,
  pending,
  error,
}: UserFormProps) {
  const isEdit = details !== undefined

  const form = useAppForm({
    defaultValues: details ? toUserFormValues(details) : EMPTY_USER_FORM,
    // Quiet until the first submit, then each field re-checks as it is corrected.
    validationLogic: revalidateLogic({
      mode: "submit",
      modeAfterSubmission: "change",
    }),
    validators: { onDynamic: userFormSchema },
    onSubmit: ({ value }) => onSubmit(toSavedValues(value, details), details),
  })

  const savedEmail = details?.email ?? ""
  const homeFacilityRoles = details?.homeFacilityRoleCount ?? 0
  const savedFacilityId = details?.homeFacilityId ?? null

  return (
    <FormDialogForm onSubmit={() => void form.handleSubmit()}>
      <FormDialogHeader>
        <FormDialogTitle>{isEdit ? "Edit User" : "Add User"}</FormDialogTitle>
        <FormDialogDescription>
          {isEdit
            ? `Details for ${details.username}.`
            : "Create an account that can sign in to OpenLMIS."}
        </FormDialogDescription>
      </FormDialogHeader>
      <FormDialogBody>
        <FieldGroup>
          {error && (
            <FormDialogError description={error} title="Could Not Save User" />
          )}

          <form.AppField name="username">
            {(field) => (
              <field.TextField autoComplete="off" label="Username" required />
            )}
          </form.AppField>

          <FieldRow>
            <form.AppField name="firstName">
              {(field) => (
                <field.TextField
                  autoComplete="off"
                  label="First Name"
                  required
                />
              )}
            </form.AppField>
            <form.AppField name="lastName">
              {(field) => (
                <field.TextField
                  autoComplete="off"
                  label="Last Name"
                  required
                />
              )}
            </form.AppField>
          </FieldRow>

          <form.AppField
            listeners={{
              // Notifications go to the verified address, so a new one switches them off.
              onChange: ({ value }) => {
                if (isEdit && value.trim() !== savedEmail)
                  form.setFieldValue("allowNotify", false)
              },
            }}
            name="email"
          >
            {(field) => (
              <field.TextField
                autoComplete="off"
                description={
                  isEdit &&
                  savedEmail &&
                  field.state.value.trim() === savedEmail && (
                    <EmailStatus verified={details.emailVerified} />
                  )
                }
                label="Email"
                type="email"
              />
            )}
          </form.AppField>

          <FieldRow>
            <form.AppField name="jobTitle">
              {(field) => (
                <field.TextField autoComplete="off" label="Job Title" />
              )}
            </form.AppField>
            <form.AppField name="phoneNumber">
              {(field) => (
                <field.TextField
                  autoComplete="off"
                  label="Phone Number"
                  type="tel"
                />
              )}
            </form.AppField>
          </FieldRow>

          <form.AppField name="homeFacilityId">
            {() => <HomeFacilityField facilities={facilities} />}
          </form.AppField>

          {homeFacilityRoles > 0 && (
            <form.Subscribe selector={(state) => state.values.homeFacilityId}>
              {(homeFacilityId) =>
                homeFacilityId !== savedFacilityId && (
                  <form.AppField name="removeHomeFacilityRoles">
                    {() => (
                      <SwitchField
                        description={`${homeFacilityRoles === 1 ? "1 role applies" : `${homeFacilityRoles} roles apply`} only at the current home facility.`}
                        label="Remove Home Facility Roles"
                      />
                    )}
                  </form.AppField>
                )
              }
            </form.Subscribe>
          )}

          <form.AppField name="active">
            {(field) => (
              <field.SwitchField
                description="Inactive users cannot sign in."
                label="Active"
              />
            )}
          </form.AppField>

          {isEdit && (
            <form.Subscribe
              selector={(state) =>
                canNotify(
                  state.values.email,
                  details.email,
                  details.emailVerified
                )
              }
            >
              {(verified) => (
                <form.AppField name="allowNotify">
                  {(field) => (
                    <field.SwitchField
                      description={
                        verified
                          ? "Send every notification this user's roles allow."
                          : "Available once the email address is verified."
                      }
                      disabled={!verified}
                      label="Allow Notifications"
                    />
                  )}
                </form.AppField>
              )}
            </form.Subscribe>
          )}
        </FieldGroup>
      </FormDialogBody>
      <FormDialogFooter>
        <FormDialogCancel disabled={pending} />
        <FormDialogSubmit pending={pending}>
          {isEdit ? "Save Changes" : "Create User"}
        </FormDialogSubmit>
      </FormDialogFooter>
    </FormDialogForm>
  )
}

function FieldRow({ children }: { children: ReactNode }) {
  return <div className="grid gap-5 sm:grid-cols-2">{children}</div>
}

function EmailStatus({ verified }: { verified: boolean }) {
  return verified ? (
    <StatusBadge tone="success">Verified</StatusBadge>
  ) : (
    <Badge variant="secondary">Not Verified</Badge>
  )
}

/** Reads its field from the surrounding `AppField`. */
function HomeFacilityField({
  facilities,
}: Pick<UserFormDialogProps, "facilities">) {
  const items = useMemo(
    () =>
      (facilities ?? []).map((facility) => ({
        value: facility.id,
        label: `${facility.code} - ${facility.name}`,
      })),
    [facilities]
  )

  if (!facilities) return <FieldSkeleton label="Home Facility" />
  return (
    <ComboboxField
      clearLabel="Clear Home Facility"
      emptyMessage="No facilities found."
      items={items}
      label="Home Facility"
      placeholder="Search Facilities..."
    />
  )
}

/** The edit form as it will look, laid out the same, so nothing moves when the user arrives. */
function UserFormSkeleton() {
  return (
    <>
      <FormDialogHeader>
        <FormDialogTitle>Edit User</FormDialogTitle>
        <SkeletonLine width="short" />
      </FormDialogHeader>
      <FormDialogBody>
        <div aria-busy>
          <FieldGroup>
            <FieldSkeleton label="Username" required />
            <FieldRow>
              <FieldSkeleton label="First Name" required />
              <FieldSkeleton label="Last Name" required />
            </FieldRow>
            <FieldSkeleton label="Email" />
            <FieldRow>
              <FieldSkeleton label="Job Title" />
              <FieldSkeleton label="Phone Number" />
            </FieldRow>
            <FieldSkeleton label="Home Facility" />
            <ChoiceCardSkeleton
              description="Inactive users cannot sign in."
              label="Active"
            />
            <ChoiceCardSkeleton label="Allow Notifications" />
          </FieldGroup>
        </div>
      </FormDialogBody>
      <FormDialogFooter>
        <FormDialogCancel />
        <FormDialogSubmit disabled>Save Changes</FormDialogSubmit>
      </FormDialogFooter>
    </>
  )
}
