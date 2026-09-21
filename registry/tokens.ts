// State colours this registry owns. A consumer's shadcn theme has no --success/--warning/--info,
// so an item that uses one must ship it or it renders unstyled in their project.
export const STATE_TOKENS = {
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

const BASE_TOKENS = ["success", "warning", "info"] as const

// Matches `bg-success`, `text-info/70`, `border-warning`, `hover:bg-success-foreground`, …
const tokenPattern = (token: string) =>
  new RegExp(
    `\\b(?:bg|text|border|ring|fill|stroke|from|via|to)-${token}(?![a-z-])`
  )

// Derived from the source rather than declared per item, which would drift the moment an item changed.
export function detectStateTokens(source: string): StateToken[] {
  const found = new Set<StateToken>()

  for (const base of BASE_TOKENS) {
    const foreground = `${base}-foreground` as StateToken
    if (tokenPattern(foreground).test(source)) {
      found.add(base)
      found.add(foreground)
    } else if (tokenPattern(base).test(source)) {
      found.add(base)
    }
  }

  return [...found]
}

// `registry:*` items apply cssVars additively, so this fills gaps without overwriting a consumer's theme.
export function cssVarsForTokens(tokens: StateToken[]) {
  if (tokens.length === 0) return undefined

  return {
    light: Object.fromEntries(
      tokens.map((token) => [token, STATE_TOKENS[token].light])
    ),
    dark: Object.fromEntries(
      tokens.map((token) => [token, STATE_TOKENS[token].dark])
    ),
  }
}
