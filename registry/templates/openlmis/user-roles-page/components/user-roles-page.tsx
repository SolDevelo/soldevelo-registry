"use client"

import { CheckIcon, CopyPlusIcon, InfoIcon, ShieldIcon } from "lucide-react"
import { useCallback, useMemo, useState } from "react"

import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AddRoleDialog } from "@/registry/blocks/openlmis/add-role-dialog/add-role-dialog"
import { ImportRolesDialog } from "@/registry/blocks/openlmis/import-roles-dialog/import-roles-dialog"
import {
  byId,
  countByType,
  type Facility,
  type Program,
  type Role,
  type RoleAssignment,
  type RoleRow,
  ROLE_TABS,
  type RoleTab,
  type SupervisoryNode,
  toRoleRows,
  assignmentKey,
} from "@/registry/blocks/openlmis/role-assignments-table/role-assignments"
import {
  type LookupStatus,
  RoleAssignmentsTable,
} from "@/registry/blocks/openlmis/role-assignments-table/role-assignments-table"
import { RoleRightsDialog } from "@/registry/blocks/openlmis/role-rights-dialog/role-rights-dialog"
import {
  Workspace,
  WorkspaceActions,
  WorkspaceContent,
  WorkspaceDescription,
  WorkspaceFooter,
  WorkspaceHeader,
  WorkspaceHeading,
  WorkspaceIcon,
  WorkspaceTitle,
} from "@/registry/blocks/openlmis/workspace/workspace"
import { DiscardChangesDialog } from "@/registry/components/openlmis/discard-changes-dialog/discard-changes-dialog"
import { PageBreadcrumbs } from "@/registry/components/openlmis/page-breadcrumbs/page-breadcrumbs"

import {
  MOCK_FACILITIES,
  MOCK_NODES,
  MOCK_PROGRAMS,
  MOCK_ROLES,
  MOCK_USER_ID,
  MOCK_USERS,
  type RolesUser,
} from "./mock-roles"
import { useRoleDraft } from "./use-role-draft"

type UserRolesPageProps = {
  /** The user whose roles are edited. */
  user?: RolesUser
  /** Who roles can be imported from. */
  users?: readonly RolesUser[]
  roles?: readonly Role[]
  programs?: readonly Program[]
  /** Leave undefined while they load; their names show as placeholders meanwhile. */
  nodes?: readonly SupervisoryNode[]
  facilities?: readonly Facility[]
  /** Save the roles, e.g. with one request; the draft becomes the saved roles. */
  onSave?: (assignments: RoleAssignment[]) => void
  /** Leave the page, e.g. back to the users list; asked first when there are unsaved changes. */
  onCancel?: () => void
}

type Notice =
  | { kind: "removed"; row: RoleRow }
  | { kind: "imported"; added: number; from: string }
  | { kind: "saved" }

type OpenDialog =
  | { kind: "add"; tab: RoleTab }
  | { kind: "import" }
  | { kind: "rights"; role: Role }
  | { kind: "discard" }

const mockUser = MOCK_USERS.find((candidate) => candidate.id === MOCK_USER_ID)

/** Edit User Roles: one draft across the four role tabs, saved together from the bar at the bottom. */
export function UserRolesPage({
  user = mockUser,
  users = MOCK_USERS,
  roles = MOCK_ROLES,
  programs = MOCK_PROGRAMS,
  nodes = MOCK_NODES,
  facilities = MOCK_FACILITIES,
  onSave,
  onCancel,
}: UserRolesPageProps) {
  // The page needs a user; the mock always has one.
  if (!user) return null
  return (
    <RolesEditor
      facilities={facilities}
      key={user.id}
      nodes={nodes}
      onCancel={onCancel}
      onSave={onSave}
      programs={programs}
      roles={roles}
      user={user}
      users={users}
    />
  )
}

function RolesEditor({
  user,
  users,
  roles,
  programs,
  nodes,
  facilities,
  onSave,
  onCancel,
}: Omit<
  Required<UserRolesPageProps>,
  "onSave" | "onCancel" | "nodes" | "facilities"
> &
  Pick<UserRolesPageProps, "onSave" | "onCancel" | "nodes" | "facilities">) {
  const [saved, setSaved] = useState(user.roleAssignments)
  const draft = useRoleDraft(saved)
  const [tab, setTab] = useState<RoleTab>(ROLE_TABS[0])
  const [dialog, setDialog] = useState<OpenDialog>()
  const [notice, setNotice] = useState<Notice>()
  const closeDialog = () => setDialog(undefined)

  const lookups = useMemo(
    () => ({
      roles: byId(roles),
      programs: byId(programs),
      nodes: nodes && byId(nodes),
      facilities: facilities && byId(facilities),
    }),
    [roles, programs, nodes, facilities]
  )
  const status = useMemo<LookupStatus>(
    () => ({
      nodes: nodes ? "ready" : "pending",
      facilities: facilities ? "ready" : "pending",
    }),
    [nodes, facilities]
  )
  const savedKeys = useMemo(() => new Set(saved.map(assignmentKey)), [saved])
  const rows = useMemo(
    () =>
      toRoleRows(draft.draft, tab.type, {
        lookups,
        savedKeys,
        homeFacilityId: user.homeFacilityId,
      }),
    [draft.draft, tab.type, lookups, savedKeys, user.homeFacilityId]
  )
  const counts = useMemo(
    () => countByType(draft.draft, lookups.roles),
    [draft.draft, lookups.roles]
  )

  const { remove } = draft
  const removeRole = useCallback(
    (row: RoleRow) => {
      remove(row.assignment)
      setNotice({ kind: "removed", row })
    },
    [remove]
  )
  const viewRights = useCallback(
    (roleId: string) => {
      const role = lookups.roles.get(roleId)
      if (role) setDialog({ kind: "rights", role })
    },
    [lookups.roles]
  )

  const save = () => {
    onSave?.(draft.draft)
    setSaved(draft.draft)
    setNotice({ kind: "saved" })
  }
  const cancel = () => {
    if (draft.changes > 0) setDialog({ kind: "discard" })
    else onCancel?.()
  }
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ")

  return (
    // One column, so the bar sits under the page wherever this renders.
    <div className="flex w-full flex-1 flex-col">
      <Workspace>
        <PageBreadcrumbs
          items={[
            { label: "Home", href: "#" },
            { label: "Administration" },
            { label: "Users", href: "#" },
            { label: "Roles" },
          ]}
        />
        <WorkspaceHeader>
          <WorkspaceHeading>
            <WorkspaceIcon>
              <ShieldIcon />
            </WorkspaceIcon>
            <WorkspaceTitle>Roles for {name || user.username}</WorkspaceTitle>
            <WorkspaceDescription>
              What {user.username} can do in OpenLMIS, and where.
            </WorkspaceDescription>
          </WorkspaceHeading>
          <WorkspaceActions>
            <Button
              onClick={() => setDialog({ kind: "import" })}
              size="lg"
              variant="outline"
            >
              <CopyPlusIcon data-icon="inline-start" />
              Import Roles
            </Button>
          </WorkspaceActions>
        </WorkspaceHeader>
        <WorkspaceContent>
          {notice && (
            <NoticeAlert
              notice={notice}
              onUndo={(row) => {
                draft.add(row.assignment)
                setNotice(undefined)
              }}
            />
          )}
          <Tabs
            onValueChange={(value) =>
              setTab(
                ROLE_TABS.find((item) => item.id === value) ?? ROLE_TABS[0]
              )
            }
            value={tab.id}
          >
            {/* A size container, so the tabs go two by two when four do not fit in a row. */}
            <div className="@container/tabs">
              <TabsList
                aria-label="Role types"
                className="grid h-auto w-full grid-cols-2 group-data-horizontal/tabs:h-auto @xl/tabs:flex @xl/tabs:w-fit"
              >
                {ROLE_TABS.map((item) => (
                  <TabsTrigger className="h-7" key={item.id} value={item.id}>
                    {item.label}
                    <Badge variant="secondary">{counts[item.type]}</Badge>
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
            {ROLE_TABS.map((item) => (
              <TabsContent className="pt-2" key={item.id} value={item.id}>
                {item.id === tab.id && (
                  <RoleAssignmentsTable
                    // Keyed, so each tab starts its own search, sort and paging.
                    key={item.id}
                    onAdd={() => setDialog({ kind: "add", tab: item })}
                    onRemove={removeRole}
                    onViewRights={viewRights}
                    rows={rows}
                    status={status}
                    tab={item}
                  />
                )}
              </TabsContent>
            ))}
          </Tabs>
        </WorkspaceContent>
      </Workspace>
      <WorkspaceFooter>
        <Button onClick={cancel} size="lg" variant="outline">
          Cancel
        </Button>
        <Button disabled={draft.changes === 0} onClick={save} size="lg">
          Save Changes
          {draft.changes > 0 && (
            <Badge variant="secondary">
              <span aria-hidden="true">{draft.changes}</span>
              <span className="sr-only">
                {draft.changes === 1
                  ? "1 unsaved change"
                  : `${draft.changes} unsaved changes`}
              </span>
            </Badge>
          )}
        </Button>
      </WorkspaceFooter>

      <AddRoleDialog
        assigned={draft.draft}
        facilities={facilities}
        hasHomeFacility={Boolean(user.homeFacilityId)}
        nodes={nodes}
        onAdd={(assignment) => {
          draft.add(assignment)
          setNotice(undefined)
        }}
        onClose={closeDialog}
        programs={programs}
        roles={roles}
        type={dialog?.kind === "add" ? dialog.tab.type : undefined}
        username={user.username}
      />
      <ImportRolesDialog
        draft={draft.draft}
        onClose={closeDialog}
        onImport={(assignments, from) => {
          const { added } = draft.merge(assignments)
          setNotice({ kind: "imported", added, from })
        }}
        open={dialog?.kind === "import"}
        userId={user.id}
        username={user.username}
        users={users}
      />
      <RoleRightsDialog
        onClose={closeDialog}
        role={dialog?.kind === "rights" ? dialog.role : undefined}
      />
      <DiscardChangesDialog
        changes={draft.changes}
        onDiscard={() => {
          draft.reset()
          setNotice(undefined)
          closeDialog()
          onCancel?.()
        }}
        onKeepEditing={closeDialog}
        open={dialog?.kind === "discard"}
        subject={`the roles of ${user.username}`}
      />
    </div>
  )
}

/** What just happened to the draft, with Undo for a removal; it stays until the next change. */
function NoticeAlert({
  notice,
  onUndo,
}: {
  notice: Notice
  onUndo: (row: RoleRow) => void
}) {
  if (notice.kind === "saved") {
    return (
      <Alert>
        <CheckIcon />
        <AlertTitle>Roles Saved</AlertTitle>
        <AlertDescription>The changes are saved.</AlertDescription>
      </Alert>
    )
  }
  if (notice.kind === "imported") {
    return (
      <Alert>
        <InfoIcon />
        <AlertTitle>Roles Imported</AlertTitle>
        <AlertDescription>
          {notice.added === 1 ? "1 role" : `${notice.added} roles`} added from{" "}
          {notice.from}. Save to keep them.
        </AlertDescription>
      </Alert>
    )
  }
  return (
    <Alert>
      <InfoIcon />
      <AlertTitle>Role Removed</AlertTitle>
      <AlertDescription>
        {notice.row.role ?? "The role"} is removed. Save to keep the change.
      </AlertDescription>
      <AlertAction>
        <Button
          onClick={() => onUndo(notice.row)}
          size="sm"
          type="button"
          variant="outline"
        >
          Undo
        </Button>
      </AlertAction>
    </Alert>
  )
}
