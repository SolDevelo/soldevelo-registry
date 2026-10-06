import { z } from "zod"

import {
  type Right,
  type RightType,
  type Role,
  roleTypeOf,
} from "@/registry/templates/openlmis/user-roles-page/components/role-assignments-table/role-assignments"

/** The four role types, in the order OpenLMIS shows them, with what each one is for. */
export const ROLE_TYPES = [
  {
    type: "SUPERVISION",
    label: "Supervision",
    description:
      "Rights for managing requisitions, stock and cold chain equipment at supervised facilities.",
  },
  {
    type: "ORDER_FULFILLMENT",
    label: "Fulfillment",
    description:
      "Rights for viewing, transferring and editing orders and shipments at a warehouse.",
  },
  {
    type: "REPORTS",
    label: "Reports",
    description: "Rights for viewing reports and editing their templates.",
  },
  {
    type: "GENERAL_ADMIN",
    label: "Administration",
    description:
      "Rights for managing the system: users, facilities, products, programs and other settings.",
  },
] as const satisfies readonly {
  type: RightType
  label: string
  description: string
}[]

export type RoleTypeInfo = (typeof ROLE_TYPES)[number]

export function roleTypeInfo(type: RightType): RoleTypeInfo {
  return ROLE_TYPES.find((item) => item.type === type) ?? ROLE_TYPES[0]
}

const sameName = (a: string, b: string) =>
  a.trim().toLowerCase() === b.trim().toLowerCase()

/** Role names are unique ignoring case; the role being edited keeps its own. */
export function roleFormSchema(
  roles: readonly Pick<Role, "id" | "name">[],
  editingId?: string
) {
  return z.object({
    type: z.custom<RightType>(),
    name: z
      .string()
      .trim()
      .min(1, "Enter a name.")
      .refine(
        (name) =>
          !roles.some(
            (role) => role.id !== editingId && sameName(role.name, name)
          ),
        "Another role already has this name."
      ),
    description: z.string().trim().min(1, "Enter a description."),
    /** The chosen rights by name, which is unique in OpenLMIS. */
    rights: z.array(z.string()).min(1, "Choose at least one right."),
  })
}

export type RoleFormValues = z.input<ReturnType<typeof roleFormSchema>>

export const EMPTY_ROLE_FORM: RoleFormValues = {
  type: ROLE_TYPES[0].type,
  name: "",
  description: "",
  rights: [],
}

/** Only the rights of the role's type: the form lists no others, and a role holds one type. */
export function toRoleFormValues(role: Role): RoleFormValues {
  // A role saved without rights has no type yet, so it starts on the first one.
  const type = roleTypeOf(role) ?? ROLE_TYPES[0].type
  return {
    type,
    name: role.name,
    description: role.description ?? "",
    rights: role.rights
      .filter((right) => right.type === type)
      .map((right) => right.name),
  }
}

/** Rights of another type than the role's, which a save through this form drops. */
export function otherTypeRights(role: Role | undefined): Right[] {
  const type = roleTypeOf(role)
  return role?.rights.filter((right) => right.type !== type) ?? []
}

/** Changing a role changes what everyone who holds it can do, so that is asked first. */
export function asksBeforeSaving(role: Role | undefined, holders: number) {
  return role !== undefined && holders > 0
}

/** What the form saves: trimmed text and the chosen rights of the role's type. */
export type RoleFormResult = {
  name: string
  description: string
  rights: Right[]
}

export function toRoleResult(
  values: RoleFormValues,
  rights: readonly Right[]
): RoleFormResult {
  const chosen = new Set(values.rights)
  return {
    name: values.name.trim(),
    description: values.description.trim(),
    rights: rights
      .filter((right) => right.type === values.type && chosen.has(right.name))
      .map(({ name, type }) => ({ name, type })),
  }
}
