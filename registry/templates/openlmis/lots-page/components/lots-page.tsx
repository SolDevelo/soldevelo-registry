"use client"

import type {
  ColumnVisibilityState,
  PaginationState,
} from "@tanstack/react-table"
import { BoxesIcon } from "lucide-react"
import { useCallback, useMemo, useState } from "react"

import {
  useColumnVisibility,
  useContainerSize,
} from "@/registry/blocks/openlmis/data-table/responsive-columns"
import type { Lot, LotFormValues } from "./lot-form-dialog/lot-form"
import { toLot } from "./lot-form-dialog/lot-form"
import { LotFormDialog } from "./lot-form-dialog/lot-form-dialog"
import { LOT_HIDEABLE_COLUMNS, productSearchStatus } from "./lots-table/lots"
import { LotsTable } from "./lots-table/lots-table"
import { type LotsFilters, LotsToolbar } from "./lots-table/lots-toolbar"
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

import { MOCK_LOTS, MOCK_PRODUCTS } from "./mock-lots"

const NO_FILTERS: LotsFilters = { product: "", expiryFrom: "", expiryTo: "" }

// The product search lists this many, like a server page, and says how many it left out.
const SEARCH_PAGE = 5

type Notice = { title: string; description: string }

/** The lots screen; mount it from any route, e.g. the `page.tsx` this template ships. */
export function LotsPage() {
  const [lots, setLots] = useState(MOCK_LOTS)
  const [filters, setFilters] = useState(NO_FILTERS)
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })
  const [typed, setTyped] = useState("")
  const [editing, setEditing] = useState<string>()
  const [refused, setRefused] = useState<string[]>([])
  const [notice, setNotice] = useState<Notice>()
  const [measureContent, contentSize] = useContainerSize<HTMLDivElement>()
  // Kept for the visit only; store it (e.g. in localStorage) to remember it across visits.
  const columnChoices = useState<ColumnVisibilityState>({})
  const columnView = useColumnVisibility(
    LOT_HIDEABLE_COLUMNS,
    columnChoices,
    contentSize
  )

  // Every lot is in memory, so filtering and paging happen here.
  const matching = useMemo(
    () =>
      lots.filter(
        (lot) =>
          (!filters.product || lot.product?.id === filters.product) &&
          (!filters.expiryFrom ||
            (lot.expirationDate !== null &&
              lot.expirationDate >= filters.expiryFrom)) &&
          (!filters.expiryTo ||
            (lot.expirationDate !== null &&
              lot.expirationDate <= filters.expiryTo))
      ),
    [lots, filters]
  )
  const lastPage = Math.max(
    0,
    Math.ceil(matching.length / pagination.pageSize) - 1
  )
  const page = useMemo(
    () => ({
      ...pagination,
      pageIndex: Math.min(pagination.pageIndex, lastPage),
    }),
    [pagination, lastPage]
  )
  const rows = useMemo(
    () =>
      matching.slice(
        page.pageIndex * page.pageSize,
        (page.pageIndex + 1) * page.pageSize
      ),
    [matching, page]
  )

  const query = typed.trim().toLowerCase()
  const found = MOCK_PRODUCTS.filter(
    (product) =>
      !query ||
      product.fullProductName.toLowerCase().includes(query) ||
      product.productCode.toLowerCase().includes(query)
  )
  const listed = found.slice(0, SEARCH_PAGE)
  // The picked product stays first, so the filter can show its name.
  const picked = MOCK_PRODUCTS.find((product) => product.id === filters.product)
  const options = [
    ...(picked ? [picked] : []),
    ...listed.filter((product) => product.id !== picked?.id),
  ].map((product) => ({
    value: product.id,
    label: product.fullProductName,
    description: product.productCode,
  }))

  const updateFilters = (patch: Partial<LotsFilters>) => {
    setFilters((current) => ({ ...current, ...patch }))
    setPagination((current) => ({ ...current, pageIndex: 0 }))
  }
  const onEdit = useCallback((id: string) => {
    setNotice(undefined)
    setRefused([])
    setEditing(id)
  }, [])
  const editingLot = lots.find((lot) => lot.id === editing)

  const save = (values: LotFormValues, saved: Lot) => {
    // Lot codes are unique per product, as the server enforces.
    const taken = lots.some(
      (lot) =>
        lot.id !== saved.id &&
        lot.tradeItemId === saved.tradeItemId &&
        lot.lotCode.toLowerCase() === values.lotCode.toLowerCase()
    )
    if (taken) {
      setRefused((codes) => [...codes, values.lotCode])
      return
    }
    setLots((current) =>
      current.map((lot) =>
        lot.id === saved.id ? { ...lot, ...toLot(values, saved) } : lot
      )
    )
    setNotice({
      title: "Lot Saved",
      description: `Changes to ${values.lotCode} are saved.`,
    })
    setEditing(undefined)
  }

  return (
    <Workspace>
      <WorkspaceHeader>
        <WorkspaceHeading>
          <WorkspaceIcon>
            <BoxesIcon />
          </WorkspaceIcon>
          <WorkspaceTitle>Lots</WorkspaceTitle>
          <WorkspaceDescription>
            Batches of products, with their codes and expiry dates.
          </WorkspaceDescription>
        </WorkspaceHeading>
      </WorkspaceHeader>
      <WorkspaceContent>
        {/* Measured, because the room for columns depends on a sidebar as well as the window. */}
        <div
          className="flex flex-col gap-4 @4xl/main:gap-6"
          ref={measureContent}
        >
          {notice && (
            <Callout title={notice.title} tone="success">
              {notice.description}
            </Callout>
          )}
          <LotsToolbar
            columnView={columnView}
            filters={filters}
            onFiltersChange={updateFilters}
            onProductSearch={setTyped}
            productOptions={options}
            searchStatus={productSearchStatus({
              listed: options.length,
              total: found.length,
              typed: query !== "",
            })}
          />
          <LotsTable
            columnVisibility={columnView.visibility}
            filtered={Boolean(
              filters.product || filters.expiryFrom || filters.expiryTo
            )}
            lots={rows}
            onClearFilters={() => updateFilters(NO_FILTERS)}
            onEdit={onEdit}
            onPaginationChange={setPagination}
            pagination={page}
            rowCount={matching.length}
          />
        </div>
      </WorkspaceContent>
      <LotFormDialog
        lot={editingLot}
        onClose={() => setEditing(undefined)}
        onSubmit={save}
        product={editingLot?.product ?? null}
        refusedCodes={refused}
        target={editing}
      />
    </Workspace>
  )
}
