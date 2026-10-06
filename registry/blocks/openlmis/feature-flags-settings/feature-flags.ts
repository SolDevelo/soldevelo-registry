export type FlagValue = boolean | string

/** Where a flag's value comes from when nothing is set here. */
export type InheritedFlag = {
  value: FlagValue
  source: "default" | "deployment"
}

type FlagText = {
  key: string
  label: string
  description: string
  /** The screens it changes, e.g. "Requisitions > Approve". */
  usedBy: string
  inherited: InheritedFlag
}

export type FeatureFlagDefinition =
  | (FlagText & { type: "boolean" })
  | (FlagText & {
      type: "enum"
      options: readonly { value: string; label: string }[]
    })

/** The overrides saved for everyone; a flag missing from it inherits. */
export type StoredFlags = Record<string, FlagValue>

type FlagEntry = { value: FlagValue; overridden: boolean }

/** Every flag's value in the form, and whether it overrides what it inherits. */
export type FlagDraft = Record<string, FlagEntry>

export function flagValueLabel(flag: FeatureFlagDefinition, value: FlagValue) {
  if (flag.type === "boolean") return value ? "On" : "Off"
  return flag.options.find((option) => option.value === value)?.label ?? ""
}

export function toFlagDraft(
  flags: readonly FeatureFlagDefinition[],
  saved: StoredFlags
): FlagDraft {
  return Object.fromEntries(
    flags.map((flag) => {
      const stored = saved[flag.key]
      return [
        flag.key,
        stored === undefined
          ? { value: flag.inherited.value, overridden: false }
          : { value: stored, overridden: true },
      ]
    })
  )
}

/** Overrides for the flags shown, keeping any saved for flags this screen does not know. */
export function buildFlagOverrides(
  flags: readonly FeatureFlagDefinition[],
  draft: FlagDraft,
  saved: StoredFlags
): StoredFlags {
  const known = new Set(flags.map((flag) => flag.key))
  const unknown = Object.entries(saved).filter(([key]) => !known.has(key))
  const overridden = flags
    .filter((flag) => draft[flag.key]?.overridden)
    .map((flag) => [flag.key, draft[flag.key]?.value ?? flag.inherited.value])
  return Object.fromEntries([...unknown, ...overridden])
}

export function isFlagsChanged(
  flags: readonly FeatureFlagDefinition[],
  draft: FlagDraft,
  saved: StoredFlags
) {
  const current = toFlagDraft(flags, saved)
  return flags.some(
    ({ key }) =>
      draft[key]?.value !== current[key]?.value ||
      draft[key]?.overridden !== current[key]?.overridden
  )
}

/** Flags whose key, name, description or screens contain `search`. */
export function filterFlags(
  flags: readonly FeatureFlagDefinition[],
  search: string
) {
  const needle = search.trim().toLowerCase()
  if (!needle) return flags
  return flags.filter((flag) =>
    [flag.key, flag.label, flag.description, flag.usedBy].some((text) =>
      text.toLowerCase().includes(needle)
    )
  )
}
