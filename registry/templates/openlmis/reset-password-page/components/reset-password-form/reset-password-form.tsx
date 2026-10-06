"use client"

import { revalidateLogic } from "@tanstack/react-form"
import { type ReactNode, useId, useState } from "react"

import { CardContent, CardDescription } from "@/components/ui/card"
import { newPasswordSchema } from "@/registry/components/openlmis/password-requirements/password-schema"
import {
  AuthButtonLink,
  AuthForm,
  AuthHeader,
  AuthLink,
  AuthSubmit,
  AuthTitle,
} from "@/registry/components/openlmis/auth-card/auth-card"
import { FormDialogError } from "@/registry/components/openlmis/form-dialog/form-dialog"
import { useAppForm } from "@/registry/components/openlmis/form-fields/form"
import { PasswordRequirements } from "@/registry/components/openlmis/password-requirements/password-requirements"

/** `invalid` and `expired` are the link itself failing; `changed` once the new password is saved. */
export type ResetLinkStatus = "ready" | "invalid" | "expired" | "changed"

// The link does not say whose password it is, so the names rule is left out.
const schema = newPasswordSchema()

type ResetPasswordFormProps = {
  status?: ResetLinkStatus
  logo?: ReactNode
  signInHref?: string
  forgotPasswordHref?: string
  /** Called with the new password; save it, then set `status` to `changed`. */
  onSubmit: (password: string) => void
  pending?: boolean
  /** A failure the form can retry, such as a password the server finds too weak. */
  error?: ReactNode
}

const LINK_PROBLEMS = {
  invalid: {
    title: "Link Not Valid",
    description:
      "This reset link does not work. It may have been used already, or a newer one was sent. Request a new link to carry on.",
  },
  expired: {
    title: "Link Expired",
    description:
      "This reset link has expired. Links work for 12 hours. Request a new link to carry on.",
  },
} as const

/** The reset-password card's content; render it inside `AuthPage`. */
export function ResetPasswordForm({
  status = "ready",
  logo,
  signInHref = "/login",
  forgotPasswordHref = "/forgot-password",
  onSubmit,
  pending = false,
  error,
}: ResetPasswordFormProps) {
  // Focus moves to a result card only when it replaces the form, not when it renders first.
  const [initialStatus] = useState(status)
  const focus = status !== initialStatus
  if (status === "changed") {
    return (
      <>
        <AuthHeader logo={logo}>
          <AuthTitle focus={focus}>Password Changed</AuthTitle>
          <CardDescription>Sign in with your new password.</CardDescription>
        </AuthHeader>
        <CardContent>
          <AuthButtonLink href={signInHref}>Back To Sign In</AuthButtonLink>
        </CardContent>
      </>
    )
  }
  if (status !== "ready") {
    const problem = LINK_PROBLEMS[status]
    return (
      <>
        <AuthHeader logo={logo}>
          <AuthTitle focus={focus}>{problem.title}</AuthTitle>
          <CardDescription>{problem.description}</CardDescription>
        </AuthHeader>
        <CardContent>
          <div className="grid gap-2">
            <AuthButtonLink href={forgotPasswordHref}>
              Request A New Link
            </AuthButtonLink>
            <AuthButtonLink href={signInHref} variant="outline">
              Back To Sign In
            </AuthButtonLink>
          </div>
        </CardContent>
      </>
    )
  }

  return (
    <NewPasswordForm
      error={error}
      logo={logo}
      onSubmit={onSubmit}
      pending={pending}
      signInHref={signInHref}
    />
  )
}

function NewPasswordForm({
  logo,
  signInHref,
  onSubmit,
  pending,
  error,
}: Pick<ResetPasswordFormProps, "logo" | "onSubmit" | "error"> & {
  signInHref: string
  pending: boolean
}) {
  const requirementsId = useId()
  const [visible, setVisible] = useState(false)
  const form = useAppForm({
    defaultValues: { password: "", confirm: "" },
    validationLogic: revalidateLogic({
      mode: "submit",
      modeAfterSubmission: "change",
    }),
    validators: { onDynamic: schema },
    onSubmit: ({ value }) => onSubmit(value.password),
  })

  return (
    <>
      <AuthHeader logo={logo}>
        <AuthTitle>Reset Password</AuthTitle>
        <CardDescription>
          Choose a new password for your account.
        </CardDescription>
      </AuthHeader>

      <CardContent>
        <AuthForm onSubmit={form.handleSubmit}>
          {error && (
            <FormDialogError
              description={error}
              title="Could Not Change Password"
            />
          )}
          <form.AppField name="password">
            {(field) => (
              <div className="grid gap-3">
                <field.PasswordField
                  describedBy={requirementsId}
                  label="New Password"
                  onVisibleChange={setVisible}
                  required
                  visible={visible}
                />
                <PasswordRequirements
                  id={requirementsId}
                  password={field.state.value}
                />
              </div>
            )}
          </form.AppField>
          <form.AppField name="confirm">
            {(field) => (
              <field.PasswordField
                label="Confirm New Password"
                onVisibleChange={setVisible}
                required
                visible={visible}
              />
            )}
          </form.AppField>
          <AuthSubmit pending={pending}>
            {pending ? "Changing..." : "Change Password"}
          </AuthSubmit>
          <p className="text-center">
            <AuthLink href={signInHref}>Back To Sign In</AuthLink>
          </p>
        </AuthForm>
      </CardContent>
    </>
  )
}
