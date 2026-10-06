"use client"

import { revalidateLogic } from "@tanstack/react-form"
import { type ReactNode, useId, useMemo, useState } from "react"

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldTitle,
} from "@/components/ui/field"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  type Right,
  type RightType,
  type Role,
  rightLabel,
  roleTypeOf,
} from "@/registry/blocks/openlmis/role-assignments-table/role-assignments"
import { Callout } from "@/registry/components/openlmis/callout/callout"
import {
  FormDialog,
  FormDialogBody,
  FormDialogCancel,
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
import {
  FieldLabelText,
  FieldSkeleton,
  SkeletonLine,
} from "@/registry/components/openlmis/form-fields/form-fields"

import {
  asksBeforeSaving,
  EMPTY_ROLE_FORM,
  otherTypeRights,
  ROLE_TYPES,
  type RoleFormResult,
  type RoleFormValues,
  roleFormSchema,
  roleTypeInfo,
  toRoleFormValues,
  toRoleResult,
} from "./role-form"

/** `new` to create a role, or the id of the role to edit. */
export type RoleFormDialogTarget = "new" | (string & {})

type RoleFormDialogProps = {
  /** Opens the dialog while set. */
  target: RoleFormDialogTarget | undefined
  /** The role being edited; a skeleton shows until it is set. */
  role?: Role | undefined
  /** Every role, so a name already taken is refused. */
  roles: readonly Pick<Role, "id" | "name">[]
  /** Every right of every type; the rights field shows a skeleton until it is set. */
  rights: readonly Right[] | undefined
  /** How many users hold the role; saving a role in use asks first. */
  holders?: number
  /** Without it, the dialog says creating and editing roles needs rights the user lacks. */
  canEdit?: boolean
  /** The role to edit no longer exists. */
  notFound?: boolean
  /** Called with the trimmed values; save them, then clear `target` to close. */
  onSubmit: (result: RoleFormResult, role: Role | undefined) => void
  /** Keeps the dialog open and shows a spinner while the role is saved. */
  pending?: boolean
  /** Shown above the fields, e.g. why the save failed. */
  error?: ReactNode
  /** Names a right from its code; defaults to the code in words, e.g. "Requisition Approve". */
  formatRight?: (name: string) => string
  onClose: () => void
}

export function RoleFormDialog({
  target,
  role,
  roles,
  rights,
  holders = 0,
  canEdit = true,
  notFound = false,
  onSubmit,
  pending = false,
  error,
  formatRight = rightLabel,
  onClose,
}: RoleFormDialogProps) {
  const { shown, dialogProps } = useDialogTarget(target, onClose)
  const isNew = shown === "new"
  const title = isNew ? "Create Role" : "Edit Role"

  return (
    <FormDialog {...dialogProps(pending)}>
      {shown &&
        (!canEdit ? (
          <MessageContent
            message="Creating and editing roles needs Manage User Roles and View Rights. Ask an administrator if you need them."
            title={title}
          />
        ) : notFound && !isNew ? (
          <MessageContent message="This role no longer exists." title={title} />
        ) : !isNew && role === undefined ? (
          <RoleFormSkeleton submitLabel="Save Changes" title={title} />
        ) : (
          <RoleForm
            error={error}
            formatRight={formatRight}
            holders={holders}
            // Keyed, so opening another role starts a fresh form.
            key={role?.id ?? "new"}
            onSubmit={onSubmit}
            pending={pending}
            rights={rights}
            role={isNew ? undefined : role}
            roles={roles}
          />
        ))}
    </FormDialog>
  )
}

type RoleFormProps = Pick<
  RoleFormDialogProps,
  "roles" | "rights" | "onSubmit" | "error"
> & {
  role: Role | undefined
  holders: number
  pending: boolean
  formatRight: (name: string) => string
}

function RoleForm({
  role,
  roles,
  rights,
  holders,
  onSubmit,
  pending,
  error,
  formatRight,
}: RoleFormProps) {
  const schema = useMemo(
    () => roleFormSchema(roles, role?.id),
    [roles, role?.id]
  )
  const [confirming, setConfirming] = useState<RoleFormValues>()
  // The type of a saved role is fixed, since its holders' assignments are shaped for it.
  const typeLocked = roleTypeOf(role) !== undefined
  const dropped = otherTypeRights(role)
  const submit = (values: RoleFormValues) =>
    onSubmit(toRoleResult(values, rights ?? []), role)

  const form = useAppForm({
    defaultValues: role ? toRoleFormValues(role) : EMPTY_ROLE_FORM,
    // Quiet until the first submit, then each field re-checks as it is corrected.
    validationLogic: revalidateLogic({
      mode: "submit",
      modeAfterSubmission: "change",
    }),
    validators: { onDynamic: schema },
    onSubmit: ({ value }) =>
      asksBeforeSaving(role, holders) ? setConfirming(value) : submit(value),
  })

  return (
    <FormDialogForm onSubmit={form.handleSubmit}>
      <FormDialogHeader>
        <FormDialogTitle>{role ? "Edit Role" : "Create Role"}</FormDialogTitle>
        <FormDialogDescription>
          {role
            ? `Details for ${role.name}.`
            : "Pick a type, then name the role and choose its rights."}
        </FormDialogDescription>
      </FormDialogHeader>
      <FormDialogBody>
        {/* Rights belong to one type, so changing it starts the choice of rights over. */}
        <form.AppField
          listeners={{ onChange: () => form.setFieldValue("rights", []) }}
          name="type"
        >
          {(field) => (
            <RoleTypeTabs
              locked={typeLocked}
              onChange={field.handleChange}
              type={field.state.value}
            >
              <FieldGroup>
                {error && (
                  <FormDialogError
                    description={error}
                    title="Could Not Save Role"
                  />
                )}
                {dropped.length > 0 && (
                  <Callout title="Rights Of Another Type" tone="warning">
                    {otherTypeMessage(
                      dropped.map((right) => formatRight(right.name))
                    )}
                  </Callout>
                )}
                <form.AppField name="name">
                  {(name) => (
                    <name.TextField autoComplete="off" label="Name" required />
                  )}
                </form.AppField>
                <form.AppField name="description">
                  {(description) => (
                    <description.TextareaField label="Description" required />
                  )}
                </form.AppField>
                {rights === undefined ? (
                  <FieldSkeleton label="Rights" required />
                ) : (
                  <form.AppField name="rights">
                    {(rightsField) => {
                      const items = rightItems(
                        rights,
                        field.state.value,
                        formatRight
                      )
                      const selected = items.filter((item) =>
                        rightsField.state.value.includes(item.value)
                      ).length
                      return (
                        <rightsField.MultiComboboxField
                          description={`${selected} of ${items.length} selected.`}
                          emptyMessage="No rights found."
                          items={items}
                          label="Rights"
                          placeholder="Search Rights..."
                          removeLabel={(label) => `Remove ${label}`}
                          required
                        />
                      )
                    }}
                  </form.AppField>
                )}
              </FieldGroup>
            </RoleTypeTabs>
          )}
        </form.AppField>
      </FormDialogBody>
      <FormDialogFooter>
        <FormDialogCancel disabled={pending} />
        <FormDialogSubmit disabled={rights === undefined} pending={pending}>
          {role ? "Save Changes" : "Create Role"}
        </FormDialogSubmit>
      </FormDialogFooter>
      <AlertDialog
        onOpenChange={(open) => !open && setConfirming(undefined)}
        open={Boolean(confirming)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change A Role In Use?</AlertDialogTitle>
            <AlertDialogDescription>
              {holders === 1 ? "1 user has" : `${holders} users have`}{" "}
              {role?.name}. Saving changes what they can do right away.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button
              onClick={() => {
                if (confirming) submit(confirming)
                setConfirming(undefined)
              }}
            >
              Save Changes
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </FormDialogForm>
  )
}

function rightItems(
  rights: readonly Right[],
  type: RightType,
  formatRight: (name: string) => string
) {
  return (
    rights
      .filter((right) => right.type === type)
      .map((right) => ({ value: right.name, label: formatRight(right.name) }))
      // oxlint-disable-next-line unicorn/no-array-sort -- sorts the fresh mapped array
      .sort((a, b) => a.label.localeCompare(b.label))
  )
}

function otherTypeMessage(labels: string[]) {
  const list = labels.join(", ")
  return labels.length === 1
    ? `This role also holds a right of another type, ${list}. Saving removes it, since a role holds rights of one type.`
    : `This role also holds ${labels.length} rights of another type: ${list}. Saving removes them, since a role holds rights of one type.`
}

type RoleTypeTabsProps = {
  type: RightType
  locked: boolean
  onChange: (type: RightType) => void
  children: ReactNode
}

function RoleTypeTabs({ type, locked, onChange, children }: RoleTypeTabsProps) {
  const id = useId()

  return (
    <Tabs
      className="gap-4"
      onValueChange={(value) => onChange(value as RightType)}
      value={type}
    >
      <Field className="gap-2">
        <FieldTitle id={`${id}-label`}>
          <FieldLabelText label="Role Type" required />
        </FieldTitle>
        {/* Its own container, so the four tabs go two by two when the dialog is narrow. */}
        <div className="@container">
          <TabsList
            aria-describedby={`${id}-description`}
            aria-labelledby={`${id}-label`}
            className="grid w-full grid-cols-2 group-data-horizontal/tabs:h-auto @md:flex @md:group-data-horizontal/tabs:h-8"
          >
            {ROLE_TYPES.map((item) => (
              <TabsTrigger
                disabled={locked && item.type !== type}
                key={item.type}
                value={item.type}
              >
                {item.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        <FieldDescription id={`${id}-description`}>
          {roleTypeInfo(type).description}
        </FieldDescription>
      </Field>
      {/* Not a tab stop of its own: the fields inside it take focus. */}
      <TabsContent tabIndex={-1} value={type}>
        {children}
      </TabsContent>
    </Tabs>
  )
}

function MessageContent({
  title,
  message,
}: {
  title: string
  message: string
}) {
  return (
    <>
      <FormDialogHeader>
        <FormDialogTitle>{title}</FormDialogTitle>
        <FormDialogDescription>{message}</FormDialogDescription>
      </FormDialogHeader>
      <FormDialogFooter>
        <FormDialogCancel>Close</FormDialogCancel>
      </FormDialogFooter>
    </>
  )
}

/** Laid out like the form, so nothing moves when the role arrives. */
export function RoleFormSkeleton({
  title,
  submitLabel,
}: {
  title: string
  submitLabel: string
}) {
  return (
    <>
      <FormDialogHeader>
        <FormDialogTitle>{title}</FormDialogTitle>
        <SkeletonLine />
      </FormDialogHeader>
      <FormDialogBody>
        <div aria-busy className="flex flex-col gap-4">
          <Field className="gap-2">
            <FieldTitle>
              <FieldLabelText label="Role Type" required />
            </FieldTitle>
            <div className="@container">
              <Skeleton className="h-15 w-full @md:h-8" />
            </div>
            <SkeletonLine />
          </Field>
          <FieldGroup>
            <FieldSkeleton label="Name" required />
            <FieldSkeleton label="Description" required />
            <FieldSkeleton label="Rights" required />
          </FieldGroup>
        </div>
      </FormDialogBody>
      <FormDialogFooter>
        <FormDialogCancel />
        <FormDialogSubmit disabled>{submitLabel}</FormDialogSubmit>
      </FormDialogFooter>
    </>
  )
}
