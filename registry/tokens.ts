// State colours this registry owns. A consumer's shadcn theme has no --success/--warning/--info,
// and newer ones no --destructive-foreground, so every item ships them or it can render unstyled.
export const STATE_TOKENS = {
  destructive: {
    light: "oklch(0.577 0.245 27.325)",
    dark: "oklch(0.704 0.191 22.216)",
  },
  "destructive-foreground": {
    light: "oklch(0.985 0 0)",
    dark: "oklch(0.21 0.04 25)",
  },
  success: {
    light: "oklch(0.596 0.145 163.225)",
    dark: "oklch(0.696 0.17 162.48)",
  },
  "success-foreground": {
    light: "oklch(0.985 0 0)",
    dark: "oklch(0.21 0.04 163)",
  },
  warning: {
    light: "oklch(0.666 0.179 58.318)",
    dark: "oklch(0.769 0.188 70.08)",
  },
  "warning-foreground": {
    light: "oklch(0.985 0 0)",
    dark: "oklch(0.22 0.04 60)",
  },
  info: { light: "oklch(0.55 0.13 237)", dark: "oklch(0.7 0.14 237)" },
  "info-foreground": {
    light: "oklch(0.985 0 0)",
    dark: "oklch(0.2 0.04 240)",
  },
} as const

export type StateToken = keyof typeof STATE_TOKENS

const TOKENS = Object.keys(STATE_TOKENS) as StateToken[]

// The whole set on every item, so a consumer's own code can use them too once anything is installed.
// The CLI applies cssVars additively and maps each into @theme inline, so a consumer's own values win.
export const STATE_CSS_VARS = {
  light: Object.fromEntries(
    TOKENS.map((token) => [token, STATE_TOKENS[token].light])
  ),
  dark: Object.fromEntries(
    TOKENS.map((token) => [token, STATE_TOKENS[token].dark])
  ),
}
