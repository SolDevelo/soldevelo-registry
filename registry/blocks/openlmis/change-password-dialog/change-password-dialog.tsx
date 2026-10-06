"use client"

import { revalidateLogic } from "@tanstack/react-form"
import { type ReactNode, useId, useMemo } from "react"

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
import { PasswordRequirements } from "@/registry/components/openlmis/password-requirements/password-requirements"
import type { PasswordOwner } from "@/registry/components/openlmis/password-requirements/password-rules"
import { newPasswordSchema } from "@/registry/components/openlmis/password-requirements/password-schema"

// Re-exported so existing imports from this block keep working.
export { newPasswordSchema }

type ChangePasswordDialogProps = {
  open: boolean
  /** Whose password it is; its username also lets a password manager file the new one. */
  user: PasswordOwner
  /** Called with the new password; change it, then close, e.g. by signing out. */
  onSubmit: (password: string) => void
  /** Keeps the dialog open and shows a spinner while the password is changed. */
  pending?: boolean
  /** Shown above the fields, e.g. why the change was refused. */
  error?: ReactNode
  onClose: () => void
}

export function ChangePasswordDialog({
  open,
  user,
  onSubmit,
  pending = false,
  error,
  onClose,
}: ChangePasswordDialogProps) {
  const { shown, dialogProps } = useDialogTarget(
    open ? true : undefined,
    onClose
  )

  return (
    <FormDialog {...dialogProps(pending)}>
      {shown && (
        <ChangePasswordForm
          error={error}
          onSubmit={onSubmit}
          pending={pending}
          user={user}
        />
      )}
    </FormDialog>
  )
}

function ChangePasswordForm({
  user,
  onSubmit,
  pending,
  error,
}: Pick<ChangePasswordDialogProps, "user" | "onSubmit" | "error"> & {
  pending: boolean
}) {
  const requirementsId = useId()
  const schema = useMemo(() => newPasswordSchema(user), [user])
  const form = useAppForm({
    defaultValues: { password: "", confirm: "" },
    // Quiet until the first submit, then each field re-checks as it is corrected.
    validationLogic: revalidateLogic({
      mode: "submit",
      modeAfterSubmission: "change",
    }),
    validators: { onDynamic: schema },
    onSubmit: ({ value }) => onSubmit(value.password),
  })

  return (
    <FormDialogForm onSubmit={form.handleSubmit}>
      <FormDialogHeader>
        <FormDialogTitle>Change Password</FormDialogTitle>
        <FormDialogDescription>
          After changing it you will be signed out, so you can sign in with the
          new password.
        </FormDialogDescription>
      </FormDialogHeader>
      <FormDialogBody>
        <FieldGroup>
          {error && (
            <FormDialogError
              description={error}
              title="Could Not Change Password"
            />
          )}
          {/* Lets password managers file the new password under the right account. */}
          <input
            autoComplete="username"
            hidden
            readOnly
            value={user.username}
          />
          <form.AppField name="password">
            {(field) => (
              <div className="grid gap-3">
                <field.PasswordField
                  describedBy={requirementsId}
                  label="New Password"
                  required
                />
                <PasswordRequirements
                  id={requirementsId}
                  owner={user}
                  password={field.state.value}
                />
              </div>
            )}
          </form.AppField>
          <form.AppField name="confirm">
            {(field) => (
              <field.PasswordField label="Confirm New Password" required />
            )}
          </form.AppField>
        </FieldGroup>
      </FormDialogBody>
      <FormDialogFooter>
        <FormDialogCancel disabled={pending} />
        <FormDialogSubmit pending={pending}>Change Password</FormDialogSubmit>
      </FormDialogFooter>
    </FormDialogForm>
  )
}
