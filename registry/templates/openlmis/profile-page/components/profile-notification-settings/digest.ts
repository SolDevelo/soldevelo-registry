import { z } from "zod"

export const NOTIFICATION_CHANNELS = ["EMAIL", "SMS"] as const

export type NotificationChannel = (typeof NOTIFICATION_CHANNELS)[number]

/** A kind of notification that can be gathered into a digest, e.g. `requisition-actionRequired`. */
export type DigestConfiguration = {
  id: string
  tag: string
}

export type DigestSubscription = {
  digestConfiguration: { id: string }
  preferredChannel: NotificationChannel
  useDigest: boolean
  cronExpression?: string | null
}

export const FREQUENCIES = ["daily", "weekly", "custom"] as const

export type Frequency = (typeof FREQUENCIES)[number]

export const FREQUENCY_LABELS: Record<Frequency, string> = {
  daily: "Daily",
  weekly: "Weekly",
  custom: "Custom",
}

/** A schedule as the form edits it; `weekday` is Sunday 0 to Saturday 6, as in cron. */
const scheduleSchema = z.object({
  frequency: z.enum(FREQUENCIES),
  weekday: z.string(),
  time: z.string(),
  cron: z.string(),
})

const rowFields = z.object({
  configurationId: z.string(),
  tag: z.string(),
  channel: z.enum(NOTIFICATION_CHANNELS),
  useDigest: z.boolean(),
  schedule: scheduleSchema,
})

type Schedule = z.infer<typeof scheduleSchema>

export type DigestRow = z.infer<typeof rowFields>

export const WEEKDAYS = ["0", "1", "2", "3", "4", "5", "6"] as const

// Seconds, minutes, hours, day of month, month, day of week: the Spring cron OpenLMIS reads.
const SIMPLE_CRON = /^0 (\d{1,2}) (\d{1,2}) \* \* (\*|[0-6])$/
const CRON_FIELD = /^[\dA-Za-z*?/,#-]+$/
const TIME = /^(\d{2}):(\d{2})$/

const pad = (value: number) => String(value).padStart(2, "0")

/** Daily or weekly at a time when the expression is that simple, otherwise custom. */
export function parseSchedule(cron: string | null | undefined): Schedule {
  if (!cron)
    return { frequency: "daily", weekday: "0", time: "08:00", cron: "" }
  const [, minute, hour, weekday] = SIMPLE_CRON.exec(cron) ?? []
  if (
    !minute ||
    !hour ||
    !weekday ||
    Number(minute) > 59 ||
    Number(hour) > 23
  ) {
    return { frequency: "custom", weekday: "0", time: "08:00", cron }
  }
  return {
    frequency: weekday === "*" ? "daily" : "weekly",
    weekday: weekday === "*" ? "0" : weekday,
    time: `${pad(Number(hour))}:${pad(Number(minute))}`,
    cron,
  }
}

export function toCron({ frequency, weekday, time, cron }: Schedule): string {
  if (frequency === "custom") return cron.trim()
  const [, hour = "0", minute = "0"] = TIME.exec(time) ?? []
  return `0 ${Number(minute)} ${Number(hour)} * * ${frequency === "daily" ? "*" : weekday}`
}

/** Six fields of cron characters; the server checks the values themselves. */
export function isValidCron(cron: string): boolean {
  const fields = cron.trim().split(/\s+/)
  return fields.length === 6 && fields.every((field) => CRON_FIELD.test(field))
}

/** `requisition-actionRequired` as "Requisition - Action Required". */
export function tagLabel(tag: string): string {
  return tag
    .split("-")
    .map((part) =>
      part
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .replace(/(^|\s)\S/g, (letter) => letter.toUpperCase())
    )
    .join(" - ")
}

/** One row per configuration; one the user never subscribed to is email without a digest. */
export function toDigestRows(
  configurations: readonly DigestConfiguration[],
  subscriptions: readonly DigestSubscription[]
): DigestRow[] {
  const byId = new Map(
    subscriptions.map((item) => [item.digestConfiguration.id, item])
  )
  return configurations.map(({ id, tag }) => {
    const subscription = byId.get(id)
    return {
      configurationId: id,
      tag,
      channel: subscription?.preferredChannel ?? "EMAIL",
      useDigest: subscription?.useDigest ?? false,
      schedule: parseSchedule(subscription?.cronExpression),
    }
  })
}

export function toSubscriptions(
  rows: readonly DigestRow[]
): DigestSubscription[] {
  return rows.map(({ configurationId, channel, useDigest, schedule }) => ({
    digestConfiguration: { id: configurationId },
    preferredChannel: channel,
    useDigest,
    ...(useDigest && { cronExpression: toCron(schedule) }),
  }))
}

/** How many notifications would save differently from how they were loaded. */
export function countDigestChanges(
  saved: readonly DigestRow[],
  rows: readonly DigestRow[]
): number {
  const before = toSubscriptions(saved).map((item) => JSON.stringify(item))
  return toSubscriptions(rows).filter(
    (item, index) => JSON.stringify(item) !== before[index]
  ).length
}

const rowSchema = rowFields.superRefine(
  ({ useDigest, channel, schedule }, context) => {
    if (!useDigest) return
    if (channel !== "EMAIL") {
      context.addIssue({
        code: "custom",
        path: ["channel"],
        message: "Digests are sent by email only.",
      })
    }
    if (schedule.frequency === "custom") {
      if (!isValidCron(schedule.cron)) {
        context.addIssue({
          code: "custom",
          path: ["schedule", "cron"],
          message:
            "Enter six fields: seconds, minutes, hours, day, month and weekday.",
        })
      }
    } else if (!TIME.test(schedule.time)) {
      context.addIssue({
        code: "custom",
        path: ["schedule", "time"],
        message: "Enter a time.",
      })
    }
  }
)

export const digestFormSchema = z.object({ rows: z.array(rowSchema) })
