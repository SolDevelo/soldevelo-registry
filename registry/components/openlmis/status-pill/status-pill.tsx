import { Badge } from "@/components/ui/badge"

// The OpenLMIS requisition lifecycle, in the order a requisition moves through it.
export const REQUISITION_STATUSES = [
  "initiated",
  "submitted",
  "authorized",
  "in-approval",
  "approved",
  "released",
  "rejected",
] as const

export type RequisitionStatus = (typeof REQUISITION_STATUSES)[number]

const STATUS_VARIANT: Record<
  RequisitionStatus,
  React.ComponentProps<typeof Badge>["variant"]
> = {
  initiated: "outline",
  submitted: "secondary",
  authorized: "secondary",
  "in-approval": "secondary",
  approved: "default",
  released: "default",
  rejected: "destructive",
}

const STATUS_LABEL: Record<RequisitionStatus, string> = {
  initiated: "Initiated",
  submitted: "Submitted",
  authorized: "Authorized",
  "in-approval": "In approval",
  approved: "Approved",
  released: "Released",
  rejected: "Rejected",
}

export function StatusPill({
  status,
  ...props
}: Omit<React.ComponentProps<typeof Badge>, "variant" | "children"> & {
  status: RequisitionStatus
}) {
  return (
    <Badge variant={STATUS_VARIANT[status]} {...props}>
      {STATUS_LABEL[status]}
    </Badge>
  )
}
