import { z } from "zod"

/** What the dialog shows for an existing user; map your API's user onto it. */
export type UserDetails = {
  id: string
  username: string
  firstName: string
  lastName: string
  email: string | null
  emailVerified: boolean
  jobTitle: string | null
  phoneNumber: string | null
  /** Whether the user can sign in. */
  active: boolean
  homeFacilityId: string | null
  allowNotify: boolean
  /** Roles that only apply at the home facility, so they lose their meaning when it changes. */
  homeFacilityRoleCount: number
}

export type Facility = {
  id: string
  code: string
  name: string
}

const requiredText = (message: string) => z.string().trim().min(1, message)

export const userFormSchema = z.object({
  // The OpenLMIS reference data service only takes letters and digits in a username.
  username: requiredText("Enter a username.").regex(
    /^[\p{L}\p{N}]*$/u,
    "Use letters and numbers only."
  ),
  email: z
    .string()
    .trim()
    .refine(
      (email) => email === "" || z.email().safeParse(email).success,
      "Enter a valid email address."
    ),
  firstName: requiredText("Enter a first name."),
  lastName: requiredText("Enter a last name."),
  jobTitle: z.string(),
  phoneNumber: z.string(),
  active: z.boolean(),
  homeFacilityId: z.string().nullable(),
  allowNotify: z.boolean(),
  removeHomeFacilityRoles: z.boolean(),
})

export type UserFormValues = z.input<typeof userFormSchema>

export const EMPTY_USER_FORM: UserFormValues = {
  username: "",
  email: "",
  firstName: "",
  lastName: "",
  jobTitle: "",
  phoneNumber: "",
  active: true,
  homeFacilityId: null,
  allowNotify: false,
  removeHomeFacilityRoles: false,
}

export function toUserFormValues(user: UserDetails): UserFormValues {
  return {
    username: user.username,
    email: user.email ?? "",
    firstName: user.firstName,
    lastName: user.lastName,
    jobTitle: user.jobTitle ?? "",
    phoneNumber: user.phoneNumber ?? "",
    active: user.active,
    homeFacilityId: user.homeFacilityId,
    allowNotify: user.allowNotify,
    removeHomeFacilityRoles: false,
  }
}

/** Notifications need a verified address, and only the saved one can be verified yet. */
export function canNotify(
  email: string,
  savedEmail: string | null,
  emailVerified: boolean
) {
  return emailVerified && savedEmail !== null && email.trim() === savedEmail
}

/** The values to save: trimmed, notifications only to a verified address, and roles removed only if the facility changed. */
export function toSavedValues(
  values: UserFormValues,
  existing?: UserDetails
): UserFormValues {
  return {
    ...values,
    username: values.username.trim(),
    email: values.email.trim(),
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    jobTitle: values.jobTitle.trim(),
    phoneNumber: values.phoneNumber.trim(),
    allowNotify:
      values.allowNotify &&
      existing !== undefined &&
      canNotify(values.email, existing.email, existing.emailVerified),
    removeHomeFacilityRoles:
      values.removeHomeFacilityRoles &&
      values.homeFacilityId !== (existing?.homeFacilityId ?? null),
  }
}
