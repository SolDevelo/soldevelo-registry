"use client"

import {
  type ColumnVisibilityState,
  functionalUpdate,
  useTable,
} from "@tanstack/react-table"
import { PlusIcon, SearchXIcon, UsersIcon } from "lucide-react"
import { useCallback, useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { PageBreadcrumbs } from "@/registry/components/openlmis/page-breadcrumbs/page-breadcrumbs"
import {
  DataTable,
  DataTableEmpty,
  DataTableError,
  DataTablePagination,
  DataTableSkeleton,
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
import {
  Workspace,
  WorkspaceContent,
  WorkspaceDescription,
  WorkspaceHeader,
  WorkspaceHeading,
  WorkspaceIcon,
  WorkspaceTitle,
} from "@/registry/blocks/openlmis/workspace/workspace"
import { ColumnViewOptions } from "@/registry/components/openlmis/column-view-options/column-view-options"
import { SearchInput } from "@/registry/components/openlmis/search-input/search-input"
import { SelectFilter } from "@/registry/components/openlmis/select-filter/select-filter"
import {
  type PasswordDialogTarget,
  ResetPasswordDialog,
} from "@/registry/blocks/openlmis/reset-password-dialog/reset-password-dialog"
import {
  UserFormDialog,
  type UserFormDialogTarget,
} from "@/registry/blocks/openlmis/user-form-dialog/user-form-dialog"

import {
  fetchFacilities,
  fetchUser,
  saveUser,
  sendResetEmail,
  setPassword,
  type User,
  type UsersQuery,
} from "./mock-users"
import { createUserColumns, HIDEABLE_COLUMNS } from "./user-columns"
import { useUserList } from "./use-user-list"

const NO_USERS: User[] = []

const getRowId = (user: User) => user.id

// One dialog at a time: adding a user hands over to Set Password rather than stacking a second dialog.
type OpenDialog =
  | { kind: "user"; target: UserFormDialogTarget }
  | { kind: "password"; target: PasswordDialogTarget }

/** The whole users list screen; mount it from any route, e.g. the `page.tsx` this template ships. */
export function ListPage() {
  const list = useUserList()
  const { query, update, retry: refresh } = list
  const [dialog, setDialog] = useState<OpenDialog>()
  const closeDialog = () => setDialog(undefined)
  // Stable, so the columns built from them keep their identity between renders.
  const onEdit = useCallback(
    (userId: string) => setDialog({ kind: "user", target: userId }),
    []
  )
  const onResetPassword = useCallback(
    (userId: string) =>
      setDialog({ kind: "password", target: { userId, created: false } }),
    []
  )
  const columns = useMemo(
    () => createUserColumns({ onEdit, onResetPassword }),
    [onEdit, onResetPassword]
  )
  const [measureContent, contentSize] = useContainerSize<HTMLDivElement>()
  // Kept for the visit only; store it (e.g. in localStorage) to remember it across visits.
  const columnChoices = useState<ColumnVisibilityState>({})
  const columnView = useColumnVisibility(
    HIDEABLE_COLUMNS,
    columnChoices,
    contentSize
  )

  const pagination = { pageIndex: query.pageIndex, pageSize: query.pageSize }
  // Memoized: the table compares controlled state by reference and would reset it every render.
  const sorting = useMemo(
    () => [{ id: query.sortBy, desc: query.sortDesc }],
    [query.sortBy, query.sortDesc]
  )

  const table = useTable({
    features: dataTableFeatures,
    columns,
    data: list.data?.rows ?? NO_USERS,
    getRowId,
    rowCount: list.data?.total ?? 0,
    manualPagination: true,
    manualSorting: true,
    enableSortingRemoval: false,
    state: { pagination, sorting, columnVisibility: columnView.visibility },
    onPaginationChange: (updater) =>
      update(functionalUpdate(updater, pagination)),
    onSortingChange: (updater) => {
      const [next] = functionalUpdate(updater, sorting)
      if (next)
        update({ sortBy: next.id as UsersQuery["sortBy"], sortDesc: next.desc })
    },
  })

  return (
    <Workspace>
      <PageBreadcrumbs
        items={[
          { label: "Home", href: "#" },
          { label: "Administration" },
          { label: "Users" },
        ]}
      />
      <WorkspaceHeader>
        <WorkspaceHeading>
          <WorkspaceIcon>
            <UsersIcon />
          </WorkspaceIcon>
          <WorkspaceTitle>Users</WorkspaceTitle>
          <WorkspaceDescription>
            Accounts that can sign in to OpenLMIS.
          </WorkspaceDescription>
        </WorkspaceHeading>
      </WorkspaceHeader>
      <WorkspaceContent>
        {/* Measured, because the room for columns depends on a sidebar as well as the window. */}
        <div className="flex flex-col gap-4" ref={measureContent}>
          <ListToolbar>
            <ListToolbarSearch>
              <SearchInput
                label="Search by username, name or email"
                onValueChange={(search) => update({ search })}
                value={query.search}
              />
            </ListToolbarSearch>
            <ListToolbarFilter>
              <SelectFilter
                label="Status"
                onValueChange={(status) =>
                  update({ status: status as UsersQuery["status"] })
                }
                options={[
                  { value: "active", label: "Active" },
                  { value: "inactive", label: "Inactive" },
                ]}
                value={query.status}
              />
            </ListToolbarFilter>
            <ListToolbarEnd>
              <ColumnViewOptions
                columns={HIDEABLE_COLUMNS}
                onReset={columnView.onReset}
                onVisibilityChange={columnView.onVisibilityChange}
                visibility={columnView.visibility}
              />
              <Button
                onClick={() => setDialog({ kind: "user", target: "new" })}
              >
                <PlusIcon data-icon="inline-start" />
                Add User
              </Button>
            </ListToolbarEnd>
          </ListToolbar>

          {list.error ? (
            <DataTableError
              description="Check your connection and try again."
              onRetry={list.retry}
              title="Could Not Load Users"
            />
          ) : list.data === undefined ? (
            <DataTableSkeleton rowCount={query.pageSize} table={table} />
          ) : (
            <DataTable
              empty={
                list.isFiltered ? (
                  <DataTableEmpty
                    action={
                      <Button onClick={list.clearFilters} variant="destructive">
                        Clear Filters
                      </Button>
                    }
                    description="Try a different search or clear the filters."
                    icon={<SearchXIcon />}
                    title="No Matching Users"
                  />
                ) : (
                  <DataTableEmpty
                    description="Users added to OpenLMIS appear here."
                    icon={<UsersIcon />}
                    title="No Users Yet"
                  />
                )
              }
              footer={
                list.data.total > 0 && <DataTablePagination table={table} />
              }
              isStale={list.isStale}
              table={table}
            />
          )}
        </div>
      </WorkspaceContent>

      <UserFormDialog
        loadFacilities={fetchFacilities}
        loadUser={fetchUser}
        onClose={closeDialog}
        onCreated={(userId) =>
          setDialog({ kind: "password", target: { userId, created: true } })
        }
        saveUser={async (values, existing) => {
          const userId = await saveUser(values, existing)
          refresh()
          return userId
        }}
        target={dialog?.kind === "user" ? dialog.target : undefined}
      />
      <ResetPasswordDialog
        loadUser={fetchUser}
        onClose={closeDialog}
        sendResetEmail={sendResetEmail}
        setPassword={setPassword}
        target={dialog?.kind === "password" ? dialog.target : undefined}
      />
    </Workspace>
  )
}
