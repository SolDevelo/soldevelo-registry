"use client"

import { InfoIcon, LayoutDashboardIcon, PlusIcon } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { ApprovalsTable } from "@/registry/blocks/openlmis/approvals-table/approvals-table"
import { EquipmentStatusCard } from "@/registry/blocks/openlmis/equipment-status/equipment-status"
import { RequisitionStatusMeter } from "@/registry/blocks/openlmis/requisition-status-meter/requisition-status-meter"
import { RequisitionsByPeriod } from "@/registry/blocks/openlmis/requisitions-by-period/requisitions-by-period"
import {
  Workspace,
  WorkspaceActions,
  WorkspaceContent,
  WorkspaceDescription,
  WorkspaceHeader,
  WorkspaceHeading,
  WorkspaceTitle,
} from "@/registry/blocks/openlmis/workspace/workspace"
import { DashboardRow } from "@/registry/components/openlmis/dashboard-card/dashboard-card"
import {
  Stat,
  StatStrip,
} from "@/registry/components/openlmis/stat-strip/stat-strip"

import {
  type DashboardAccess,
  type DashboardData,
  MOCK_ACCESS,
  MOCK_DASHBOARD,
  MOCK_USER,
} from "./mock-dashboard"

const needsAttention = (counts: {
  AWAITING_REPAIR: number
  UNSERVICEABLE: number
}) => counts.AWAITING_REPAIR + counts.UNSERVICEABLE

type HomeDashboardProps = {
  /** Which parts the user's rights allow; the rest stay hidden. */
  access?: DashboardAccess
  data?: DashboardData
  firstName?: string
  /** Opens Add User, e.g. by navigating to the users list. */
  onAddUser?: () => void
}

/** The home screen: a greeting, headline numbers and the cards the user's rights allow. */
export function HomeDashboard({
  access = MOCK_ACCESS,
  data = MOCK_DASHBOARD,
  firstName = MOCK_USER.firstName,
  onAddUser,
}: HomeDashboardProps) {
  const nothingToShow = !Object.entries(access).some(
    ([part, allowed]) => part !== "manageUsers" && allowed
  )

  const stats = [
    access.approve && (
      <Stat
        key="approve"
        label="Requisitions To Approve"
        value={data.approvals.length}
      />
    ),
    access.convert && (
      <Stat
        key="convert"
        label="Requisitions To Convert"
        value={data.convertCount}
      />
    ),
    access.orders && (
      <Stat
        key="orders"
        label="Orders Not Received"
        value={data.openOrdersCount}
      />
    ),
    access.equipment && (
      <Stat
        key="equipment"
        label="Equipment Not Functioning"
        value={needsAttention(data.equipmentCounts)}
      />
    ),
  ].filter(Boolean)

  return (
    <Workspace>
      <WorkspaceHeader>
        <WorkspaceHeading>
          <WorkspaceTitle>Welcome, {firstName}</WorkspaceTitle>
          <WorkspaceDescription>
            {waitingSummary(data.approvals.length, data.convertCount, access)}
          </WorkspaceDescription>
        </WorkspaceHeading>
        {access.manageUsers && (
          <WorkspaceActions>
            <Button onClick={onAddUser} size="lg">
              <PlusIcon data-icon="inline-start" />
              Add User
            </Button>
          </WorkspaceActions>
        )}
      </WorkspaceHeader>
      <WorkspaceContent>
        {data.notifications.map((notification) => (
          <Alert key={notification.id}>
            <InfoIcon />
            {notification.title && (
              <AlertTitle>{notification.title}</AlertTitle>
            )}
            <AlertDescription>{notification.message}</AlertDescription>
          </Alert>
        ))}

        {nothingToShow && (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <LayoutDashboardIcon />
              </EmptyMedia>
              <EmptyTitle>Nothing To Show Yet</EmptyTitle>
              <EmptyDescription>
                Your roles do not include any of the work this page summarizes.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}

        {stats.length > 0 && <StatStrip>{stats}</StatStrip>}

        {access.requisitions && (
          <DashboardRow
            narrow={<RequisitionStatusMeter counts={data.statusCounts} />}
            wide={
              <RequisitionsByPeriod requisitions={data.recentRequisitions} />
            }
          />
        )}

        {(access.approve || access.equipment) && (
          <DashboardRow
            narrow={
              access.equipment && (
                <EquipmentStatusCard counts={data.equipmentCounts} />
              )
            }
            wide={
              access.approve && <ApprovalsTable requisitions={data.approvals} />
            }
          />
        )}
      </WorkspaceContent>
    </Workspace>
  )
}

const requisitions = (count: number) =>
  `${count} ${count === 1 ? "requisition" : "requisitions"}`

/** One sentence on what is waiting, from the counts this user's rights let them see. */
function waitingSummary(
  toApprove: number | undefined,
  toConvert: number | undefined,
  { approve, convert }: DashboardAccess
) {
  if (approve && convert && toApprove !== undefined && toConvert !== undefined)
    return `${requisitions(toApprove)} to approve and ${toConvert} to convert to orders.`
  if (approve && !convert && toApprove !== undefined)
    return `${requisitions(toApprove)} waiting for your approval.`
  if (convert && !approve && toConvert !== undefined)
    return `${requisitions(toConvert)} ready to convert to orders.`
  return approve || convert
    ? "What needs your attention today."
    : "An overview of your work in OpenLMIS."
}
