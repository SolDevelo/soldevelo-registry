"use client"

import {
  createColumnHelper,
  functionalUpdate,
  type PaginationState,
  useTable,
} from "@tanstack/react-table"
import { EllipsisIcon, KeyRoundIcon, PlusIcon, Trash2Icon } from "lucide-react"
import { useCallback, useMemo, useRef } from "react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  DataTable,
  DataTableColumnHeader,
  DataTableEmpty,
  DataTableError,
  type DataTableFeatures,
  DataTablePagination,
  DataTableSkeleton,
  dataTableFeatures,
} from "@/registry/blocks/openlmis/data-table/data-table"
import { ListToolbar } from "@/registry/blocks/openlmis/list-toolbar/list-toolbar"
import { CopyButton } from "@/registry/components/openlmis/copyable-value/copyable-value"

import type { ServiceAccount } from "../service-account"

const columnHelper = createColumnHelper<DataTableFeatures, ServiceAccount>()

type RowActions = {
  onDelete: ((token: string) => void) | undefined
  copiedToken: string | undefined
  onCopy: ((token: string) => void) | undefined
  onCopiedChange: ((copied: boolean) => void) | undefined
}

function createColumns(
  formatDate: (date: Date) => string,
  { onDelete, copiedToken, onCopy, onCopiedChange }: RowActions
) {
  return columnHelper.columns([
    columnHelper.accessor("createdDate", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Created" />
      ),
      cell: ({ getValue }) => (
        <span className="whitespace-normal">
          {formatDate(new Date(getValue()))}
        </span>
      ),
      meta: { className: "@xl/table:w-56" },
    }),
    columnHelper.accessor("token", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Key" />
      ),
      enableSorting: false,
      cell: ({ getValue }) => (
        <div className="flex items-center gap-1 whitespace-normal">
          <span className="font-mono text-sm break-all" dir="ltr">
            {getValue()}
          </span>
          <CopyButton
            copied={getValue() === copiedToken}
            copiedLabel="Key Copied"
            copyLabel="Copy Key"
            onCopiedChange={onCopiedChange}
            onCopy={onCopy}
            value={getValue()}
          />
        </div>
      ),
    }),
    ...(onDelete
      ? [
          columnHelper.display({
            id: "actions",
            header: () => <span className="sr-only">Actions</span>,
            cell: ({ row }) => (
              <KeyActions onDelete={onDelete} token={row.original.token} />
            ),
            meta: { className: "w-16" },
          }),
        ]
      : []),
  ])
}

/** Keeps a closing menu from taking focus back to its trigger when an item opened a dialog, which then owns focus. */
function useMenuOpensDialog() {
  const opened = useRef(false)

  const onOpenChange = useCallback((open: boolean) => {
    if (open) opened.current = false
  }, [])
  const finalFocus = useCallback(() => !opened.current, [])
  const opensDialog = useCallback(
    (open: () => void) => () => {
      opened.current = true
      open()
    },
    []
  )

  return { onOpenChange, finalFocus, opensDialog }
}

function KeyActions({
  token,
  onDelete,
}: {
  token: string
  onDelete: (token: string) => void
}) {
  const menu = useMenuOpensDialog()

  return (
    <div className="flex justify-end">
      <DropdownMenu onOpenChange={menu.onOpenChange}>
        <DropdownMenuTrigger
          render={
            <Button
              aria-label={`Actions For Key ${token}`}
              size="icon-sm"
              variant="ghost"
            />
          }
        >
          <EllipsisIcon />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-auto"
          finalFocus={menu.finalFocus}
        >
          <DropdownMenuItem
            onClick={menu.opensDialog(() => onDelete(token))}
            variant="destructive"
          >
            <Trash2Icon />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

const NO_KEYS: ServiceAccount[] = []

const getRowId = (account: ServiceAccount) => account.token

type ServiceAccountsTableProps = {
  /** One page of accounts; a skeleton shows until it is set. */
  accounts: readonly ServiceAccount[] | undefined
  /** Every account, across all pages. */
  rowCount: number
  pagination: PaginationState
  onPaginationChange: (pagination: PaginationState) => void
  /** Newest first by default; sorting is left to the caller. */
  newestFirst?: boolean
  onNewestFirstChange?: (newestFirst: boolean) => void
  /** Offered when there are no accounts. */
  onAdd?: (() => void) | undefined
  /** Without it, the row menu is left out. */
  onDelete?: ((token: string) => void) | undefined
  /** The key whose Copy button shows a tick. */
  copiedToken?: string | undefined
  /** Called on a key's Copy button; copy it, then pass it as `copiedToken`. */
  onCopy?: ((token: string) => void) | undefined
  /** Called with `false` when the copied key's button loses focus or the pointer. */
  onCopiedChange?: ((copied: boolean) => void) | undefined
  /** Dims the rows while the next page loads. */
  isStale?: boolean
  /** Loading failed; shows the error with Try Again. */
  onRetry?: (() => void) | undefined
  /** The language dates and times are shown in. */
  dateLanguage?: string
}

/** API keys with when each was added, a page at a time; the caller must clamp `pageIndex` to the last page when rows shrink. */
export function ServiceAccountsTable({
  accounts,
  rowCount,
  pagination,
  onPaginationChange,
  newestFirst = true,
  onNewestFirstChange,
  onAdd,
  onDelete,
  copiedToken,
  onCopy,
  onCopiedChange,
  isStale = false,
  onRetry,
  dateLanguage = "en-US",
}: ServiceAccountsTableProps) {
  const formatDate = useMemo(
    () =>
      new Intl.DateTimeFormat(dateLanguage, {
        dateStyle: "medium",
        timeStyle: "short",
      }).format,
    [dateLanguage]
  )
  const columns = useMemo(
    () =>
      createColumns(formatDate, {
        onDelete,
        copiedToken,
        onCopy,
        onCopiedChange,
      }),
    [formatDate, onDelete, copiedToken, onCopy, onCopiedChange]
  )
  // Memoized: the table compares controlled state by reference and would reset it every render.
  const sorting = useMemo(
    () => [{ id: "createdDate", desc: newestFirst }],
    [newestFirst]
  )
  const table = useTable({
    features: dataTableFeatures,
    columns,
    data: (accounts ?? NO_KEYS) as ServiceAccount[],
    getRowId,
    rowCount,
    manualPagination: true,
    manualSorting: true,
    enableSortingRemoval: false,
    enableSorting: Boolean(onNewestFirstChange),
    state: { pagination, sorting },
    onPaginationChange: (updater) =>
      onPaginationChange(functionalUpdate(updater, pagination)),
    onSortingChange: (updater) => {
      const [next] = functionalUpdate(updater, sorting)
      if (next) onNewestFirstChange?.(next.desc)
    },
  })

  if (onRetry)
    return (
      <DataTableError
        description="Something went wrong while loading the service accounts. Try again."
        onRetry={onRetry}
        title="Service Accounts Could Not Load"
      />
    )
  if (accounts === undefined)
    return <DataTableSkeleton rowCount={pagination.pageSize} table={table} />

  return (
    <DataTable
      empty={
        <DataTableEmpty
          action={
            onAdd && (
              <Button onClick={onAdd}>
                <PlusIcon data-icon="inline-start" />
                Add Service Account
              </Button>
            )
          }
          description="Add one to give another system access to the API."
          icon={<KeyRoundIcon />}
          title="No Service Accounts"
        />
      }
      footer={rowCount > 0 && <DataTablePagination table={table} />}
      isStale={isStale}
      table={table}
    />
  )
}

/** The Add button above the table, at the end with room and full width without. */
export function ServiceAccountsToolbar({ onAdd }: { onAdd: () => void }) {
  return (
    <ListToolbar>
      <div className="w-full @2xl/toolbar:ms-auto @2xl/toolbar:w-auto">
        <Button className="w-full" onClick={onAdd}>
          <PlusIcon data-icon="inline-start" />
          Add Service Account
        </Button>
      </div>
    </ListToolbar>
  )
}
