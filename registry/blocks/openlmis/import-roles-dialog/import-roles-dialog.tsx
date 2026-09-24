"use client"

import { revalidateLogic, useStore } from "@tanstack/react-form"
import { useMemo } from "react"
import { z } from "zod"

import { FieldDescription, FieldGroup } from "@/components/ui/field"
import {
  mergeAssignments,
  type RoleAssignment,
} from "@/registry/blocks/openlmis/role-assignments-table/role-assignments"
import {
  FormDialog,
  FormDialogBody,
  FormDialogCancel,
  FormDialogDescription,
  FormDialogFooter,
  FormDialogForm,
  FormDialogHeader,
  FormDialogSubmit,
  FormDialogTitle,
} from "@/registry/components/openlmis/form-dialog/form-dialog"
import { useDialogTarget } from "@/registry/components/openlmis/form-dialog/use-dialog-target"
import { useAppForm } from "@/registry/components/openlmis/form-fields/form"
import {
  ComboboxField,
  FieldSkeleton,
} from "@/registry/components/openlmis/form-fields/form-fields"

export type ImportSourceUser = {
  id: string
  username: string
  firstName?: string | null
  lastName?: string | null
  roleAssignments: RoleAssignment[]
}

const importSchema = z.object({
  userId: z
    .string()
    .nullable()
    .refine(Boolean, "Choose a user to copy roles from."),
})

type ImportRolesDialogProps = {
  open: boolean
  /** The user being edited, left out of the list. */
  userId: string
  username: string
  /** The roles being edited now, to count which ones are new. */
  draft: readonly RoleAssignment[]
  /** Who roles can be copied from; the field shows a skeleton until it is set. */
  users: readonly ImportSourceUser[] | undefined
  onImport: (assignments: RoleAssignment[], fromUsername: string) => void
  onClose: () => void
}

/** Copies another user's roles into the draft; nothing is saved until the page is. */
export function ImportRolesDialog({
  open,
  onClose,
  ...props
}: ImportRolesDialogProps) {
  const { shown, dialogProps } = useDialogTarget(open || undefined, onClose)
  return (
    <FormDialog {...dialogProps()}>
      {shown && <ImportRolesForm onDone={onClose} {...props} />}
    </FormDialog>
  )
}

function ImportRolesForm({
  userId,
  username,
  draft,
  users,
  onImport,
  onDone,
}: Omit<ImportRolesDialogProps, "open" | "onClose"> & { onDone: () => void }) {
  const form = useAppForm({
    defaultValues: { userId: null as string | null },
    validationLogic: revalidateLogic({
      mode: "submit",
      modeAfterSubmission: "change",
    }),
    validators: { onDynamic: importSchema },
    onSubmit: ({ value }) => {
      const from = users?.find((user) => user.id === value.userId)
      if (!from) return
      onImport(from.roleAssignments, from.username)
      onDone()
    },
  })
  const sourceId = useStore(form.store, (state) => state.values.userId)
  const source = users?.find((user) => user.id === sourceId)

  return (
    <FormDialogForm onSubmit={() => void form.handleSubmit()}>
      <FormDialogHeader>
        <FormDialogTitle>Import Roles</FormDialogTitle>
        <FormDialogDescription>
          Copy another user's roles to {username}. They are added to the roles
          on this page and saved with them.
        </FormDialogDescription>
      </FormDialogHeader>
      <FormDialogBody>
        <FieldGroup>
          <form.AppField name="userId">
            {() =>
              users ? (
                <UserField excludeId={userId} users={users} />
              ) : (
                <FieldSkeleton label="User" required />
              )
            }
          </form.AppField>
          {source && (
            <ImportPreview draft={draft} roles={source.roleAssignments} />
          )}
        </FieldGroup>
      </FormDialogBody>
      <FormDialogFooter>
        <FormDialogCancel />
        <FormDialogSubmit>Import Roles</FormDialogSubmit>
      </FormDialogFooter>
    </FormDialogForm>
  )
}

/** Reads its field from the surrounding `AppField`. */
function UserField({
  users,
  excludeId,
}: {
  users: readonly ImportSourceUser[]
  excludeId: string
}) {
  const items = useMemo(
    () =>
      users
        .filter((user) => user.id !== excludeId)
        .map((user) => {
          const name = [user.firstName, user.lastName].filter(Boolean).join(" ")
          return {
            value: user.id,
            label: name ? `${user.username} (${name})` : user.username,
          }
        }),
    [users, excludeId]
  )
  return (
    <ComboboxField
      clearLabel="Clear User"
      description={`Type to search ${items.length} users.`}
      emptyMessage="No users found."
      items={items}
      label="User"
      placeholder="Search Users..."
      required
    />
  )
}

const count = (n: number) => (n === 1 ? "1 role" : `${n} roles`)

/** How many of the chosen user's roles are new here, before anything is added. */
function ImportPreview({
  draft,
  roles,
}: {
  draft: readonly RoleAssignment[]
  roles: readonly RoleAssignment[]
}) {
  const { added, skipped } = mergeAssignments(draft, roles)
  return (
    <FieldDescription>
      {added === 0
        ? "They have no roles this user does not already have."
        : skipped === 0
          ? `Adds ${count(added)}.`
          : `Adds ${count(added)}; ${count(skipped)} this user already has.`}
    </FieldDescription>
  )
}
