"use client"

import { revalidateLogic, useStore } from "@tanstack/react-form"
import { BoxesIcon, EllipsisIcon, PlusIcon, Trash2Icon } from "lucide-react"
import {
  type ReactNode,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react"
import { flushSync } from "react-dom"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
  DataTableCard,
  DataTableEmpty,
  DataTableHeaderLabel,
} from "@/registry/blocks/openlmis/data-table/data-table"
import {
  type KitProduct,
  KitProductsDialog,
} from "@/registry/blocks/openlmis/kit-products-dialog/kit-products-dialog"
import { ListToolbar } from "@/registry/blocks/openlmis/list-toolbar/list-toolbar"
import {
  type FormActionState,
  FormActions,
} from "@/registry/components/openlmis/form-actions/form-actions"
import { FormDialogError } from "@/registry/components/openlmis/form-dialog/form-dialog"
import { useAppForm } from "@/registry/components/openlmis/form-fields/form"

import {
  type KitChild,
  type KitChildValues,
  kitChanges,
  kitFormSchema,
  toKitChildValues,
  toKitFormValues,
  toKitRow,
} from "./kit-form"

const TABLE_CLASSES =
  "[&_td]:h-14 [&_td]:px-4 [&_td]:py-2 [&_th]:h-10 [&_th]:px-4"

type ProductKitUnpackListProps = {
  /** The kit's id, left out of the products it can unpack into. */
  kitId: string
  /** What the kit unpacks into; a skeleton shows until it is set. */
  kitChildren: readonly KitChild[] | undefined
  /** The products Add Products picks from. */
  products: readonly KitProduct[]
  /** Shows the list without letting it change. */
  readOnly?: boolean
  /** Called with every row once all quantities are valid; save them, then pass the saved list back. */
  onSubmit: (children: KitChildValues[]) => void
  /** Locks Save and spins it while the save runs. */
  pending?: boolean
  /** Shown above the list, e.g. why the save failed; what was entered stays. */
  error?: ReactNode
  /** Runs on Cancel instead of putting the list back, e.g. to leave the page. */
  onCancel?: () => void
  /** Tells the page how many changes are unsaved, e.g. to ask before leaving. */
  onChangesChange?: (changes: number) => void
  /** The form's id, for a Save placed elsewhere, e.g. in a page's `WorkspaceFooter`. */
  formId?: string
  /** Places Cancel and Save; by default they sit in a row under the list, and not at all when read only. */
  renderActions?: (actions: FormActionState) => ReactNode
  /** Passed to Add Products: lists only the first this many matches. */
  searchLimit?: number
}

/** The products a kit unpacks into, each with a quantity, saved together. */
export function ProductKitUnpackList({
  kitChildren,
  ...props
}: ProductKitUnpackListProps) {
  if (!kitChildren) return <KitUnpackListSkeleton />
  return <KitUnpackForm kitChildren={kitChildren} {...props} />
}

function KitUnpackForm({
  kitId,
  kitChildren,
  products,
  readOnly = false,
  onSubmit,
  pending = false,
  error,
  onCancel,
  onChangesChange,
  renderActions,
  formId: givenFormId,
  searchLimit,
}: ProductKitUnpackListProps & { kitChildren: readonly KitChild[] }) {
  const generatedFormId = useId()
  const formId = givenFormId ?? generatedFormId
  const [adding, setAdding] = useState(false)
  const listRegion = useRef<HTMLElement>(null)
  const addButton = useRef<HTMLButtonElement>(null)

  const form = useAppForm({
    defaultValues: toKitFormValues(kitChildren),
    // Quiet until the first submit, then each quantity re-checks as it is corrected.
    validationLogic: revalidateLogic({
      mode: "submit",
      modeAfterSubmission: "change",
    }),
    validators: { onDynamic: kitFormSchema },
    onSubmit: ({ value }) => onSubmit(toKitChildValues(value)),
  })
  const rows = useStore(form.store, (state) => state.values.children)
  const changes = kitChanges(rows, kitChildren)

  // Start again only from a saved list that differs, so a rebuilt but equal list keeps the draft.
  const savedKey = JSON.stringify(toKitFormValues(kitChildren))
  const lastSavedKey = useRef(savedKey)
  useEffect(() => {
    if (savedKey === lastSavedKey.current) return
    lastSavedKey.current = savedKey
    form.reset(toKitFormValues(kitChildren))
  }, [form, kitChildren, savedKey])
  useEffect(() => {
    onChangesChange?.(changes)
  }, [changes, onChangesChange])

  const excluded = useMemo(
    () => new Set([kitId, ...rows.map((row) => row.id)]),
    [kitId, rows]
  )

  const removeRow = (index: number) => {
    flushSync(() => form.removeFieldValue("children", index))
    // Focus the next row's menu, or Add Products once the list is empty.
    const buttons =
      listRegion.current?.querySelectorAll<HTMLButtonElement>(
        "[data-kit-actions]"
      )
    ;(
      buttons?.[Math.min(index, buttons.length - 1)] ?? addButton.current
    )?.focus()
  }
  const addProducts = (picked: KitProduct[]) =>
    form.setFieldValue("children", (current) => [
      ...current,
      ...picked.map((product) => toKitRow(product)),
    ])

  const actions: FormActionState = {
    formId,
    changed: changes > 0,
    pending,
    cancel: onCancel ?? (() => form.reset(toKitFormValues(kitChildren))),
  }

  return (
    <>
      <form
        className="flex flex-col gap-4"
        id={formId}
        noValidate
        onSubmit={(event) => {
          event.preventDefault()
          if (changes > 0) void form.handleSubmit()
        }}
      >
        {!readOnly && (
          <ListToolbar>
            <div className="w-full @2xl/toolbar:ms-auto @2xl/toolbar:w-auto">
              <Button
                className="w-full"
                onClick={() => setAdding(true)}
                ref={addButton}
                type="button"
              >
                <PlusIcon data-icon="inline-start" />
                Add Products
              </Button>
            </div>
          </ListToolbar>
        )}
        {error && (
          <FormDialogError
            description={error}
            title="Could Not Save Kit Unpack List"
          />
        )}
        <section aria-label="Products" ref={listRegion}>
          <DataTableCard>
            {rows.length === 0 ? (
              <DataTableEmpty
                description={
                  readOnly
                    ? "This product unpacks into no other products."
                    : "Add the products this kit unpacks into."
                }
                icon={<BoxesIcon />}
                title="No Kit Products Found"
              />
            ) : (
              <Table className={TABLE_CLASSES}>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <DataTableHeaderLabel>Product</DataTableHeaderLabel>
                    </TableHead>
                    <TableHead>
                      <DataTableHeaderLabel>Quantity</DataTableHeaderLabel>
                    </TableHead>
                    {!readOnly && (
                      <TableHead>
                        <span className="sr-only">Actions</span>
                      </TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row, index) => {
                    const name = row.name || row.code
                    return (
                      <TableRow key={row.id}>
                        <TableCell>
                          <span className="flex flex-col break-words whitespace-normal">
                            <span className="font-medium" dir="auto">
                              {name}
                            </span>
                            {row.name && (
                              <span
                                className="text-xs text-muted-foreground"
                                dir="ltr"
                              >
                                {row.code}
                              </span>
                            )}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="w-20 @md/main:w-28">
                            <form.AppField name={`children[${index}].quantity`}>
                              {(field) => (
                                <field.NumberField
                                  disabled={readOnly}
                                  label={`Quantity Of ${name}`}
                                  layout="inline"
                                  required
                                />
                              )}
                            </form.AppField>
                          </div>
                        </TableCell>
                        {!readOnly && (
                          <TableCell>
                            <div className="flex justify-end">
                              <DropdownMenu>
                                <DropdownMenuTrigger
                                  render={
                                    <Button
                                      aria-label={`Actions For ${name}`}
                                      data-kit-actions=""
                                      size="icon-sm"
                                      type="button"
                                      variant="ghost"
                                    />
                                  }
                                >
                                  <EllipsisIcon />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                  align="end"
                                  className="w-auto"
                                >
                                  <DropdownMenuItem
                                    onClick={() => removeRow(index)}
                                    variant="destructive"
                                  >
                                    <Trash2Icon />
                                    Remove
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}
          </DataTableCard>
        </section>
      </form>
      {renderActions
        ? renderActions(actions)
        : !readOnly && (
            <div className="flex justify-end gap-2">
              <FormActions actions={actions} saveLabel="Save Kit Unpack List" />
            </div>
          )}
      <KitProductsDialog
        excluded={excluded}
        onAdd={addProducts}
        onClose={() => setAdding(false)}
        limit={searchLimit}
        open={adding && !readOnly}
        products={products}
      />
    </>
  )
}

const SKELETON_ROWS = [0, 1, 2]

export function KitUnpackListSkeleton() {
  return (
    <div aria-busy>
      <DataTableCard>
        <Table className={TABLE_CLASSES}>
          <TableHeader>
            <TableRow>
              <TableHead>
                <DataTableHeaderLabel>Product</DataTableHeaderLabel>
              </TableHead>
              <TableHead>
                <DataTableHeaderLabel>Quantity</DataTableHeaderLabel>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {SKELETON_ROWS.map((row) => (
              <TableRow key={row}>
                <TableCell>
                  <Skeleton className="h-4 w-32" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-32" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DataTableCard>
    </div>
  )
}
