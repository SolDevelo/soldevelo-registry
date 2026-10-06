/** Whose password it is; the OpenLMIS auth service refuses one that contains any of these. */
export type PasswordOwner = {
  username: string
  firstName?: string | null
  lastName?: string | null
}

/** The fixed rules the auth service checks, in the order it reports them; strength is left to the server. */
const PASSWORD_RULES = ["length", "characters", "number", "names"] as const

export type PasswordRule = (typeof PASSWORD_RULES)[number]

export const PASSWORD_RULE_LABELS: Record<PasswordRule, string> = {
  length: "8 to 72 characters",
  characters: "Only letters A to Z and numbers",
  number: "At least 1 number",
  names: "Does not contain the username, first name or last name",
}

const PASSWORD_RULE_ERRORS: Record<PasswordRule, string> = {
  length: "Use 8 to 72 characters.",
  characters:
    "Use only the letters A to Z and numbers, with no spaces or symbols.",
  number: "Include at least 1 number.",
  names: "Leave out the username, first name and last name.",
}

/** The rules that apply; the names rule only when the owner is known. */
export function passwordRules(owner?: PasswordOwner): readonly PasswordRule[] {
  return owner
    ? PASSWORD_RULES
    : PASSWORD_RULES.filter((rule) => rule !== "names")
}

export function passwordChecks(
  password: string,
  owner?: PasswordOwner
): Record<PasswordRule, boolean> {
  const lower = password.toLowerCase()
  const names = [owner?.username, owner?.firstName, owner?.lastName]
    .map((name) => name?.trim().toLowerCase())
    .filter((name): name is string => Boolean(name))
  return {
    length: password.length >= 8 && password.length <= 72,
    characters: /^[a-zA-Z0-9]+$/.test(password),
    number: /\d/.test(password),
    names: password !== "" && names.every((name) => !lower.includes(name)),
  }
}

/** What is wrong with the password: missing, or the first rule it misses. */
export function passwordIssue(
  password: string,
  owner?: PasswordOwner
): string | undefined {
  if (password === "") return "Enter a password."
  const checks = passwordChecks(password, owner)
  const unmet = passwordRules(owner).find((rule) => !checks[rule])
  return unmet && PASSWORD_RULE_ERRORS[unmet]
}
