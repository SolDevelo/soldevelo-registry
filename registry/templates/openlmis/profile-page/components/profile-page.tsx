"use client"

import { KeyRoundIcon, UserRoundIcon } from "lucide-react"
import { useMemo, useState } from "react"
import { createPortal } from "react-dom"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChangePasswordDialog } from "@/registry/blocks/openlmis/change-password-dialog/change-password-dialog"
import {
  applySaved,
  profileChanges,
} from "@/registry/blocks/openlmis/profile-basic-information/profile"
import { ProfileBasicInformation } from "@/registry/blocks/openlmis/profile-basic-information/profile-basic-information"
import {
  type FormActionState as ProfileFormActions,
  FormActions as ProfileFormButtons,
} from "@/registry/components/openlmis/form-actions/form-actions"
import { ProfileNotificationSettings } from "@/registry/blocks/openlmis/profile-notification-settings/profile-notification-settings"
import {
  assignmentKey,
  byId,
  countByType,
  ROLE_TABS,
  type RoleTab,
  toRoleRows,
} from "@/registry/blocks/openlmis/role-assignments-table/role-assignments"
import { RoleAssignmentsTable } from "@/registry/blocks/openlmis/role-assignments-table/role-assignments-table"
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
import { Callout } from "@/registry/components/openlmis/callout/callout"
import { DiscardChangesDialog } from "@/registry/components/openlmis/discard-changes-dialog/discard-changes-dialog"
import { PageBreadcrumbs } from "@/registry/components/openlmis/page-breadcrumbs/page-breadcrumbs"
import {
  WorkspaceTabs,
  WorkspaceTabsContent,
  WorkspaceTabsList,
  WorkspaceTabsTrigger,
} from "@/registry/components/openlmis/workspace-tabs/workspace-tabs"

import {
  MOCK_ASSIGNMENTS,
  MOCK_DIGEST_CONFIGURATIONS,
  MOCK_FACILITIES,
  MOCK_HOME_FACILITY_ID,
  MOCK_NODES,
  MOCK_PROFILE,
  MOCK_PROGRAMS,
  MOCK_ROLES,
  MOCK_SUBSCRIPTIONS,
} from "./mock-profile"

const PROFILE_TABS = [
  { value: "basic", label: "Basic Information" },
  { value: "roles", label: "Role Assignments" },
  { value: "notifications", label: "Notification Settings" },
] as const

type ProfileTab = (typeof PROFILE_TABS)[number]["value"]

/** Leaving the open tab, or signing out after a new password, both lose unsaved changes. */
type Leaving = { kind: "tab"; tab: ProfileTab } | { kind: "sign-out" }

type Notice = { title: string; description: string }

/** The signed-in user's profile screen; mount it from any route, e.g. the `page.tsx` this template ships. */
export function ProfilePage() {
  const [profile, setProfile] = useState(MOCK_PROFILE)
  const [profileRevision, setProfileRevision] = useState(0)
  const [subscriptions, setSubscriptions] = useState(MOCK_SUBSCRIPTIONS)
  const [pendingEmail, setPendingEmail] = useState<string | null>(null)
  const [tab, setTab] = useState<ProfileTab>("basic")
  const [changes, setChanges] = useState(0)
  const [leaving, setLeaving] = useState<Leaving>()
  const [passwordOpen, setPasswordOpen] = useState(false)
  const [notice, setNotice] = useState<Notice>()
  // The footer's buttons belong to the open tab's form, so the tab renders them into it.
  const [footer, setFooter] = useState<HTMLDivElement | null>(null)
  const { user } = profile

  const openTab = (next: ProfileTab) => {
    // Inactive tabs unmount, so switching throws the open form's changes away.
    setChanges(0)
    setNotice(undefined)
    setTab(next)
  }
  const signOut = () => {
    setProfileRevision((revision) => revision + 1)
    setChanges(0)
    setPasswordOpen(false)
    setNotice({
      title: "Password Changed",
      description: "Sign in with your new password.",
    })
  }
  const toFooter = (saveLabel: string) => (actions: ProfileFormActions) =>
    footer &&
    createPortal(
      <ProfileFormButtons actions={actions} saveLabel={saveLabel} />,
      footer
    )

  return (
    // One column, so the footer sits under the page wherever this renders.
    <div className="flex w-full flex-1 flex-col">
      <Workspace width="narrow">
        <PageBreadcrumbs
          items={[{ label: "Home", href: "#" }, { label: "Profile" }]}
        />
        <WorkspaceHeader>
          <WorkspaceHeading>
            <WorkspaceIcon>
              <UserRoundIcon />
            </WorkspaceIcon>
            <WorkspaceTitle>Profile</WorkspaceTitle>
            <WorkspaceDescription>
              Signed in as {user.username}.
            </WorkspaceDescription>
          </WorkspaceHeading>
          <WorkspaceActions>
            <Button
              onClick={() => setPasswordOpen(true)}
              size="lg"
              variant="outline"
            >
              <KeyRoundIcon data-icon="inline-start" />
              Change Password
            </Button>
          </WorkspaceActions>
        </WorkspaceHeader>
        <WorkspaceContent>
          {notice && (
            <Callout title={notice.title} tone="success">
              {notice.description}
            </Callout>
          )}
          <WorkspaceTabs
            onValueChange={(value) => {
              const next = value as ProfileTab
              if (changes > 0) setLeaving({ kind: "tab", tab: next })
              else openTab(next)
            }}
            value={tab}
          >
            <WorkspaceTabsList label="Profile Sections">
              {PROFILE_TABS.map((item) => (
                <WorkspaceTabsTrigger key={item.value} value={item.value}>
                  {item.label}
                </WorkspaceTabsTrigger>
              ))}
            </WorkspaceTabsList>
            <WorkspaceTabsContent value="basic">
              <ProfileBasicInformation
                key={profileRevision}
                onCancel={() => setNotice(undefined)}
                onChangesChange={setChanges}
                onResendEmail={() =>
                  setNotice({
                    title: "Verification Link Sent",
                    description: `A new verification link is on its way to ${pendingEmail}.`,
                  })
                }
                onSubmit={(values, current) => {
                  const newEmail = profileChanges(current, values).email
                    ? values.email.trim()
                    : ""
                  if (newEmail) setPendingEmail(newEmail)
                  setProfile(applySaved(current, values))
                  setProfileRevision((revision) => revision + 1)
                  setNotice({
                    title: "Profile Saved",
                    description: newEmail
                      ? `Open the link sent to ${newEmail} to start using it.`
                      : "Your profile is up to date.",
                  })
                }}
                pendingEmail={pendingEmail}
                profile={profile}
                renderActions={toFooter("Save Profile")}
              />
            </WorkspaceTabsContent>
            <WorkspaceTabsContent value="roles">
              <ProfileRoles />
            </WorkspaceTabsContent>
            <WorkspaceTabsContent value="notifications">
              <ProfileNotificationSettings
                key={profileRevision}
                onCancel={() => setNotice(undefined)}
                configurations={MOCK_DIGEST_CONFIGURATIONS}
                hasContactDetails={profile.contact !== null}
                onChangesChange={setChanges}
                onSubmit={(next) => {
                  setSubscriptions(next)
                  setNotice({
                    title: "Notification Settings Saved",
                    description:
                      "Your notifications will follow the new settings.",
                  })
                }}
                renderActions={toFooter("Save Settings")}
                subscriptions={subscriptions}
              />
            </WorkspaceTabsContent>
          </WorkspaceTabs>
        </WorkspaceContent>
      </Workspace>
      {tab !== "roles" && (
        <WorkspaceFooter width="narrow">
          <div className="contents" ref={setFooter} />
        </WorkspaceFooter>
      )}

      <ChangePasswordDialog
        onClose={() => setPasswordOpen(false)}
        onSubmit={() => {
          // A new password signs the user out, so unsaved changes on the page are asked about first.
          if (changes > 0) setLeaving({ kind: "sign-out" })
          else signOut()
        }}
        open={passwordOpen}
        user={user}
      />
      <DiscardChangesDialog
        changes={changes}
        confirmLabel={
          leaving?.kind === "sign-out" ? "Discard and Sign Out" : undefined
        }
        onDiscard={() => {
          if (leaving?.kind === "tab") openTab(leaving.tab)
          else signOut()
          setLeaving(undefined)
        }}
        onKeepEditing={() => setLeaving(undefined)}
        open={leaving !== undefined}
        subject="your profile"
      />
    </div>
  )
}

const ALL_READY = { nodes: "ready", facilities: "ready" } as const

/** What the user may do, by role type, read only: an administrator assigns roles. */
function ProfileRoles() {
  const [roleTab, setRoleTab] = useState<RoleTab>(ROLE_TABS[0])
  const lookups = useMemo(
    () => ({
      roles: byId(MOCK_ROLES),
      programs: byId(MOCK_PROGRAMS),
      nodes: byId(MOCK_NODES),
      facilities: byId(MOCK_FACILITIES),
    }),
    []
  )
  const savedKeys = useMemo(
    () => new Set(MOCK_ASSIGNMENTS.map(assignmentKey)),
    []
  )
  const counts = useMemo(
    () => countByType(MOCK_ASSIGNMENTS, lookups.roles),
    [lookups.roles]
  )
  const rows = useMemo(
    () =>
      toRoleRows(MOCK_ASSIGNMENTS, roleTab.type, {
        lookups,
        savedKeys,
        homeFacilityId: MOCK_HOME_FACILITY_ID,
      }),
    [roleTab.type, lookups, savedKeys]
  )

  return (
    <Tabs
      onValueChange={(value) =>
        setRoleTab(ROLE_TABS.find((item) => item.id === value) ?? ROLE_TABS[0])
      }
      value={roleTab.id}
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
          {item.id === roleTab.id && (
            <RoleAssignmentsTable
              // Keyed, so each tab starts its own search, sort and paging.
              key={item.id}
              rows={rows}
              status={ALL_READY}
              tab={item}
            />
          )}
        </TabsContent>
      ))}
    </Tabs>
  )
}
