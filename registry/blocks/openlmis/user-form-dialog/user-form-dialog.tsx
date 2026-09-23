"use client"

import { revalidateLogic } from "@tanstack/react-form"
import { type ReactNode, useMemo, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
import { useDialogData } from "@/registry/components/openlmis/form-dialog/use-dialog-data"
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
  onClose: () => void
  /** Takes over from `onClose` after an add, e.g. to go on to setting a password. */
  onCreated?: (userId: string) => void
  loadUser: (userId: string) => Promise<UserDetails>
  loadFacilities: () => Promise<Facility[]>
  /** Resolves to the saved user's id; a rejection's message is shown in the dialog. */
  saveUser: (values: UserFormValues, existing?: UserDetails) => Promise<string>
}

export function UserFormDialog({
  target,
  onClose,
  onCreated,
  loadUser,
  loadFacilities,
  saveUser,
}: UserFormDialogProps) {
  const { shown, dialogProps } = useDialogTarget(target, onClose)
  const [saving, setSaving] = useState(false)
  const data = { loadFacilities, saveUser, onSavingChange: setSaving }

  return (
    <FormDialog {...dialogProps(saving)}>
      {shown === "new" && (
        <UserForm {...data} onCreated={onCreated} onDone={onClose} />
      )}
      {shown !== undefined && shown !== "new" && (
        <EditUserForm
          {...data}
          key={shown}
          loadUser={loadUser}
          onDone={onClose}
          userId={shown}
        />
      )}
    </FormDialog>
  )
}

type FormData = Pick<UserFormDialogProps, "loadFacilities" | "saveUser"> & {
  onSavingChange: (saving: boolean) => void
  onDone: () => void
}

function EditUserForm({
  userId,
  loadUser,
  ...props
}: FormData & { userId: string; loadUser: UserFormDialogProps["loadUser"] }) {
  const user = useDialogData(`user:${userId}`, () => loadUser(userId))

  if (user.error) {
    return (
      <FormDialogLoadError
        errorTitle="Could Not Load User"
        onRetry={user.retry}
        title="Edit User"
      />
    )
  }
  if (!user.data) return <UserFormSkeleton />
  return <UserForm {...props} details={user.data} />
}

function UserForm({
  details,
  loadFacilities,
  saveUser,
  onSavingChange,
  onDone,
  onCreated,
}: FormData & { details?: UserDetails; onCreated?: (userId: string) => void }) {
  const isEdit = details !== undefined
  const [saveError, setSaveError] = useState<unknown>()
  const [saving, setSaving] = useState(false)

  const form = useAppForm({
    defaultValues: details ? toUserFormValues(details) : EMPTY_USER_FORM,
    // Quiet until the first submit, then each field re-checks as it is corrected.
    validationLogic: revalidateLogic({
      mode: "submit",
      modeAfterSubmission: "change",
    }),
    validators: { onDynamic: userFormSchema },
    onSubmit: async ({ value }) => {
      setSaveError(undefined)
      setSaving(true)
      onSavingChange(true)
      try {
        const userId = await saveUser(toSavedValues(value, details), details)
        if (!isEdit && onCreated) onCreated(userId)
        else onDone()
      } catch (error) {
        setSaveError(error)
      } finally {
        setSaving(false)
        onSavingChange(false)
      }
    },
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
          {saveError !== undefined && (
            <FormDialogError
              description={
                saveError instanceof Error && saveError.message
                  ? saveError.message
                  : "Something went wrong. Check your connection and try again."
              }
              title="Could Not Save User"
            />
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

          <form.AppField name="email">
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
            {() => <HomeFacilityField loadFacilities={loadFacilities} />}
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
            <form.AppField name="allowNotify">
              {(field) => (
                <field.SwitchField
                  description={
                    details.emailVerified
                      ? "Send every notification this user's roles allow."
                      : "Available once the email address is verified."
                  }
                  disabled={!details.emailVerified}
                  label="Allow Notifications"
                />
              )}
            </form.AppField>
          )}
        </FieldGroup>
      </FormDialogBody>
      <FormDialogFooter>
        <FormDialogCancel disabled={saving} />
        <FormDialogSubmit pending={saving}>
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

/** Reads its field from the surrounding `AppField`; the facilities load on their own, after the user. */
function HomeFacilityField({
  loadFacilities,
}: Pick<UserFormDialogProps, "loadFacilities">) {
  const facilities = useDialogData("facilities", loadFacilities)
  const items = useMemo(
    () =>
      (facilities.data ?? []).map((facility) => ({
        value: facility.id,
        label: `${facility.code} - ${facility.name}`,
      })),
    [facilities.data]
  )

  if (facilities.error) {
    return (
      <FormDialogError
        action={
          <Button
            onClick={facilities.retry}
            size="sm"
            type="button"
            variant="outline"
          >
            Try Again
          </Button>
        }
        description="Check your connection and try again."
        title="Could Not Load Facilities"
      />
    )
  }
  if (!facilities.data) return <FieldSkeleton label="Home Facility" />
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
