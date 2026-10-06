"use client"

import { revalidateLogic } from "@tanstack/react-form"
import type { ReactNode } from "react"
import { z } from "zod"

import { CardContent, CardDescription } from "@/components/ui/card"
import { FormDialogError } from "@/registry/components/openlmis/form-dialog/form-dialog"
import { useAppForm } from "@/registry/components/openlmis/form-fields/form"

import {
  AuthForm,
  AuthHeader,
  AuthLink,
  AuthSubmit,
  AuthTitle,
} from "@/registry/components/openlmis/auth-card/auth-card"

export type SignInCredentials = { username: string; password: string }

const signInSchema = z.object({
  username: z
    .string()
    .min(1, "Username is required.")
    .max(255, "Username must be at most 255 characters."),
  password: z.string().min(1, "Password is required."),
})

type SignInFormProps = {
  /** Named in the description: "Enter your {appName} credentials". */
  appName?: string
  logo?: ReactNode
  forgotPasswordHref?: string
  onSubmit: (credentials: SignInCredentials) => void
  /** Shows a spinner on Sign In while the credentials are checked. */
  pending?: boolean
  /** Why sign-in was refused, shown above the fields. */
  error?: ReactNode
}

/** The sign-in card's content; render it inside `AuthPage`. */
export function SignInForm({
  appName = "OpenLMIS",
  logo,
  forgotPasswordHref = "/forgot-password",
  onSubmit,
  pending = false,
  error,
}: SignInFormProps) {
  const form = useAppForm({
    defaultValues: { username: "", password: "" },
    // Quiet until the first submit, then each field re-checks as it is corrected.
    validationLogic: revalidateLogic({
      mode: "submit",
      modeAfterSubmission: "change",
    }),
    validators: { onDynamic: signInSchema },
    onSubmit: ({ value }) => onSubmit(value),
  })

  return (
    <>
      <AuthHeader logo={logo}>
        <AuthTitle>Sign In</AuthTitle>
        <CardDescription>
          Enter your {appName} credentials to continue.
        </CardDescription>
      </AuthHeader>

      <CardContent>
        <AuthForm onSubmit={form.handleSubmit}>
          {error && (
            <FormDialogError description={error} title="Sign In Failed" />
          )}
          <form.AppField name="username">
            {(field) => (
              <field.TextField
                autoComplete="username"
                label="Username"
                placeholder="Enter Your Username"
              />
            )}
          </form.AppField>
          <form.AppField name="password">
            {(field) => (
              <field.PasswordField
                action={
                  <AuthLink href={forgotPasswordHref}>
                    Forgot Password?
                  </AuthLink>
                }
                autoComplete="current-password"
                label="Password"
                placeholder="Enter Your Password"
              />
            )}
          </form.AppField>
          <AuthSubmit pending={pending}>
            {pending ? "Signing In..." : "Sign In"}
          </AuthSubmit>
        </AuthForm>
      </CardContent>
    </>
  )
}
