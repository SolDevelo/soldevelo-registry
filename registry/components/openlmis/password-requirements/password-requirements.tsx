import { CheckIcon, CircleIcon } from "lucide-react"

import { cn } from "@/lib/utils"

import {
  PASSWORD_RULE_LABELS,
  type PasswordOwner,
  passwordChecks,
  passwordRules,
} from "./password-rules"

type PasswordRequirementsProps = {
  /** Point the password input's `aria-describedby` here, so the rules are read with it. */
  id?: string
  password: string
  /** Adds the rule against the owner's username and names. */
  owner?: PasswordOwner
}

/** The password rules as a checklist that ticks off each one as the password meets it. */
export function PasswordRequirements({
  id,
  password,
  owner,
}: PasswordRequirementsProps) {
  const checks = passwordChecks(password, owner)

  return (
    <ul
      aria-label="Password Requirements"
      className="grid gap-1 text-sm"
      id={id}
    >
      {passwordRules(owner).map((rule) => {
        const met = checks[rule]
        const Icon = met ? CheckIcon : CircleIcon
        return (
          <li
            className={cn(
              "flex items-center gap-2",
              met ? "text-success" : "text-muted-foreground"
            )}
            key={rule}
          >
            <Icon
              aria-hidden="true"
              className={met ? "size-4 shrink-0" : "mx-0.5 size-3 shrink-0"}
            />
            <span>{PASSWORD_RULE_LABELS[rule]}</span>
            <span className="sr-only">{met ? "(met)" : "(not met yet)"}</span>
          </li>
        )
      })}
    </ul>
  )
}
