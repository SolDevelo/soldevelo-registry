"use client"

import { revalidateLogic } from "@tanstack/react-form"
import { type ReactNode, useId, useMemo } from "react"

import { FieldGroup, FieldLegend, FieldSet } from "@/components/ui/field"
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
  SkeletonLine,
} from "@/registry/components/openlmis/form-fields/form-fields"
import { PasswordRequirements } from "@/registry/components/openlmis/password-requirements/password-requirements"

import {
  defaultPasswordForm,
  passwordFormSchemaFor,
  resetEmail,
} from "./password-form"

/** The user whose password is set, and whether they were just created and have none yet. */
export type PasswordDialogTarget = {
  userId: string
  created: boolean
}

export type PasswordUser = {
  id: string
  username: string
  email: string | null
  /** With the names, a typed password may not contain them either. */
  firstName?: string | null
  lastName?: string | null
}

/** What the user chose: email a reset link, or set this password now. */
export type PasswordChange =
  | { method: "email"; email: string }
  | { method: "manual"; password: string }

type ResetPasswordDialogProps = {
  /** Opens the dialog while set; keep the object's identity while it stays open. */
  target: PasswordDialogTarget | undefined
  /** The target's user; the form shows a skeleton until it is set. */
  user?: PasswordUser | undefined
  /** Called with the choice; carry it out, then clear `target` to close. */
  onSubmit: (change: PasswordChange, user: PasswordUser) => void
  /** Keeps the dialog open and shows a spinner while the change is sent. */
  pending?: boolean
  /** Shown above the choice, e.g. why the change failed. */
  error?: ReactNode
  onClose: () => void
}

export function ResetPasswordDialog({
  target,
  user,
  onSubmit,
  pending = false,
  error,
  onClose,
}: ResetPasswordDialogProps) {
  const { shown, dialogProps } = useDialogTarget(target, onClose)
  const title = shown?.created ? "Set Password" : "Reset Password"

  return (
    <FormDialog {...dialogProps(pending)}>
      {shown &&
        (user?.id === shown.userId ? (
          <PasswordForm
            error={error}
            key={user.id}
            onSubmit={onSubmit}
            pending={pending}
            target={shown}
            title={title}
            user={user}
          />
        ) : (
          <PasswordFormSkeleton title={title} />
        ))}
    </FormDialog>
  )
}

function PasswordForm({
  target,
  title,
  user,
  onSubmit,
  pending,
  error,
}: Pick<ResetPasswordDialogProps, "onSubmit" | "error"> & {
  target: PasswordDialogTarget
  title: string
  user: PasswordUser
  pending: boolean
}) {
  const { username } = user
  const email = resetEmail(user.email)
  const requirementsId = useId()
  const schema = useMemo(() => passwordFormSchemaFor(user), [user])

  const form = useAppForm({
    defaultValues: defaultPasswordForm(email),
    validationLogic: revalidateLogic({
      mode: "submit",
      modeAfterSubmission: "change",
    }),
    validators: { onDynamic: schema },
    onSubmit: ({ value }) =>
      onSubmit(
        value.method === "email" && email
          ? { method: "email", email }
          : { method: "manual", password: value.password },
        user
      ),
  })

  const description = target.created
    ? email
      ? `${username} has no password yet. Email a link or set one now so they can sign in.`
      : `${username} has no password yet. Set one so they can sign in.`
    : email
      ? `Choose how ${username} gets a new password.`
      : `Set a new password for ${username}.`

  return (
    <FormDialogForm onSubmit={() => void form.handleSubmit()}>
      <PasswordDialogHeader title={title}>
        <FormDialogDescription>{description}</FormDialogDescription>
      </PasswordDialogHeader>
      <FormDialogBody>
        <FieldGroup>
          {error && (
            <FormDialogError
              description={error}
              title={
                target.created
                  ? "Could Not Set Password"
                  : "Could Not Reset Password"
              }
            />
          )}

          {email && (
            <form.AppField name="method">
              {(field) => (
                <field.RadioGroupField
                  label="Method"
                  options={[
                    {
                      value: "email",
                      label: "Send Reset Email",
                      description: `Email a link to ${email}, where the user chooses a password.`,
                    },
                    {
                      value: "manual",
                      label: "Set Password Manually",
                      description: "Type a password to share with the user.",
                    },
                  ]}
                />
              )}
            </form.AppField>
          )}

          <form.Subscribe selector={(state) => state.values.method}>
            {(method) =>
              method === "manual" && (
                <form.AppField name="password">
                  {(field) => (
                    <div className="grid gap-3">
                      <field.PasswordField
                        describedBy={requirementsId}
                        hideLabel="Hide Password"
                        label="New Password"
                        required
                        showLabel="Show Password"
                      />
                      <PasswordRequirements
                        id={requirementsId}
                        owner={user}
                        password={field.state.value}
                      />
                    </div>
                  )}
                </form.AppField>
              )
            }
          </form.Subscribe>
        </FieldGroup>
      </FormDialogBody>
      <FormDialogFooter>
        <FormDialogCancel disabled={pending} />
        <form.Subscribe selector={(state) => state.values.method}>
          {(method) => (
            <FormDialogSubmit pending={pending}>
              {method === "email" ? "Send Email" : "Set Password"}
            </FormDialogSubmit>
          )}
        </form.Subscribe>
      </FormDialogFooter>
    </FormDialogForm>
  )
}

function PasswordDialogHeader({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <FormDialogHeader>
      <FormDialogTitle>{title}</FormDialogTitle>
      {children}
    </FormDialogHeader>
  )
}

/** Laid out like the usual case, a user with an email choosing between the two methods. */
function PasswordFormSkeleton({ title }: { title: string }) {
  return (
    <>
      <PasswordDialogHeader title={title}>
        <SkeletonLine width="short" />
      </PasswordDialogHeader>
      <FormDialogBody>
        <div aria-busy>
          <FieldGroup>
            <FieldSet>
              <FieldLegend variant="label">Method</FieldLegend>
              <ChoiceCardSkeleton control="radio" label="Send Reset Email" />
              <ChoiceCardSkeleton
                control="radio"
                label="Set Password Manually"
              />
            </FieldSet>
          </FieldGroup>
        </div>
      </FormDialogBody>
      <FormDialogFooter>
        <FormDialogCancel />
        <FormDialogSubmit disabled>Send Email</FormDialogSubmit>
      </FormDialogFooter>
    </>
  )
}
