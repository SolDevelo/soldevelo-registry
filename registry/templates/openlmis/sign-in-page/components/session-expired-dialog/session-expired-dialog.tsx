"use client"

import { revalidateLogic } from "@tanstack/react-form"
import type { ReactNode } from "react"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { FieldGroup } from "@/components/ui/field"
import { AuthLink } from "@/registry/components/openlmis/auth-card/auth-card"
import {
  FormDialog,
  FormDialogBody,
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

// Its own field name, so its id never clashes with a password field on the page behind it.
const passwordSchema = z.object({
  sessionPassword: z.string().min(1, "Password is required."),
})

type SessionExpiredDialogProps = {
  /** Open while the session is expired; only signing in or out should close it. */
  open: boolean
  /** Who was signed in; only the password is asked for. */
  username: string
  onSignIn: (password: string) => void
  onSignOut: () => void
  /** Signing in. */
  pending?: boolean
  /** Signing out. */
  signingOut?: boolean
  /** Why signing in failed, e.g. a wrong password. */
  error?: ReactNode
  forgotPasswordHref?: string
  /** Where a close button would be, e.g. a language switcher. */
  action?: ReactNode
}

const keepOpen = () => {}

/** Over whatever page was open when the session ran out, until the same user signs in or out. */
export function SessionExpiredDialog({
  open,
  username,
  onSignIn,
  onSignOut,
  pending = false,
  signingOut = false,
  error,
  forgotPasswordHref = "/forgot-password",
  action,
}: SessionExpiredDialogProps) {
  // Keeps the last username through the close animation, so the dialog never empties as it fades.
  const { shown, dialogProps } = useDialogTarget(
    open ? username : undefined,
    keepOpen
  )

  return (
    // The pages behind are waiting on it, so there is no close button.
    <FormDialog closeButton={false} {...dialogProps()}>
      {shown && (
        <SignInAgainForm
          action={action}
          error={error}
          forgotPasswordHref={forgotPasswordHref}
          onSignIn={onSignIn}
          onSignOut={onSignOut}
          pending={pending}
          signingOut={signingOut}
          username={shown}
        />
      )}
    </FormDialog>
  )
}

function SignInAgainForm({
  username,
  onSignIn,
  onSignOut,
  pending,
  signingOut,
  error,
  forgotPasswordHref,
  action,
}: Omit<SessionExpiredDialogProps, "open" | "pending" | "signingOut"> & {
  pending: boolean
  signingOut: boolean
  forgotPasswordHref: string
}) {
  const form = useAppForm({
    defaultValues: { sessionPassword: "" },
    validationLogic: revalidateLogic({
      mode: "submit",
      modeAfterSubmission: "change",
    }),
    validators: { onDynamic: passwordSchema },
    onSubmit: ({ value }) => onSignIn(value.sessionPassword),
  })

  return (
    <FormDialogForm onSubmit={form.handleSubmit}>
      {action && <div className="absolute end-2 top-2">{action}</div>}
      <FormDialogHeader>
        <FormDialogTitle>Session Expired</FormDialogTitle>
        <FormDialogDescription>
          You were signed out after a period of inactivity. Sign in again to
          carry on. Your unsaved changes are kept.
        </FormDialogDescription>
      </FormDialogHeader>
      <FormDialogBody>
        <FieldGroup>
          {error && (
            <FormDialogError description={error} title="Sign In Failed" />
          )}
          {/* Lets password managers offer the password saved for this account. */}
          <input autoComplete="username" hidden readOnly value={username} />
          <form.AppField name="sessionPassword">
            {(field) => (
              <field.PasswordField
                action={
                  // A new tab, so the page and its unsaved work stay behind the dialog.
                  <AuthLink href={forgotPasswordHref} newTab>
                    Forgot Password?
                  </AuthLink>
                }
                autoComplete="current-password"
                description={
                  <>
                    Signed in as{" "}
                    <span className="font-medium text-foreground">
                      {username}
                    </span>
                  </>
                }
                label="Password"
                placeholder="Enter Your Password"
              />
            )}
          </form.AppField>
        </FieldGroup>
      </FormDialogBody>
      <FormDialogFooter>
        <Button
          disabled={pending || signingOut}
          onClick={onSignOut}
          type="button"
          variant="destructive"
        >
          Sign Out
        </Button>
        <FormDialogSubmit disabled={signingOut} pending={pending}>
          {pending ? "Signing In..." : "Sign In"}
        </FormDialogSubmit>
      </FormDialogFooter>
    </FormDialogForm>
  )
}
