import type { RegistryItem } from "shadcn/schema"

// The source of truth for everything this registry publishes. `pnpm registry:build` derives the rest.
//
// Conventions, enforced by lib/registry-invariants.ts and the build:
// - `meta.project` names the project and must exist in config/projects.ts.
// - `name` is `{project}-{item}`, lowercase kebab-case. The build rejects a name whose
//   prefix does not match `meta.project`.
// - Source lives at `registry/{kind-plural}/{project}/{item}/`, one folder per item.
// - `files[].path` is relative to `registry/`.
// - `categories` is shadcn metadata for CLI search; the site does not group by it.
// - `meta.height` is the preview's first-paint height at desktop width. Measure it, do not guess.
export const registryItems: RegistryItem[] = []
