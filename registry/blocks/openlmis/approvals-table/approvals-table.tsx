import { CircleCheckIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DashboardCard,
  DashboardCardCount,
  DashboardCardError,
} from "@/registry/components/openlmis/dashboard-card/dashboard-card"

/** A requisition waiting on the user; map your API's requisitions onto it. */
export type ApprovalRequisition = {
  id: string
  emergency: boolean
  program: { name: string }
  facility: { code: string; name: string }
  processingPeriod: { name: string }
  /** When it reached this approver, as an ISO date. */
  waitingSince: string
}

type ApprovalsTableProps = {
  /** Most urgent first; a placeholder shows until it is set. */
  requisitions: readonly ApprovalRequisition[] | undefined
  /** All that are waiting, when `requisitions` is only the first page of them. */
  total?: number
  failed?: boolean
  onRetry?: () => void
}

const formatDate = new Intl.DateTimeFormat(undefined, { dateStyle: "medium" })
  .format

/** The requisitions waiting on this user: a table with room, two lines each on a narrow card. */
export function ApprovalsTable({
  requisitions,
  total = requisitions?.length,
  failed = false,
  onRetry,
}: ApprovalsTableProps) {
  return (
    <DashboardCard
      badge={<DashboardCardCount failed={failed} value={total} />}
      description="Requisitions waiting for your approval, emergencies first."
      title="Awaiting Your Approval"
    >
      {failed && onRetry ? (
        <DashboardCardError onRetry={onRetry} />
      ) : requisitions === undefined ? (
        <div aria-busy className="flex flex-col gap-3">
          {["a", "b", "c", "d", "e"].map((row) => (
            <Skeleton className="h-10 w-full" key={row} />
          ))}
        </div>
      ) : requisitions.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <CircleCheckIcon />
            </EmptyMedia>
            <EmptyTitle>Nothing To Approve</EmptyTitle>
            <EmptyDescription>
              Requisitions that need your approval appear here.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        // Its own container, so the layout follows the card's width; the hidden one is out of the accessibility tree.
        <div className="@container/approvals">
          <div className="hidden @xl/approvals:block">
            <ApprovalsGrid requisitions={requisitions} />
          </div>
          <div className="@xl/approvals:hidden">
            <ApprovalsList requisitions={requisitions} />
          </div>
        </div>
      )}
    </DashboardCard>
  )
}

function EmergencyBadge({ emergency }: { emergency: boolean }) {
  return emergency ? <Badge variant="destructive">Emergency</Badge> : null
}

function ApprovalsGrid({
  requisitions,
}: {
  requisitions: readonly ApprovalRequisition[]
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Program</TableHead>
          <TableHead>Facility</TableHead>
          <TableHead>Period</TableHead>
          <TableHead>Waiting Since</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {requisitions.map((requisition) => (
          <TableRow key={requisition.id}>
            <TableCell>
              <div className="flex items-center gap-2">
                <span className="font-medium">{requisition.program.name}</span>
                <EmergencyBadge emergency={requisition.emergency} />
              </div>
            </TableCell>
            <TableCell>
              <div className="flex flex-col">
                <span>{requisition.facility.name}</span>
                <span className="text-xs text-muted-foreground">
                  {requisition.facility.code}
                </span>
              </div>
            </TableCell>
            <TableCell>{requisition.processingPeriod.name}</TableCell>
            <TableCell>
              <span className="text-muted-foreground">
                {formatDate(new Date(requisition.waitingSince))}
              </span>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

/** Two lines per requisition: where and since when, then what for. */
function ApprovalsList({
  requisitions,
}: {
  requisitions: readonly ApprovalRequisition[]
}) {
  return (
    <ul className="flex flex-col divide-y">
      {requisitions.map((requisition) => (
        <li
          className="flex flex-col gap-1 py-3 first:pt-0 last:pb-0"
          key={requisition.id}
        >
          <div className="flex items-baseline justify-between gap-3">
            {/* Separate items, so the gap holds even where Latin names sit in a right-to-left line. */}
            <span className="flex min-w-0 items-baseline gap-1.5">
              <span className="truncate text-sm font-medium">
                {requisition.facility.name}
              </span>
              <span className="shrink-0 text-xs text-muted-foreground">
                {requisition.facility.code}
              </span>
            </span>
            <span className="shrink-0 text-xs text-muted-foreground">
              <span className="sr-only">Waiting since </span>
              {formatDate(new Date(requisition.waitingSince))}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="min-w-0 truncate">
              {requisition.program.name} · {requisition.processingPeriod.name}
            </span>
            <EmergencyBadge emergency={requisition.emergency} />
          </div>
        </li>
      ))}
    </ul>
  )
}
