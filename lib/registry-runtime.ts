// The shadcn Base UI primitives import this runtime but do not declare it, so a fresh install fails without it.
export const BASE_UI_RUNTIME = "@base-ui/react"

export function withBaseUiRuntime(
  dependencies: string[] | undefined,
  registryDependencies: string[] | undefined
): string[] | undefined {
  // An item whose only registry dependency is `utils` (cn) is pure markup.
  const usesPrimitive = (registryDependencies ?? []).some(
    (dependency) => dependency !== "utils"
  )
  if (!usesPrimitive) return dependencies

  const declared = dependencies ?? []
  return declared.includes(BASE_UI_RUNTIME)
    ? declared
    : [...declared, BASE_UI_RUNTIME]
}

// Props that exist only on Base UI primitives; on a legacy Radix style they are silently spread onto the DOM.
const BASE_UI_ONLY_PROPS = /\bnativeButton=|\brender=\{/

// One line on purpose: the CLI prints `docs` once per installed item, whether or not it applies.
export const BASE_UI_DOCS =
  "Requires a `base-*` style in components.json (the `shadcn init` default). " +
  "Legacy `new-york`/`radix-*` styles install Radix primitives, which reject " +
  "the `render` prop this item uses."

export function baseUiDocs(source: string): string | undefined {
  return BASE_UI_ONLY_PROPS.test(source) ? BASE_UI_DOCS : undefined
}
