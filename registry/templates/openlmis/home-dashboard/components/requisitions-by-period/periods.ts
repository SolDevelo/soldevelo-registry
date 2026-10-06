export type RequisitionStatus =
  | "INITIATED"
  | "REJECTED"
  | "SUBMITTED"
  | "AUTHORIZED"
  | "IN_APPROVAL"
  | "APPROVED"
  | "RELEASED"
  | "RELEASED_WITHOUT_ORDER"
  | "SKIPPED"

/** The parts of a requisition the chart reads; map your API's requisitions onto it. */
export type PeriodRequisition = {
  status: RequisitionStatus
  processingPeriod: { startDate: string }
}

/** Sent on but not approved yet; drafts, rejections and skipped periods are left out. */
const IN_PROGRESS: ReadonlySet<RequisitionStatus> = new Set<RequisitionStatus>([
  "SUBMITTED",
  "AUTHORIZED",
  "IN_APPROVAL",
])
const APPROVED: ReadonlySet<RequisitionStatus> = new Set<RequisitionStatus>([
  "APPROVED",
  "RELEASED",
  "RELEASED_WITHOUT_ORDER",
])

export type MonthTotals = {
  /** `YYYY-MM`, the month the requisitions' periods start. */
  month: string
  inProgress: number
  approved: number
}

/** The latest months with requisitions, oldest first; monthly and quarterly periods meet on one timeline. */
export function totalsByMonth(
  requisitions: readonly PeriodRequisition[],
  limit = 6
): MonthTotals[] {
  const months = new Map<string, MonthTotals>()

  for (const { status, processingPeriod } of requisitions) {
    const group = IN_PROGRESS.has(status)
      ? "inProgress"
      : APPROVED.has(status)
        ? "approved"
        : null
    if (!group) continue
    const month = processingPeriod.startDate.slice(0, 7)
    const totals = months.get(month) ?? { month, inProgress: 0, approved: 0 }
    totals[group] += 1
    months.set(month, totals)
  }

  const totals = [...months.values()]
  // oxlint-disable-next-line unicorn/no-array-sort -- sorts a copy; toSorted needs the ES2023 lib
  totals.sort((a, b) => a.month.localeCompare(b.month))
  return totals.slice(-limit)
}

/** Whether a month's tick shows its year: on the first month and wherever the year changes. */
export function showsYear(
  months: readonly MonthTotals[],
  index: number
): boolean {
  return (
    index === 0 ||
    months[index - 1]?.month.slice(0, 4) !== months[index]?.month.slice(0, 4)
  )
}
