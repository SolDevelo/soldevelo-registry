"use client"

import { revalidateLogic } from "@tanstack/react-form"
import { useMemo } from "react"

import { FieldGroup } from "@/components/ui/field"
import {
  type Facility,
  type Program,
  type RightType,
  type Role,
  type RoleAssignment,
  rightLabel,
  roleTypeOf,
  type SupervisoryNode,
} from "@/registry/blocks/openlmis/role-assignments-table/role-assignments"
import {
  FormDialog,
  FormDialogBody,
  FormDialogCancel,
  FormDialogDescription,
  FormDialogFooter,
  FormDialogForm,
  FormDialogHeader,
  FormDialogSubmit,
  FormDialogTitle,
} from "@/registry/components/openlmis/form-dialog/form-dialog"
import { Callout } from "@/registry/components/openlmis/callout/callout"
import { useDialogTarget } from "@/registry/components/openlmis/form-dialog/use-dialog-target"
import { useAppForm } from "@/registry/components/openlmis/form-fields/form"
import {
  ComboboxField,
  FieldSkeleton,
} from "@/registry/components/openlmis/form-fields/form-fields"

import {
  EMPTY_ROLE_FORM,
  type RoleFormValues,
  roleFormSchema,
  toRoleAssignment,
} from "./role-form"

const TYPE_LABEL: Record<RightType, string> = {
  SUPERVISION: "Supervision",
  ORDER_FULFILLMENT: "Fulfillment",
  REPORTS: "Reports",
  GENERAL_ADMIN: "Administration",
}

/** The dialog's choices; a list left undefined shows a skeleton in its field. */
export type AddRoleOptions = {
  roles: readonly Role[] | undefined
  programs: readonly Program[] | undefined
  nodes: readonly SupervisoryNode[] | undefined
  facilities: readonly Facility[] | undefined
}

type AddRoleDialogProps = AddRoleOptions & {
  /** The type of role being added; the dialog is open while it is set. */
  type: RightType | undefined
  /** The roles the user holds now, so the same one cannot be added twice. */
  assigned: readonly RoleAssignment[]
  username: string
  hasHomeFacility: boolean
  onAdd: (assignment: RoleAssignment) => void
  onClose: () => void
}

export function AddRoleDialog({ type, onClose, ...props }: AddRoleDialogProps) {
  const { shown, dialogProps } = useDialogTarget(type, onClose)

  return (
    <FormDialog {...dialogProps()}>
      {shown && (
        <AddRoleContent key={shown} onDone={onClose} type={shown} {...props} />
      )}
    </FormDialog>
  )
}

type ContentProps = Omit<AddRoleDialogProps, "type" | "onClose"> & {
  type: RightType
  onDone: () => void
}

const byName = <T extends { name: string }>(a: T, b: T) =>
  a.name.localeCompare(b.name)

function AddRoleContent({ roles, ...props }: ContentProps) {
  const { type, username } = props
  const ofType = useMemo(
    () =>
      // oxlint-disable-next-line unicorn/no-array-sort -- sorts the fresh filtered array
      roles?.filter((role) => roleTypeOf(role) === type).sort(byName),
    [roles, type]
  )

  if (!ofType) {
    return (
      <>
        <AddRoleHeader type={type} username={username} />
        <FormDialogBody>
          <div aria-busy>
            <FieldGroup>
              {type === "SUPERVISION" && (
                <FieldSkeleton label="Program" required />
              )}
              <FieldSkeleton label="Role" required />
            </FieldGroup>
          </div>
        </FormDialogBody>
        <FormDialogFooter>
          <FormDialogCancel />
          <FormDialogSubmit disabled>Add Role</FormDialogSubmit>
        </FormDialogFooter>
      </>
    )
  }
  return <AddRoleForm {...props} roles={ofType} />
}

function AddRoleHeader({
  type,
  username,
}: {
  type: RightType
  username: string
}) {
  return (
    <FormDialogHeader>
      <FormDialogTitle>Add {TYPE_LABEL[type]} Role</FormDialogTitle>
      <FormDialogDescription>
        Choose a {TYPE_LABEL[type].toLowerCase()} role to grant to {username}.
      </FormDialogDescription>
    </FormDialogHeader>
  )
}

function AddRoleForm({
  type,
  roles,
  assigned,
  username,
  hasHomeFacility,
  onAdd,
  onDone,
  programs,
  nodes,
  facilities,
}: Omit<ContentProps, "roles"> & { roles: Role[] }) {
  const schema = useMemo(() => roleFormSchema(type, assigned), [type, assigned])

  const form = useAppForm({
    // A type with a single role has nothing to choose, so it starts chosen.
    defaultValues: {
      ...EMPTY_ROLE_FORM,
      roleId: roles.length === 1 ? (roles[0]?.id ?? null) : null,
    } satisfies RoleFormValues,
    validationLogic: revalidateLogic({
      mode: "submit",
      modeAfterSubmission: "change",
    }),
    validators: { onDynamic: schema },
    onSubmit: ({ value }) => {
      onAdd(toRoleAssignment(type, value))
      onDone()
    },
  })

  return (
    <FormDialogForm onSubmit={() => void form.handleSubmit()}>
      <AddRoleHeader type={type} username={username} />
      <FormDialogBody>
        <FieldGroup>
          {type === "SUPERVISION" && (
            <>
              <form.AppField name="programId">
                {() => <ProgramField programs={programs} />}
              </form.AppField>
              <form.AppField name="supervisoryNodeId">
                {() => <NodeField facilities={facilities} nodes={nodes} />}
              </form.AppField>
            </>
          )}
          {type === "ORDER_FULFILLMENT" && (
            <form.AppField name="warehouseId">
              {() => <FacilityField facilities={facilities} />}
            </form.AppField>
          )}
          <form.AppField name="roleId">
            {(field) => <RoleField roleId={field.state.value} roles={roles} />}
          </form.AppField>
          {type === "SUPERVISION" && !hasHomeFacility && (
            <form.Subscribe
              selector={(state) => state.values.supervisoryNodeId}
            >
              {(nodeId) =>
                !nodeId && (
                  <Callout title="No Home Facility" tone="warning">
                    Without a supervisory node this role applies at the home
                    facility, and {username} has none, so it grants nothing
                    until one is set.
                  </Callout>
                )
              }
            </form.Subscribe>
          )}
        </FieldGroup>
      </FormDialogBody>
      <FormDialogFooter>
        <FormDialogCancel />
        <FormDialogSubmit>Add Role</FormDialogSubmit>
      </FormDialogFooter>
    </FormDialogForm>
  )
}

/** Hints how many there are, since the list shows the first 50 until the user types. */
const searchHint = (count: number, noun: string) =>
  `Type to search ${count} ${noun}.`

function ProgramField({ programs }: Pick<AddRoleOptions, "programs">) {
  const items = useMemo(() => {
    const sorted = [...(programs ?? [])]
    // oxlint-disable-next-line unicorn/no-array-sort -- sorts a copy
    sorted.sort(byName)
    return sorted.map((program) => ({ value: program.id, label: program.name }))
  }, [programs])
  if (!programs) return <FieldSkeleton label="Program" required />
  return (
    <ComboboxField
      clearLabel="Clear Program"
      emptyMessage="No programs found."
      items={items}
      label="Program"
      placeholder="Search Programs..."
      required
    />
  )
}

/** Each node with its facility, as OpenLMIS names them, e.g. "FP Approval Point (Balaka)". */
function NodeField({
  nodes,
  facilities,
}: Pick<AddRoleOptions, "nodes" | "facilities">) {
  const items = useMemo(() => {
    const names = new Map(
      (facilities ?? []).map((facility) => [facility.id, facility.name])
    )
    // oxlint-disable-next-line unicorn/no-array-sort -- sorts a copy
    return [...(nodes ?? [])].sort(byName).map((node) => {
      const facility = node.facility && names.get(node.facility.id)
      return {
        value: node.id,
        label: facility ? `${node.name} (${facility})` : node.name,
      }
    })
  }, [nodes, facilities])

  if (!nodes || !facilities) return <FieldSkeleton label="Supervisory Node" />
  return (
    <ComboboxField
      clearLabel="Clear Supervisory Node"
      description={`${searchHint(items.length, "nodes")} Leave empty for the home facility.`}
      emptyMessage="No supervisory nodes found."
      items={items}
      label="Supervisory Node"
      placeholder="Search Supervisory Nodes..."
    />
  )
}

function FacilityField({ facilities }: Pick<AddRoleOptions, "facilities">) {
  const items = useMemo(
    () =>
      // oxlint-disable-next-line unicorn/no-array-sort -- sorts a copy
      [...(facilities ?? [])].sort(byName).map((facility) => ({
        value: facility.id,
        label: `${facility.code} - ${facility.name}`,
      })),
    [facilities]
  )
  if (!facilities) return <FieldSkeleton label="Facility" required />
  return (
    <ComboboxField
      clearLabel="Clear Facility"
      description={searchHint(items.length, "facilities")}
      emptyMessage="No facilities found."
      items={items}
      label="Facility"
      placeholder="Search Facilities..."
      required
    />
  )
}

/** The roles of this type; once one is picked, the rights it grants show beneath. */
function RoleField({
  roles,
  roleId,
}: {
  roles: Role[]
  roleId: string | null
}) {
  const items = useMemo(
    () => roles.map((role) => ({ value: role.id, label: role.name })),
    [roles]
  )
  const labels = roles
    .find((role) => role.id === roleId)
    ?.rights.map((right) => rightLabel(right.name))
  // oxlint-disable-next-line unicorn/no-array-sort -- sorts the fresh mapped array
  const rights = labels?.sort().join(", ")

  return (
    <ComboboxField
      clearLabel="Clear Role"
      description={rights && `Grants ${rights}.`}
      emptyMessage="No roles found."
      items={items}
      label="Role"
      placeholder="Search Roles..."
      required
    />
  )
}
