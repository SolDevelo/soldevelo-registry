import type { ReactNode } from "react"

/** Bordered rows of settings: fields with `layout="row"` and `SettingsItem`s. */
export function SettingsList({ children }: { children: ReactNode }) {
  return (
    <div className="divide-y rounded-xl border bg-card *:px-4 *:py-3">
      {children}
    </div>
  )
}

type SettingsRowFrameProps = {
  label: ReactNode
  /** Beside the label, such as a status badge. */
  badge?: ReactNode
  /** Under the label. */
  description?: ReactNode
  /** `control` gives an input half the row; `fit` lets a switch or a value take its own width. */
  value?: "control" | "fit"
  children: ReactNode
}

/** The label at the start of a row and its value at the end. */
export function SettingsRowFrame({
  label,
  badge,
  description,
  value = "fit",
  children,
}: SettingsRowFrameProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex min-h-8 min-w-0 flex-1 flex-col justify-center gap-0.5">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          {label}
          {badge}
        </div>
        {description}
      </div>
      <div
        className={
          value === "control"
            ? "flex w-1/2 max-w-sm shrink-0 flex-col gap-1"
            : "flex min-h-8 max-w-1/2 min-w-0 items-center justify-end"
        }
      >
        {children}
      </div>
    </div>
  )
}

/** A row that only shows its value, such as one only an administrator can change. */
export function SettingsItem({
  label,
  children,
}: {
  label: ReactNode
  children: ReactNode
}) {
  return (
    <SettingsRowFrame label={<span className="text-sm">{label}</span>}>
      <span className="min-w-0 text-end text-sm font-medium wrap-break-word">
        {children}
      </span>
    </SettingsRowFrame>
  )
}
