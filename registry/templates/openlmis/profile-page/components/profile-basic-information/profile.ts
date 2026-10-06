import { z } from "zod"

/** The signed-in user as the profile shows them; an administrator sets the read-only parts. */
export type ProfileUser = {
  id: string
  username: string
  firstName: string
  lastName: string
  jobTitle?: string | null
  /** The home facility as display text, e.g. "HC01 - Balaka District Hospital". */
  homeFacility?: string | null
}

export type ProfileContact = {
  email: string | null
  emailVerified: boolean
  phoneNumber: string | null
  allowNotify: boolean
}

/** The user and their contact details; a user without contact details has `null`. */
export type Profile = {
  user: ProfileUser
  contact: ProfileContact | null
}

const requiredText = (message: string) => z.string().trim().min(1, message)

export const profileFormSchema = z.object({
  firstName: requiredText("Enter a first name."),
  lastName: requiredText("Enter a last name."),
  email: z
    .string()
    .trim()
    .refine(
      (email) => email === "" || z.email().safeParse(email).success,
      "Enter a valid email address."
    ),
  phoneNumber: z.string(),
  allowNotify: z.boolean(),
})

export type ProfileFormValues = z.input<typeof profileFormSchema>

export function toProfileFormValues({
  user,
  contact,
}: Profile): ProfileFormValues {
  return {
    firstName: user.firstName,
    lastName: user.lastName,
    email: contact?.email ?? "",
    phoneNumber: contact?.phoneNumber ?? "",
    allowNotify: contact?.allowNotify ?? false,
  }
}

const orNull = (value: string) => value.trim() || null

/** Which parts of the profile the form changed, so a save sends only those. */
export function profileChanges(
  { user, contact }: Profile,
  values: ProfileFormValues
) {
  const email = orNull(values.email) !== (contact?.email ?? null)
  return {
    user:
      values.firstName.trim() !== user.firstName ||
      values.lastName.trim() !== user.lastName,
    contact:
      email ||
      orNull(values.phoneNumber) !== (contact?.phoneNumber ?? null) ||
      values.allowNotify !== (contact?.allowNotify ?? false),
    email,
  }
}

/** The profile as a successful save leaves it; a new email waits for its link, so the old one stays. */
export function applySaved(
  profile: Profile,
  values: ProfileFormValues
): Profile {
  const email = orNull(values.email)
  return {
    user: {
      ...profile.user,
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
    },
    contact: {
      email: profile.contact?.email ?? null,
      emailVerified: profile.contact?.emailVerified ?? false,
      phoneNumber: orNull(values.phoneNumber),
      // Nothing can be sent without an address, as the legacy UI has it.
      allowNotify: values.allowNotify && email !== null,
    },
  }
}

/** How many fields differ from the saved profile, e.g. for a discard prompt. */
export function countProfileChanges(
  profile: Profile,
  values: ProfileFormValues
): number {
  const saved = toProfileFormValues(profile)
  const keys = Object.keys(saved) as (keyof ProfileFormValues)[]
  return keys.filter((key) => {
    const before = saved[key]
    const after = values[key]
    return typeof before === "string" && typeof after === "string"
      ? before.trim() !== after.trim()
      : before !== after
  }).length
}
