import { z } from "zod"

import { type PasswordOwner, passwordIssue } from "./password-rules"

/** The new password, typed twice; with an owner, it may not contain their username or names. */
export function newPasswordSchema(owner?: PasswordOwner) {
  return z
    .object({ password: z.string(), confirm: z.string() })
    .superRefine(({ password, confirm }, context) => {
      const issue = passwordIssue(password, owner)
      if (issue)
        context.addIssue({ code: "custom", path: ["password"], message: issue })
      if (confirm === "") {
        context.addIssue({
          code: "custom",
          path: ["confirm"],
          message: "Type the new password again.",
        })
      } else if (confirm !== password) {
        context.addIssue({
          code: "custom",
          path: ["confirm"],
          message: "The passwords do not match.",
        })
      }
    })
}
