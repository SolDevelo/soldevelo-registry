"use client"

import {
  type ColumnVisibilityState,
  createColumnHelper,
  useTable,
} from "@tanstack/react-table"
import {
  EllipsisIcon,
  EyeIcon,
  LayersIcon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react"
import { useMemo } from "react"

import { Badge } from "@/components/ui/badge"
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
  DataTableSkeleton,
  dataTableFeatures,
} from "@/registry/blocks/openlmis/data-table/data-table"
import type { ResponsiveColumn } from "@/registry/blocks/openlmis/data-table/responsive-columns"
import { ListToolbar } from "@/registry/blocks/openlmis/list-toolbar/list-toolbar"
import {
  type ColumnVisibility,
  ColumnViewOptions,
} from "@/registry/components/openlmis/column-view-options/column-view-options"
import type {
  NamedOption,
  ProgramLink,
} from "@/registry/blocks/openlmis/product-program-link-dialog/program-link-form"

/** The columns a user may hide, and the room each needs before it shows by default. */
export const PROGRAM_LINK_HIDEABLE_COLUMNS = [
  { id: "category", label: "Category", hideBelow: "xl" },
  { id: "fullSupply", label: "Full Supply", hideBelow: "2xl" },
  { id: "pricePerPack", label: "Price Per Pack", hideBelow: "lg" },
] as const satisfies readonly (ResponsiveColumn & { label: string })[]

type ProgramLinkRow = ProgramLink & { name: string; category?: string }

type RowActions = {
  /** Without it, rows offer View instead of Edit and Remove. */
  canEdit: boolean
  onEdit: (programId: string) => void
  onRemove: (programId: string) => void
}

const columnHelper = createColumnHelper<DataTableFeatures, ProgramLinkRow>()

const price = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const muted = <span className="text-muted-foreground">-</span>

function createColumns(actions: RowActions) {
  return columnHelper.columns([
    columnHelper.accessor("name", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Program" />
      ),
      cell: ({ row }) => (
        <span className="flex flex-wrap items-center gap-2">
          <span
            className="font-medium break-words whitespace-normal"
            dir="auto"
          >
            {row.original.name}
          </span>
          {row.original.active === false && (
            <Badge variant="destructive">
              <XIcon data-icon="inline-start" />
              Inactive
            </Badge>
          )}
        </span>
      ),
    }),
    columnHelper.accessor("category", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Category" />
      ),
      cell: ({ getValue }) => {
        const category = getValue()
        return category ? (
          <span className="break-words whitespace-normal" dir="auto">
            {category}
          </span>
        ) : (
          muted
        )
      },
      meta: { className: "@3xl/main:w-1/4" },
    }),
    columnHelper.accessor("fullSupply", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Full Supply" />
      ),
      cell: ({ getValue }) => (getValue() ? "Yes" : "No"),
      meta: { className: "w-28" },
    }),
    columnHelper.accessor("pricePerPack", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Price Per Pack" />
      ),
      cell: ({ getValue }) => {
        const value = getValue()
        return value == null ? (
          muted
        ) : (
          <span dir="ltr">{price.format(value)}</span>
        )
      },
      meta: { className: "w-32" },
    }),
    columnHelper.display({
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      meta: { className: "w-16" },
      cell: ({ row }) => (
        <ProgramLinkActions actions={actions} link={row.original} />
      ),
    }),
  ])
}

function ProgramLinkActions({
  link,
  actions,
}: {
  link: ProgramLinkRow
  actions: RowActions
}) {
  return (
    <div className="flex justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              aria-label={`Actions For ${link.name}`}
              size="icon-sm"
              variant="ghost"
            />
          }
        >
          <EllipsisIcon />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-auto">
          {actions.canEdit ? (
            <>
              <DropdownMenuItem onClick={() => actions.onEdit(link.programId)}>
                <PencilIcon />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => actions.onRemove(link.programId)}
                variant="destructive"
              >
                <Trash2Icon />
                Remove
              </DropdownMenuItem>
            </>
          ) : (
            <DropdownMenuItem onClick={() => actions.onEdit(link.programId)}>
              <EyeIcon />
              View
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

const NO_ROWS: ProgramLinkRow[] = []
const NO_OPTIONS: NamedOption[] = []

const getRowId = (row: ProgramLinkRow) => row.programId

type ProductProgramLinksProps = RowActions & {
  /** The product's links; a skeleton shows until they are set. */
  links: readonly ProgramLink[] | undefined
  /** Names the links' programs; a link to an unknown program shows its id. */
  programs?: readonly NamedOption[]
  categories?: readonly NamedOption[]
  columnVisibility: ColumnVisibilityState
  /** Replaces the table, e.g. when the programs could not be loaded. */
  error?: string
  onRetry?: () => void
}

/** The programs a product is offered in, by name, with Edit and Remove, or View when read only. */
export function ProductProgramLinks({
  links,
  programs = NO_OPTIONS,
  categories = NO_OPTIONS,
  columnVisibility,
  error,
  onRetry,
  canEdit,
  onEdit,
  onRemove,
}: ProductProgramLinksProps) {
  const columns = useMemo(
    () => createColumns({ canEdit, onEdit, onRemove }),
    [canEdit, onEdit, onRemove]
  )
  const rows = useMemo(() => {
    if (!links) return NO_ROWS
    const names = new Map(programs.map((program) => [program.id, program.name]))
    const categoryNames = new Map(
      categories.map((category) => [category.id, category.name])
    )
    return (
      links
        .map((link) => ({
          ...link,
          name: names.get(link.programId) ?? link.programId,
          category: categoryNames.get(link.categoryId ?? ""),
        }))
        // oxlint-disable-next-line unicorn/no-array-sort -- sorts a fresh array; toSorted needs the ES2023 lib
        .sort((a, b) => a.name.localeCompare(b.name))
    )
  }, [links, programs, categories])

  const table = useTable({
    features: dataTableFeatures,
    columns,
    data: rows,
    getRowId,
    enableSorting: false,
    state: { columnVisibility },
  })

  if (error) {
    return (
      <DataTableError
        description="Something went wrong while loading the programs. Try again."
        onRetry={onRetry}
        title={error}
      />
    )
  }
  if (!links)
    return <DataTableSkeleton footer={null} rowCount={3} table={table} />
  return (
    <DataTable
      empty={
        <DataTableEmpty
          description={
            canEdit
              ? "Add a program to offer this product in it."
              : "This product is not offered in any program yet."
          }
          icon={<LayersIcon />}
          title="Not In Any Program Yet"
        />
      }
      table={table}
    />
  )
}

type ProgramLinksToolbarProps = {
  columnVisibility: ColumnVisibility
  onColumnVisibilityChange: (visibility: ColumnVisibility) => void
  onColumnReset?: () => void
  /** Left out when the user cannot edit the product. */
  onAdd?: () => void
}

/** The View menu, then Add Program, which takes the whole row while the tab is narrow. */
export function ProgramLinksToolbar({
  columnVisibility,
  onColumnVisibilityChange,
  onColumnReset,
  onAdd,
}: ProgramLinksToolbarProps) {
  return (
    <ListToolbar>
      <div className="@2xl/toolbar:ms-auto">
        <ColumnViewOptions
          columns={[...PROGRAM_LINK_HIDEABLE_COLUMNS]}
          onReset={onColumnReset}
          onVisibilityChange={onColumnVisibilityChange}
          visibility={columnVisibility}
        />
      </div>
      {onAdd && (
        <div className="w-full @2xl/toolbar:w-auto">
          <Button className="w-full" onClick={onAdd}>
            <PlusIcon data-icon="inline-start" />
            Add Program
          </Button>
        </div>
      )}
    </ListToolbar>
  )
}
