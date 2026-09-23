import { z } from "zod"

export type PasswordMethod = "email" | "manual"

// The rule the OpenLMIS auth service enforces, checked here too so the user hears it before sending.
const MIN_PASSWORD_LENGTH = 8

const issue = (message: string) => ({
  code: "custom" as const,
  path: ["password"],
  message,
})

export const passwordFormSchema = z
  .object({
    method: z.enum(["email", "manual"]),
    password: z.string(),
  })
  .superRefine(({ method, password }, context) => {
    if (method !== "manual") return
    if (password === "") context.addIssue(issue("Enter a password."))
    else if (password.length < MIN_PASSWORD_LENGTH)
      context.addIssue(issue("Use at least 8 characters."))
    else if (!/\d/.test(password))
      context.addIssue(issue("Include at least 1 number."))
  })

export type PasswordFormValues = z.input<typeof passwordFormSchema>

/** The address to send a reset link to; empty text counts as none, so it never hides the password field. */
export function resetEmail(email: string | null | undefined): string | null {
  return email?.trim() || null
}

/** An emailed link when the user has an address, as the legacy UI does, otherwise a typed password. */
export function defaultPasswordForm(email: string | null): PasswordFormValues {
  return { method: email ? "email" : "manual", password: "" }
}
