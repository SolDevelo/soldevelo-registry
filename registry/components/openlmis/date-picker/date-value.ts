const DATE_VALUE = /^(\d{4})-(\d{2})-(\d{2})$/

/** A `yyyy-MM-dd` value as a local date, or undefined when it is not a real day. */
export function parseDateValue(value: string): Date | undefined {
  const match = DATE_VALUE.exec(value)
  if (!match) return undefined
  const [year, month, day] = match.slice(1).map(Number) as [
    number,
    number,
    number,
  ]
  const date = new Date(0)
  // setFullYear, since the constructor maps years 0 to 99 onto 1900 to 1999.
  date.setFullYear(year, month - 1, day)
  date.setHours(0, 0, 0, 0)
  const isSameDay =
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  return isSameDay ? date : undefined
}

const pad = (part: number, length = 2) => String(part).padStart(length, "0")

export function toDateValue(date: Date): string {
  return `${pad(date.getFullYear(), 4)}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function formatDateValue(value: string, locale: string): string {
  const date = parseDateValue(value)
  return date
    ? new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(date)
    : ""
}
