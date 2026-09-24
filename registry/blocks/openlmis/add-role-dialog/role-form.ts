import { z } from "zod"

import {
  assignmentKey,
  type RightType,
  type RoleAssignment,
  toSavedAssignment,
} from "@/registry/blocks/openlmis/role-assignments-table/role-assignments"

const roleFormFields = z.object({
  roleId: z.string().nullable(),
  programId: z.string().nullable(),
  supervisoryNodeId: z.string().nullable(),
  warehouseId: z.string().nullable(),
})

export type RoleFormValues = z.input<typeof roleFormFields>

export const EMPTY_ROLE_FORM: RoleFormValues = {
  roleId: null,
  programId: null,
  supervisoryNodeId: null,
  warehouseId: null,
}

/** The assignment the form describes, with only the ids its type uses. */
export function toRoleAssignment(
  type: RightType,
  values: RoleFormValues
): RoleAssignment {
  return toSavedAssignment({
    roleId: values.roleId ?? "",
    ...(type === "SUPERVISION" && {
      programId: values.programId,
      supervisoryNodeId: values.supervisoryNodeId,
    }),
    ...(type === "ORDER_FULFILLMENT" && { warehouseId: values.warehouseId }),
  })
}

/** Each type needs its own fields; the same role twice, in the same place, is refused. */
export function roleFormSchema(
  type: RightType,
  assigned: readonly RoleAssignment[]
) {
  const assignedKeys = new Set(assigned.map(assignmentKey))

  return roleFormFields.superRefine((values, context) => {
    const require = (path: keyof RoleFormValues, message: string) => {
      if (!values[path])
        context.addIssue({ code: "custom", path: [path], message })
    }
    if (type === "SUPERVISION") require("programId", "Choose a program.")
    if (type === "ORDER_FULFILLMENT")
      require("warehouseId", "Choose a facility.")
    require("roleId", "Choose a role.")

    if (
      values.roleId &&
      assignedKeys.has(assignmentKey(toRoleAssignment(type, values)))
    ) {
      context.addIssue({
        code: "custom",
        path: ["roleId"],
        message: "This user already has this role here.",
      })
    }
  })
}
