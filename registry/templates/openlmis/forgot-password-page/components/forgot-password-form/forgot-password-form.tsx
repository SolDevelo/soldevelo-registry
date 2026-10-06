"use client"

import { revalidateLogic } from "@tanstack/react-form"
import { type ReactNode, useId, useState } from "react"
import { z } from "zod"

import { CardContent, CardDescription } from "@/components/ui/card"
import {
  AuthButtonLink,
  AuthForm,
  AuthHeader,
  AuthSubmit,
  AuthTitle,
} from "@/registry/components/openlmis/auth-card/auth-card"
import { FormDialogError } from "@/registry/components/openlmis/form-dialog/form-dialog"
import { useAppForm } from "@/registry/components/openlmis/form-fields/form"

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Enter your email address.")
    .pipe(z.email("Enter a valid email address.")),
})

type ForgotPasswordFormProps = {
  logo?: ReactNode
  signInHref?: string
  /** Called with the trimmed address; request the link, then pass it back as `sentTo`. */
  onSubmit: (email: string) => void
  pending?: boolean
  /** Why the request failed, e.g. too many attempts. */
  error?: ReactNode
  /** Set once the link is requested, to show the confirmation in place of the form. */
  sentTo?: string
}

/** The forgot-password card's content; render it inside `AuthPage`. */
export function ForgotPasswordForm({
  logo,
  signInHref = "/login",
  onSubmit,
  pending = false,
  error,
  sentTo,
}: ForgotPasswordFormProps) {
  // Focus moves to the confirmation only when it replaces the form, not when it renders first.
  const [initialSentTo] = useState(sentTo)
  const form = useAppForm({
    defaultValues: { email: "" },
    validationLogic: revalidateLogic({
      mode: "submit",
      modeAfterSubmission: "change",
    }),
    validators: { onDynamic: forgotPasswordSchema },
    onSubmit: ({ value }) => onSubmit(value.email.trim()),
  })

  if (sentTo !== undefined) {
    return (
      <ResetRequested
        email={sentTo}
        focus={sentTo !== initialSentTo}
        logo={logo}
        signInHref={signInHref}
      />
    )
  }

  return (
    <>
      <AuthHeader logo={logo}>
        <AuthTitle>Forgot Password</AuthTitle>
        <CardDescription>
          Enter your email address and we will send you a link to reset your
          password.
        </CardDescription>
      </AuthHeader>

      <CardContent>
        <AuthForm onSubmit={form.handleSubmit}>
          {error && (
            <FormDialogError
              description={error}
              title="Could Not Request A Reset"
            />
          )}
          <form.AppField name="email">
            {(field) => (
              <field.TextField
                autoComplete="email"
                dir="ltr"
                label="Email"
                placeholder="Enter Your Email"
                required
                type="email"
              />
            )}
          </form.AppField>
          <div className="grid gap-2">
            <AuthSubmit pending={pending}>
              {pending ? "Sending..." : "Reset Password"}
            </AuthSubmit>
            <AuthButtonLink href={signInHref} variant="outline">
              Cancel
            </AuthButtonLink>
          </div>
        </AuthForm>
      </CardContent>
    </>
  )
}

/** The same for any address, as the server never says whether one has an account. */
function ResetRequested({
  email,
  focus,
  logo,
  signInHref,
}: {
  email: string
  focus: boolean
  logo?: ReactNode
  signInHref: string
}) {
  const descriptionId = useId()

  return (
    <>
      <AuthHeader logo={logo}>
        <AuthTitle focus={focus}>Password Reset Requested</AuthTitle>
        <CardDescription id={descriptionId}>
          If an account with the email address{" "}
          <bdi className="font-medium text-foreground">{email}</bdi> is active,
          you will receive an email with instructions to reset your password.
        </CardDescription>
      </AuthHeader>
      <CardContent>
        <AuthButtonLink describedBy={descriptionId} href={signInHref}>
          Back To Sign In
        </AuthButtonLink>
      </CardContent>
    </>
  )
}
