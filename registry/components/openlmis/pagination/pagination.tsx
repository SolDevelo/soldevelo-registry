"use client"

import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
} from "lucide-react"
import { type ReactNode, useId } from "react"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"

export type PaginationLabels = {
  rowsPerPage: string
  /** The rows on screen out of the total, e.g. "1-10 / 1,211". */
  range: (from: number, to: number, total: number) => string
  firstPage: string
  previousPage: string
  nextPage: string
  lastPage: string
}

// One fixed locale, so a server render and the browser print the same digits.
const count = new Intl.NumberFormat("en-US")

const defaultLabels: PaginationLabels = {
  rowsPerPage: "Rows Per Page",
  range: (from, to, total) =>
    `${count.format(from)}-${count.format(to)} / ${count.format(total)}`,
  firstPage: "First Page",
  previousPage: "Previous Page",
  nextPage: "Next Page",
  lastPage: "Last Page",
}

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 50, 100]

type PaginationProps = {
  /** Zero-based. */
  pageIndex: number
  pageSize: number
  /** Total rows across every page. */
  rowCount: number
  onPageChange: (pageIndex: number) => void
  onPageSizeChange: (pageSize: number) => void
  pageSizeOptions?: number[]
  labels?: Partial<PaginationLabels>
}

export function Pagination({
  pageIndex,
  pageSize,
  rowCount,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  labels: labelOverrides,
}: PaginationProps) {
  const labels = { ...defaultLabels, ...labelOverrides }
  const pageSizeId = useId()
  const pageCount = Math.max(Math.ceil(rowCount / pageSize), 1)
  const lastPageIndex = pageCount - 1
  // A total that shrank under the current page still reads as the last page, not "51-47 / 47".
  const current = Math.min(pageIndex, lastPageIndex)
  const from = rowCount === 0 ? 0 : current * pageSize + 1
  const to = Math.min((current + 1) * pageSize, rowCount)
  const canPrevious = current > 0
  const canNext = current < lastPageIndex
  const items = pageSizeOptions.map((size) => ({
    value: size,
    label: String(size),
  }))

  const controls = [
    {
      label: labels.firstPage,
      icon: ChevronsLeftIcon,
      enabled: canPrevious,
      page: 0,
    },
    {
      label: labels.previousPage,
      icon: ChevronLeftIcon,
      enabled: canPrevious,
      page: current - 1,
    },
    {
      label: labels.nextPage,
      icon: ChevronRightIcon,
      enabled: canNext,
      page: current + 1,
    },
    {
      label: labels.lastPage,
      icon: ChevronsRightIcon,
      enabled: canNext,
      page: lastPageIndex,
    },
  ]

  return (
    <PaginationLayout
      controls={
        <div className="flex items-center gap-1">
          {controls.map(({ label, icon: Icon, enabled, page }) => (
            <Button
              aria-label={label}
              disabled={!enabled}
              key={label}
              onClick={() => onPageChange(page)}
              size="icon-sm"
              variant="outline"
            >
              <Icon className="rtl:rotate-180" />
            </Button>
          ))}
        </div>
      }
      pageSize={
        <div className="flex items-center gap-2">
          {/* Screen readers still get the label when there is no room to show it. */}
          <label
            className="sr-only text-muted-foreground @md/pagination:not-sr-only"
            htmlFor={pageSizeId}
          >
            {labels.rowsPerPage}
          </label>
          <Select
            items={items}
            onValueChange={(value) => {
              if (value !== null) onPageSizeChange(value)
            }}
            value={pageSize}
          >
            <SelectTrigger id={pageSizeId} size="sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent alignItemWithTrigger={false}>
              {items.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      }
      range={
        // `ltr` keeps "1-10 / 1,211" in order inside right-to-left text.
        <p
          aria-live="polite"
          className="sr-only whitespace-nowrap text-muted-foreground tabular-nums @md/pagination:not-sr-only"
          dir="ltr"
        >
          {labels.range(from, to, rowCount)}
        </p>
      }
    />
  )
}

/** Placeholder with the pagination's own layout, so its row keeps its height while loading. */
export function PaginationSkeleton() {
  return (
    <PaginationLayout
      controls={<Skeleton className="h-7 w-32" />}
      pageSize={<Skeleton className="h-7 w-16 @md/pagination:w-36" />}
      range={
        <div className="hidden @md/pagination:block">
          <Skeleton className="h-5 w-20" />
        </div>
      }
    />
  )
}

type PaginationLayoutProps = {
  pageSize: ReactNode
  range: ReactNode
  controls: ReactNode
}

// Sized by its own width, so it adapts wherever it is placed, not only to the window.
function PaginationLayout({
  pageSize,
  range,
  controls,
}: PaginationLayoutProps) {
  return (
    <div className="@container/pagination w-full">
      <div className="flex items-center justify-between gap-3 text-sm">
        {pageSize}
        <div className="flex items-center gap-3">
          {range}
          {controls}
        </div>
      </div>
    </div>
  )
}
