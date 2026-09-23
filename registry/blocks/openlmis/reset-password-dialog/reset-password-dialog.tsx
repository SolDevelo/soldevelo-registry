"use client"

import { revalidateLogic } from "@tanstack/react-form"
import { type ReactNode, useState } from "react"

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
  FormDialogLoadError,
  FormDialogSubmit,
  FormDialogTitle,
} from "@/registry/components/openlmis/form-dialog/form-dialog"
import { useDialogData } from "@/registry/components/openlmis/form-dialog/use-dialog-data"
import { useDialogTarget } from "@/registry/components/openlmis/form-dialog/use-dialog-target"
import { useAppForm } from "@/registry/components/openlmis/form-fields/form"
import {
  ChoiceCardSkeleton,
  SkeletonLine,
} from "@/registry/components/openlmis/form-fields/form-fields"

import {
  defaultPasswordForm,
  passwordFormSchema,
  resetEmail,
} from "./password-form"

/** The user whose password is set, and whether they were just created and have none yet. */
export type PasswordDialogTarget = {
  userId: string
  created: boolean
}

export type PasswordUser = {
  username: string
  email: string | null
}

type ResetPasswordDialogProps = {
  /** Opens the dialog while set; keep the object's identity while it stays open. */
  target: PasswordDialogTarget | undefined
  onClose: () => void
  loadUser: (userId: string) => Promise<PasswordUser>
  sendResetEmail: (email: string) => Promise<void>
  setPassword: (username: string, password: string) => Promise<void>
}

export function ResetPasswordDialog({
  target,
  onClose,
  loadUser,
  sendResetEmail,
  setPassword,
}: ResetPasswordDialogProps) {
  const { shown, dialogProps } = useDialogTarget(target, onClose)
  const [saving, setSaving] = useState(false)

  return (
    <FormDialog {...dialogProps(saving)}>
      {shown && (
        <LoadedPasswordForm
          key={shown.userId}
          loadUser={loadUser}
          onDone={onClose}
          onSavingChange={setSaving}
          sendResetEmail={sendResetEmail}
          setPassword={setPassword}
          target={shown}
        />
      )}
    </FormDialog>
  )
}

type PasswordFormProps = Omit<
  ResetPasswordDialogProps,
  "target" | "onClose"
> & {
  target: PasswordDialogTarget
  onDone: () => void
  onSavingChange: (saving: boolean) => void
}

function LoadedPasswordForm({ loadUser, ...props }: PasswordFormProps) {
  const title = props.target.created ? "Set Password" : "Reset Password"
  const user = useDialogData(`user:${props.target.userId}`, () =>
    loadUser(props.target.userId)
  )

  if (user.error) {
    return (
      <FormDialogLoadError
        errorTitle="Could Not Load User"
        onRetry={user.retry}
        title={title}
      />
    )
  }
  if (!user.data) return <PasswordFormSkeleton title={title} />
  return <PasswordForm {...props} title={title} user={user.data} />
}

function PasswordForm({
  target,
  title,
  user,
  sendResetEmail,
  setPassword,
  onSavingChange,
  onDone,
}: Omit<PasswordFormProps, "loadUser"> & {
  title: string
  user: PasswordUser
}) {
  const { username } = user
  const email = resetEmail(user.email)
  const [saveError, setSaveError] = useState<unknown>()
  const [saving, setSaving] = useState(false)

  const form = useAppForm({
    defaultValues: defaultPasswordForm(email),
    validationLogic: revalidateLogic({
      mode: "submit",
      modeAfterSubmission: "change",
    }),
    validators: { onDynamic: passwordFormSchema },
    onSubmit: async ({ value }) => {
      setSaveError(undefined)
      setSaving(true)
      onSavingChange(true)
      try {
        if (value.method === "email" && email) await sendResetEmail(email)
        else await setPassword(username, value.password)
        onDone()
      } catch (error) {
        setSaveError(error)
      } finally {
        setSaving(false)
        onSavingChange(false)
      }
    },
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
          {saveError !== undefined && (
            <FormDialogError
              description={
                saveError instanceof Error && saveError.message
                  ? saveError.message
                  : "Something went wrong. Check your connection and try again."
              }
              title="Could Not Reset Password"
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
                    <field.PasswordField
                      description="At least 8 characters and 1 number."
                      label="New Password"
                      required
                    />
                  )}
                </form.AppField>
              )
            }
          </form.Subscribe>
        </FieldGroup>
      </FormDialogBody>
      <FormDialogFooter>
        <FormDialogCancel disabled={saving} />
        <form.Subscribe selector={(state) => state.values.method}>
          {(method) => (
            <FormDialogSubmit pending={saving}>
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
