"use client"

import { revalidateLogic, useStore } from "@tanstack/react-form"
import { BellOffIcon, MailXIcon } from "lucide-react"
import { type ReactNode, useEffect, useId, useMemo, useRef } from "react"

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
  DataTableError,
} from "@/registry/blocks/openlmis/data-table/data-table"
import {
  type FormActionState as ProfileFormActions,
  FormActions as ProfileFormButtons,
} from "@/registry/components/openlmis/form-actions/form-actions"
import { FormDialogError } from "@/registry/components/openlmis/form-dialog/form-dialog"
import { useAppForm } from "@/registry/components/openlmis/form-fields/form"

import {
  countDigestChanges,
  type DigestConfiguration,
  type DigestRow,
  type DigestSubscription,
  digestFormSchema,
  FREQUENCIES,
  FREQUENCY_LABELS,
  type Frequency,
  tagLabel,
  toCron,
  toDigestRows,
  toSubscriptions,
  WEEKDAYS,
} from "./digest"

// Isolated left to right with no-break spaces, so it reads the same, on one line, inside right-to-left text.
const CRON_EXAMPLE = "⁦0 0 8 * * MON-FRI⁩"

// Roomier than a list's rows, since every row holds controls.
const TABLE_CLASSES =
  "[&_td]:px-4 [&_td]:py-3 [&_td]:align-top [&_th]:h-10 [&_th]:px-4"

const FREQUENCY_ITEMS = FREQUENCIES.map((value) => ({
  value,
  label: FREQUENCY_LABELS[value],
}))

const channels = (useDigest: boolean) => [
  { value: "EMAIL", label: "Email" },
  { value: "SMS", label: "SMS", disabled: useDigest },
]

type ProfileNotificationSettingsProps = {
  /** Every kind of notification that can be gathered into a digest; a skeleton shows until it is set. */
  configurations: readonly DigestConfiguration[] | undefined
  /** What the user chose so far; a skeleton shows until it is set. */
  subscriptions: readonly DigestSubscription[] | undefined
  /** Subscriptions belong to the contact details, so a user without them has none to set. */
  hasContactDetails?: boolean
  /** The settings could not be loaded; shows an error with Try Again. */
  failed?: boolean
  onRetry?: () => void
  /** Called with every subscription when something changed; save them, then pass them back. */
  onSubmit: (subscriptions: DigestSubscription[]) => void
  pending?: boolean
  /** Shown above the table, e.g. why the save failed. */
  error?: ReactNode
  /** The language weekdays are named in. */
  locale?: string
  /** Tells the page how many notifications have unsaved changes, e.g. to ask before leaving. */
  onChangesChange?: (changes: number) => void
  onCancel?: () => void
  /** Places Cancel and Save Settings; by default they sit in a row under the table. */
  renderActions?: (actions: ProfileFormActions) => ReactNode
}

/** How each notification reaches the user: its channel, and whether it is gathered into a scheduled digest. */
export function ProfileNotificationSettings({
  configurations,
  subscriptions,
  hasContactDetails = true,
  failed = false,
  onRetry,
  ...props
}: ProfileNotificationSettingsProps) {
  if (!hasContactDetails) {
    return (
      <DataTableCard>
        <DataTableEmpty
          description="Add your email address on the Basic Information tab to set up notifications."
          icon={<MailXIcon />}
          title="No Contact Details Yet"
        />
      </DataTableCard>
    )
  }
  if (failed) {
    return (
      <DataTableError
        description="Your notification settings could not be loaded. Check your connection and try again."
        onRetry={onRetry}
        title="Could Not Load Notification Settings"
      />
    )
  }
  if (!configurations || !subscriptions) {
    return <ProfileNotificationSettingsSkeleton />
  }
  return (
    <DigestForm
      configurations={configurations}
      subscriptions={subscriptions}
      {...props}
    />
  )
}

type DigestFormProps = Omit<
  ProfileNotificationSettingsProps,
  "configurations" | "subscriptions" | "hasContactDetails" | "failed"
> & {
  configurations: readonly DigestConfiguration[]
  subscriptions: readonly DigestSubscription[]
}

function DigestForm({
  configurations,
  subscriptions,
  onSubmit,
  pending = false,
  error,
  locale = "en-US",
  onChangesChange,
  onCancel,
  renderActions,
}: DigestFormProps) {
  const formId = useId()
  const savedRows = useMemo(
    () => toDigestRows(configurations, subscriptions),
    [configurations, subscriptions]
  )

  const form = useAppForm({
    defaultValues: { rows: savedRows },
    // Quiet until the first submit, then each field re-checks as it is corrected.
    validationLogic: revalidateLogic({
      mode: "submit",
      modeAfterSubmission: "change",
    }),
    validators: { onDynamic: digestFormSchema },
    onSubmit: ({ value }) => onSubmit(toSubscriptions(value.rows)),
    // A refused cell may be scrolled out of the table, so the first one takes focus.
    onSubmitInvalid: () =>
      requestAnimationFrame(() =>
        document
          .getElementById(formId)
          ?.querySelector<HTMLElement>('[aria-invalid="true"]')
          ?.focus()
      ),
  })
  const rows = useStore(form.store, (state) => state.values.rows)
  const changes = countDigestChanges(savedRows, rows)

  const savedSignature = JSON.stringify(savedRows)
  const lastSaved = useRef(savedSignature)

  // Equivalent rows must not replace a draft when a parent renders again.
  useEffect(() => {
    if (lastSaved.current === savedSignature) return
    lastSaved.current = savedSignature
    form.reset({ rows: savedRows })
  }, [form, savedRows, savedSignature])
  useEffect(() => {
    onChangesChange?.(changes)
  }, [changes, onChangesChange])

  const weekdays = useMemo(() => {
    const format = new Intl.DateTimeFormat(locale, { weekday: "long" })
    // 7 January 2024 was a Sunday, day 0 in cron.
    return WEEKDAYS.map((day) => ({
      value: day,
      label: format.format(new Date(2024, 0, 7 + Number(day))),
    }))
  }, [locale])

  // Inline, so the fields keep the type the form infers.
  const renderRow = (row: DigestRow, index: number) => {
    const label = tagLabel(row.tag)
    // Every row has the same controls, so each is named after its notification too.
    const named = (control: string) => `${label} ${control}`

    return (
      <TableRow key={row.configurationId}>
        <TableCell>
          <span className="flex min-h-8 items-center font-medium whitespace-normal">
            {label}
          </span>
        </TableCell>
        <TableCell>
          <div className="min-w-28">
            <form.AppField name={`rows[${index}].channel`}>
              {(field) => (
                <field.SelectField
                  items={channels(row.useDigest)}
                  label={named("Channel")}
                  layout="inline"
                />
              )}
            </form.AppField>
          </div>
        </TableCell>
        <TableCell>
          <div className="flex min-h-8 items-center">
            <form.AppField
              listeners={{
                onChange: ({ value }) => {
                  if (
                    value &&
                    form.getFieldValue(`rows[${index}].channel`) !== "EMAIL"
                  )
                    form.setFieldValue(`rows[${index}].channel`, "EMAIL")
                },
              }}
              name={`rows[${index}].useDigest`}
            >
              {(field) => (
                <field.SwitchField
                  label={named("Use Digest")}
                  layout="inline"
                />
              )}
            </form.AppField>
          </div>
        </TableCell>
        <TableCell>
          {row.useDigest ? (
            <div className="flex items-start gap-2 whitespace-normal">
              <div className="min-w-28">
                <form.AppField
                  listeners={{
                    onChange: ({ value }: { value: Frequency }) => {
                      // A custom schedule starts from the simple one it replaces.
                      if (
                        value === "custom" &&
                        row.schedule.frequency !== "custom"
                      )
                        form.setFieldValue(
                          `rows[${index}].schedule.cron`,
                          toCron(row.schedule)
                        )
                    },
                  }}
                  name={`rows[${index}].schedule.frequency`}
                >
                  {(field) => (
                    <field.SelectField
                      items={FREQUENCY_ITEMS}
                      label={named("Frequency")}
                      layout="inline"
                    />
                  )}
                </form.AppField>
              </div>
              {row.schedule.frequency === "weekly" && (
                <div className="min-w-36">
                  <form.AppField name={`rows[${index}].schedule.weekday`}>
                    {(field) => (
                      <field.SelectField
                        items={weekdays}
                        label={named("Day")}
                        layout="inline"
                      />
                    )}
                  </form.AppField>
                </div>
              )}
              {row.schedule.frequency === "custom" ? (
                <div className="w-44">
                  <form.AppField name={`rows[${index}].schedule.cron`}>
                    {(field) => (
                      <field.TextField
                        autoComplete="off"
                        description={`Seconds, minutes, hours, day, month and weekday, e.g. ${CRON_EXAMPLE}.`}
                        dir="ltr"
                        label={named("Cron Expression")}
                        layout="inline"
                        required
                      />
                    )}
                  </form.AppField>
                </div>
              ) : (
                <div className="w-32">
                  <form.AppField name={`rows[${index}].schedule.time`}>
                    {(field) => (
                      <field.TextField
                        dir="ltr"
                        label={named("Time")}
                        layout="inline"
                        required
                        type="time"
                      />
                    )}
                  </form.AppField>
                </div>
              )}
            </div>
          ) : (
            <span className="flex min-h-8 items-center text-muted-foreground">
              -
            </span>
          )}
        </TableCell>
      </TableRow>
    )
  }

  if (rows.length === 0) {
    return (
      <DataTableCard>
        <DataTableEmpty
          description="There are no notifications that can be gathered into a digest yet."
          icon={<BellOffIcon />}
          title="No Notifications To Set Up"
        />
      </DataTableCard>
    )
  }

  const actions: ProfileFormActions = {
    formId,
    changed: changes > 0,
    pending,
    cancel: () => {
      form.reset({ rows: savedRows })
      onCancel?.()
    },
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
        {error && (
          <FormDialogError
            description={error}
            title="Could Not Save Notification Settings"
          />
        )}
        <DataTableCard>
          <Table className={TABLE_CLASSES}>
            <TableHeader>
              <TableRow>
                <TableHead>Notification</TableHead>
                <TableHead>Channel</TableHead>
                <TableHead>Use Digest</TableHead>
                <TableHead>Schedule</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row, index) => renderRow(row, index))}
            </TableBody>
          </Table>
        </DataTableCard>
        {rows.some((row) => row.useDigest) && (
          <p className="text-sm text-muted-foreground">
            {rows.some(
              (row) => row.useDigest && row.schedule.frequency === "custom"
            )
              ? `Digests are sent by email only. A custom schedule has six fields: seconds, minutes, hours, day, month and weekday, e.g. ${CRON_EXAMPLE}.`
              : "Digests are sent by email only."}
          </p>
        )}
      </form>
      {renderActions ? (
        renderActions(actions)
      ) : (
        <div className="flex justify-end gap-2">
          <ProfileFormButtons actions={actions} saveLabel="Save Settings" />
        </div>
      )}
    </>
  )
}

const SKELETON_ROWS = ["a", "b", "c", "d"]

/** The table while the settings load: its real columns, with placeholder rows of controls. */
export function ProfileNotificationSettingsSkeleton() {
  return (
    <div aria-busy>
      <DataTableCard>
        <Table className={TABLE_CLASSES}>
          <TableHeader>
            <TableRow>
              <TableHead>Notification</TableHead>
              <TableHead>Channel</TableHead>
              <TableHead>Use Digest</TableHead>
              <TableHead>Schedule</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {SKELETON_ROWS.map((row) => (
              <TableRow key={row}>
                <TableCell>
                  <span className="flex h-8 items-center">
                    <Skeleton className="h-3.5 w-48" />
                  </span>
                </TableCell>
                <TableCell>
                  <Skeleton className="h-8 w-28" />
                </TableCell>
                <TableCell>
                  <span className="flex h-8 items-center">
                    {/* A plain element, since Skeleton owns its corner radius and a switch is round. */}
                    <span className="h-4.5 w-8 animate-pulse rounded-full bg-muted" />
                  </span>
                </TableCell>
                <TableCell>
                  <Skeleton className="h-8 w-32" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DataTableCard>
    </div>
  )
}
