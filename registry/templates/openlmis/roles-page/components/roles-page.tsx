"use client"

import {
  type ColumnVisibilityState,
  functionalUpdate,
  useTable,
} from "@tanstack/react-table"
import { PlusIcon, SearchXIcon, ShieldIcon } from "lucide-react"
import { useCallback, useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  DataTable,
  DataTableEmpty,
  DataTablePagination,
  dataTableFeatures,
} from "@/registry/blocks/openlmis/data-table/data-table"
import {
  useColumnVisibility,
  useContainerSize,
} from "@/registry/blocks/openlmis/data-table/responsive-columns"
import {
  ListToolbar,
  ListToolbarEnd,
  ListToolbarFilter,
  ListToolbarSearch,
} from "@/registry/blocks/openlmis/list-toolbar/list-toolbar"
import type { RightType } from "@/registry/blocks/openlmis/role-assignments-table/role-assignments"
import {
  RoleFormDialog,
  type RoleFormDialogTarget,
} from "@/registry/blocks/openlmis/role-form-dialog/role-form-dialog"
import type { RoleFormResult } from "@/registry/blocks/openlmis/role-form-dialog/role-form"
import { ROLE_TYPES } from "@/registry/blocks/openlmis/role-form-dialog/role-form"
import { RoleRightsDialog } from "@/registry/blocks/openlmis/role-rights-dialog/role-rights-dialog"
import {
  Workspace,
  WorkspaceContent,
  WorkspaceDescription,
  WorkspaceHeader,
  WorkspaceHeading,
  WorkspaceIcon,
  WorkspaceTitle,
} from "@/registry/blocks/openlmis/workspace/workspace"
import { Callout } from "@/registry/components/openlmis/callout/callout"
import { ColumnViewOptions } from "@/registry/components/openlmis/column-view-options/column-view-options"
import { PageBreadcrumbs } from "@/registry/components/openlmis/page-breadcrumbs/page-breadcrumbs"
import { SearchInput } from "@/registry/components/openlmis/search-input/search-input"
import { SelectFilter } from "@/registry/components/openlmis/select-filter/select-filter"

import { type ListedRole, MOCK_RIGHTS, MOCK_ROLES } from "./mock-roles"
import { createRoleColumns, HIDEABLE_COLUMNS } from "./role-columns"
import {
  filterRoles,
  type RoleSortField,
  type RolesQuery,
  sortRoles,
} from "./roles-list"

const INITIAL_QUERY: RolesQuery = {
  search: "",
  type: "",
  sortBy: "name",
  sortDesc: false,
  pageIndex: 0,
  pageSize: 10,
}

const getRowId = (role: ListedRole) => role.id

type OpenDialog =
  | { kind: "role"; target: RoleFormDialogTarget }
  | { kind: "rights"; roleId: string }

type Notice = { title: string; description: string }

type RolesPageProps = {
  /** Whether the user may create and edit roles; without it the list is read only. */
  canEdit?: boolean
  /** Whether the user may see what each role grants. */
  canViewRights?: boolean
}

/** The roles list screen; mount it from any route, e.g. the `page.tsx` this template ships. */
export function RolesPage({
  canEdit = true,
  canViewRights = true,
}: RolesPageProps) {
  const [roles, setRoles] = useState(MOCK_ROLES)
  const [query, setQuery] = useState(INITIAL_QUERY)
  const [dialog, setDialog] = useState<OpenDialog>()
  const [notice, setNotice] = useState<Notice>()
  const closeDialog = () => setDialog(undefined)
  /** A filter or sort starts again from the first page; paging keeps the rest. */
  const update = (patch: Partial<RolesQuery>) => {
    setNotice(undefined)
    setQuery((previous) => ({
      ...previous,
      ...patch,
      pageIndex: "pageIndex" in patch ? (patch.pageIndex ?? 0) : 0,
    }))
  }

  // Stable, so the columns built from them keep their identity between renders.
  const onEdit = useCallback((roleId: string) => {
    setNotice(undefined)
    setDialog({ kind: "role", target: roleId })
  }, [])
  const onViewRights = useCallback((roleId: string) => {
    setNotice(undefined)
    setDialog({ kind: "rights", roleId })
  }, [])
  const columns = useMemo(
    () =>
      createRoleColumns({
        onEdit: canEdit ? onEdit : undefined,
        onViewRights: canViewRights ? onViewRights : undefined,
      }),
    [canEdit, canViewRights, onEdit, onViewRights]
  )
  const [measureContent, contentSize] = useContainerSize<HTMLDivElement>()
  // Kept for the visit only; store it (e.g. in localStorage) to remember it across visits.
  const columnChoices = useState<ColumnVisibilityState>({})
  const columnView = useColumnVisibility(
    HIDEABLE_COLUMNS,
    columnChoices,
    contentSize
  )

  // Every role is in memory, so filtering, sorting and paging happen here.
  const matching = useMemo(
    () => sortRoles(filterRoles(roles, query), query.sortBy, query.sortDesc),
    [roles, query]
  )
  // A filter that leaves fewer pages is held to the last page that exists.
  const lastPage = Math.max(0, Math.ceil(matching.length / query.pageSize) - 1)
  const pagination = useMemo(
    () => ({
      pageIndex: Math.min(query.pageIndex, lastPage),
      pageSize: query.pageSize,
    }),
    [query.pageIndex, query.pageSize, lastPage]
  )
  const data = useMemo(
    () =>
      matching.slice(
        pagination.pageIndex * pagination.pageSize,
        (pagination.pageIndex + 1) * pagination.pageSize
      ),
    [matching, pagination]
  )
  // Memoized: the table compares controlled state by reference and would reset it every render.
  const sorting = useMemo(
    () => [{ id: query.sortBy, desc: query.sortDesc }],
    [query.sortBy, query.sortDesc]
  )

  const table = useTable({
    features: dataTableFeatures,
    columns,
    data,
    getRowId,
    rowCount: matching.length,
    manualPagination: true,
    manualSorting: true,
    enableSortingRemoval: false,
    state: { pagination, sorting, columnVisibility: columnView.visibility },
    onPaginationChange: (updater) =>
      update(functionalUpdate(updater, pagination)),
    onSortingChange: (updater) => {
      const [next] = functionalUpdate(updater, sorting)
      if (next)
        update({ sortBy: next.id as RoleSortField, sortDesc: next.desc })
    },
  })

  const roleTarget = dialog?.kind === "role" ? dialog.target : undefined
  const editing = roles.find((role) => role.id === roleTarget)
  const rightsRole =
    dialog?.kind === "rights"
      ? roles.find((role) => role.id === dialog.roleId)
      : undefined
  const isFiltered = Boolean(query.search || query.type)

  const saveRole = (
    result: RoleFormResult,
    existing: ListedRole | undefined
  ) => {
    if (existing) {
      setRoles((current) =>
        current.map((role) =>
          role.id === existing.id ? { ...role, ...result } : role
        )
      )
      setNotice({
        title: "Role Updated",
        description:
          existing.count === 0
            ? `Changes to ${result.name} are saved.`
            : `Changes to ${result.name} are saved and apply to ${existing.count === 1 ? "1 user" : `${existing.count} users`}.`,
      })
    } else {
      setRoles((current) => [
        ...current,
        { id: `role-${current.length + 1}`, ...result, count: 0 },
      ])
      setNotice({
        title: "Role Created",
        description: `${result.name} is ready to give to users.`,
      })
    }
    closeDialog()
  }

  return (
    <Workspace>
      <PageBreadcrumbs
        items={[
          { label: "Home", href: "#" },
          { label: "Administration" },
          { label: "Roles" },
        ]}
      />
      <WorkspaceHeader>
        <WorkspaceHeading>
          <WorkspaceIcon>
            <ShieldIcon />
          </WorkspaceIcon>
          <WorkspaceTitle>Roles</WorkspaceTitle>
          <WorkspaceDescription>
            Named sets of rights to give to users.
          </WorkspaceDescription>
        </WorkspaceHeading>
      </WorkspaceHeader>
      <WorkspaceContent>
        {/* Measured, because the room for columns depends on a sidebar as well as the window. */}
        <div className="flex flex-col gap-4" ref={measureContent}>
          {notice && (
            <Callout title={notice.title} tone="success">
              {notice.description}
            </Callout>
          )}
          <ListToolbar>
            <ListToolbarSearch>
              <SearchInput
                label="Search by name or description"
                onValueChange={(search) => update({ search })}
                value={query.search}
              />
            </ListToolbarSearch>
            <ListToolbarFilter>
              <SelectFilter
                label="Role Type"
                onValueChange={(type) =>
                  update({ type: type as RightType | "" })
                }
                options={ROLE_TYPES.map((item) => ({
                  value: item.type,
                  label: item.label,
                }))}
                value={query.type}
              />
            </ListToolbarFilter>
            <ListToolbarEnd>
              <ColumnViewOptions
                columns={HIDEABLE_COLUMNS}
                onReset={columnView.onReset}
                onVisibilityChange={columnView.onVisibilityChange}
                visibility={columnView.visibility}
              />
            </ListToolbarEnd>
            {canEdit && (
              <div className="w-full @2xl/main:w-auto">
                <Button
                  className="w-full"
                  onClick={() => {
                    setNotice(undefined)
                    setDialog({ kind: "role", target: "new" })
                  }}
                >
                  <PlusIcon data-icon="inline-start" />
                  Create Role
                </Button>
              </div>
            )}
          </ListToolbar>

          <DataTable
            empty={
              isFiltered ? (
                <DataTableEmpty
                  action={
                    <Button
                      onClick={() => update({ search: "", type: "" })}
                      variant="destructive"
                    >
                      Clear Filters
                    </Button>
                  }
                  description="No role matches these filters."
                  icon={<SearchXIcon />}
                  title="No Matching Roles"
                />
              ) : (
                <DataTableEmpty
                  description="Roles you create appear here."
                  icon={<ShieldIcon />}
                  title="No Roles Yet"
                />
              )
            }
            footer={
              matching.length > 0 && <DataTablePagination table={table} />
            }
            table={table}
          />
        </div>
      </WorkspaceContent>

      <RoleFormDialog
        canEdit={canEdit}
        holders={editing?.count ?? 0}
        onClose={closeDialog}
        onSubmit={(result) => saveRole(result, editing)}
        rights={MOCK_RIGHTS}
        role={editing}
        roles={roles}
        target={roleTarget}
      />
      <RoleRightsDialog onClose={closeDialog} role={rightsRole} />
    </Workspace>
  )
}
