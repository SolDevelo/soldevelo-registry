<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

# SolDevelo Registry

A shadcn registry of **components**, **blocks**, and **templates** for the
open-source projects SolDevelo works on, plus the Next.js site that previews
them. Public and open source.

The registry is multi-project. Every item belongs to a project declared in
`config/projects.ts`, and the site shows that project beside the item so a
visitor can tell where a block comes from. OpenLMIS is the first project.

Two jobs, one repo:

1. **The registry**: source of truth in `registry/`, compiled into JSON that
   the shadcn CLI installs from.
2. **The site**: a catalog that previews every item live and shows its source.

## Commands

```bash
pnpm dev              # Dev server on localhost:3000
pnpm build            # Production build (type-checks as part of the build)
pnpm start            # Serve the production build

pnpm lint             # oxlint (includes the @shadcn/lint design-system rules)
pnpm lint:fix         # oxlint --fix
pnpm typecheck        # next typegen && tsc --noEmit (TypeScript 7)
pnpm format           # oxfmt (pnpm format:check to verify only)

pnpm registry:build   # Regenerate every derived artifact. Run after ANY registry/ change.
pnpm registry:check   # registry:build + fail if the artifacts are out of date (CI gate)
```

**After making changes, run `pnpm lint` and `pnpm typecheck` and fix all errors.**

**After editing anything under `registry/`, run `pnpm registry:build`** and
commit the regenerated artifacts alongside your change.

## Agent configuration

This file is the single source of truth for every agent. `AGENTS.md` only
points here, for agents that read that name instead. `next dev` maintains the
`nextjs-agent-rules` block in whichever of the two hosts it, so keep it here.

Skills live in `.agents/skills/` and are symlinked into `.claude/skills/`, so
both layouts resolve to the same files. Install with
`npx skills add <repo> --skill <name>`; `skills-lock.json` pins what is
installed. Never edit a skill's files by hand; reinstall instead.

Installed: `shadcn`, `vercel-react-best-practices`, `vercel-composition-patterns`.

## Registry pipeline

```
registry/registry-items.ts        AUTHORED: the only place an item is declared
registry/{components,blocks,templates}/**   AUTHORED: the source files
        |
        |  pnpm registry:build
        v
config/{components,blocks,templates}.ts     GENERATED: site data + embedded source
registry.json                               GENERATED: source registry for `shadcn build`
public/r/*.json                             GENERATED: what the shadcn CLI installs
REGISTRY.md                                 GENERATED: catalog index for humans and agents
public/llms.txt                             GENERATED: catalog summary for LLM crawlers
```

Generated files are committed. **Never edit them by hand.** Change the source
and rebuild. `pnpm registry:check` fails CI if they drift.

The build runs in four steps, in order:

1. `lib/build-registry.mts` clears `public/r`, then derives install targets and
   rewritten source and writes `config/*.ts` and `registry.json`. The clear
   matters: `shadcn build` only writes, so a renamed item would otherwise leave
   its old JSON behind and keep serving it.
2. `shadcn build` emits `public/r/*.json`, inlining file content from disk.
3. `scripts/registry/finalize-artifacts.mts` replaces that content with the
   shipped form (imports rewritten to install targets, asset paths
   absolutized), then asserts nothing was missed. `shadcn build` reads from
   disk and cannot be hooked, so this has to run after it.
4. `scripts/registry/gen-*.mts` regenerates `REGISTRY.md` and `llms.txt`.

## The three kinds

| Kind      | shadcn type          | Lives in                                | Installs to                                             |
| --------- | -------------------- | --------------------------------------- | ------------------------------------------------------- |
| Component | `registry:component` | `registry/components/{project}/{item}/` | `components/{project}/{item}.tsx`                       |
| Block     | `registry:block`     | `registry/blocks/{project}/{item}/`     | `components/blocks/{project}/{item}.tsx`                |
| Template  | `registry:page`      | `registry/templates/{project}/{item}/`  | `app/{item}/page.tsx` + `components/{project}/{item}/*` |

Every kind uses the same layout: one folder per item at
`registry/{kind-plural}/{project}/{item}/`, holding the source plus the
`page.tsx` the catalog previews.

- A **component** is one primitive that renders a domain value consistently
  (a status pill, a quantity cell).
- A **block** is a complete screen region (a requisition table, a stock summary
  band).
- A **template** is a whole page, assembled from this registry's components and
  blocks. What is specific to the page (its data, columns, copy) ships as the
  template's own files under `registry/templates/{project}/{item}/`.

Items build on each other rather than copying: a block uses components, a
template uses blocks and components. Each installs once and is shared.

Multi-file items install under a folder (`components/blocks/{name}/`) instead
of a flat file.

## Projects

`config/projects.ts` is the list of supported projects, each with a name,
description, site and square logo under `public/projects/`.

Every item declares its project twice, and the build enforces that the two
agree:

- `meta.project` is the source of truth, checked against `config/projects.ts`.
- `name` is `{project}-{item}`, so the install address says which project it
  came from and two projects can both ship a `stock-summary`.

`lib/registry-source.ts#projectOf` throws if `meta.project` is missing,
unknown, or disagrees with the name prefix.

Source lives at `registry/{kind-plural}/{project}/{item}/`, and everything
installs under the project too (`components/blocks/openlmis/stock-summary.tsx`),
so a consumer can see at a glance what came from where.

**Names say what an item is, not where it sits**: `openlmis-stock-summary`, not
`openlmis-block-1`. Lowercase kebab-case. An item's `categories` is shadcn
metadata for CLI search; the site does not group by it.

## Adding a project

1. Add an entry to `config/projects.ts`.
2. Drop a square logo at `public/projects/{id}.png`.
3. Create `registry/{kind-plural}/{id}/` and add items as below.

## Adding an item

1. Write the source under the right directory for its kind.
2. Add a `page.tsx` next to it that renders the item. This is the preview the
   catalog iframes. (Templates skip this: their own `page.tsx` is the preview.)
3. Add an entry to `registry/registry-items.ts` with `name`, `title`,
   `description`, `dependencies`, `registryDependencies`, `categories`,
   `meta.project` and `meta.height`. The `name` must be
   `{meta.project}-{folder name}`.
4. Run `pnpm registry:build`, then `pnpm lint && pnpm typecheck`.
5. Load the page and **measure** the preview height at desktop width, then set
   `meta.height` to it. The catalog resizes each frame to its content once it
   loads; `meta.height` is the first paint, so a wrong one makes the card jump.
6. Commit the source and the regenerated artifacts together.

Item source must be **copy-pasteable**: no imports the consumer will not have.
An item may import shadcn primitives (`@/components/ui/*`), npm packages it
declares in `dependencies`, its own sibling files, and other items from this
registry. Nothing else. The build rewrites all of them to install paths:

- Sibling imports are written relatively (`./data-table-labels`).
- Another item's files are imported through the alias
  (`@/registry/components/openlmis/pagination/pagination`), and the item must
  list it in `registryDependencies` as `@soldevelo/openlmis-pagination`. The
  build fails on an undeclared one, so `shadcn add` always pulls in what the code
  imports.

**Items are framework-neutral React.** No router, no data layer, no project API:
state is React state and data is mocked in the item's own files, so the same
source runs in a Next.js app and in a Vite + TanStack Router app. A consumer
swaps the mock for its own fetching.

Variants added to `components/ui/*` do not ship: a consumer gets stock shadcn
primitives. Express an item's look with layout and spacing classes, or with
plain elements styled by theme tokens, never by relying on a local variant.

## Code conventions

### Comments

**One line, plain language, and only where the code cannot say it itself.**

Write a comment when a reader would otherwise ask "why is it like this?":
a non-obvious constraint, a deliberate trade-off, an ordering that matters.
Do not narrate what the code already states, and do not write multi-paragraph
essays or changelog entries in comments.

```ts
// Good
// registry:page requires an explicit target; the shadcn schema rejects the item without one.

// Bad: narrates the obvious
// This function takes a slug and returns a display string.

// Bad: a history lesson nobody needs in the source
/**
 * This used to be handled by X, which broke in three ways: first ...
 */
```

### Prose

**Never use em dashes (`—`).** Not in comments, copy, commit messages, registry
titles or descriptions, or generated output. Use a comma, a colon, parentheses,
or two sentences. Hyphens in compound words are fine. The only exception is the
`nextjs-agent-rules` block at the top of this file, which `next dev` rewrites.

### TypeScript

- TypeScript 7 (`tsc` CLI). Strict mode; `any` is a lint error.
- `import type` for type-only imports (enforced).
- Prefer `type` aliases over `interface`.
- Node builtins use the `node:` protocol.

### React and Next.js

- Server Components by default. Add `"use client"` only where a component
  needs state, effects, or browser APIs.
- Anything that imports `config/{components,blocks,templates}.ts` is
  **server-only**, because those files embed the whole catalog's source. Compute on
  the server and pass results down as props.
- Base UI, not Radix: components take `render`, not `asChild`. To render a
  `Button` as a link, also pass `nativeButton={false}`:
  `<Button render={<a href="/" />} nativeButton={false}>`.
- Follow the `vercel-react-best-practices` and `vercel-composition-patterns`
  skills for performance and component-API design.

### Buttons and calls to action

- Page-level and header CTAs use `size="lg"`.
- **Never an arrow icon.** Use `ChevronRightIcon` when a directional affordance
  helps; most buttons need no icon at all.
- Button labels are Title Case ("Browse Blocks", "Try Again").
- A link to an external service leads with that service's mark and a short noun
  like `<GitHubIcon /> Source`, not "View on GitHub".

### Design system rules

`@shadcn/lint` runs inside oxlint and enforces these against the theme in
`app/globals.css`. Read the error; it names the variant or token to use.

- **`className` is for layout and spacing, not restyling.** A shadcn component
  owns its colour, typography, and shape. Reach for a `variant` or `size`
  first; add a new variant in `components/ui/*` only if the design genuinely
  needs one.
  - Exception, configured in `.oxlintrc.json`: `tabular-nums` and
    `font-medium` are allowed on table cells, because numeric columns need
    them and no variant expresses it.
- **No raw colours.** Use theme tokens (`bg-muted`, `text-muted-foreground`,
  `text-destructive`), never `bg-pink-500` or a hex literal. Declare
  `--color-<name>` in `app/globals.css` for anything genuinely new. Brand marks
  (package-manager logos, the OG card) are exempt in `.oxlintrc.json`.
- **State tokens**: `success`, `warning`, `info`, each with a `-foreground`
  pair, alongside `destructive`. Use them for status meaning rather than
  reaching for a palette green or amber. They are defined in `app/globals.css`
  and mirrored in `registry/tokens.ts`. See below.
- **No manual `dark:` colour overrides.** The tokens already handle both.
- **No arbitrary values** (`p-[13px]`) where a scale value exists.
- **Classes must be statically readable.** No `` `bg-${color}` ``.
- `size-*` when width and height match; `flex ... gap-*` rather than
  `space-x-*`/`space-y-*`; `cn()` for conditional classes.

Vendored `components/ui/**` is exempt from the restyle rules. Do not
hand-edit those files, re-add them with the shadcn CLI instead.

### Formatting

Oxfmt (`.oxfmtrc.json`): double quotes, **no semicolons**, 2-space indent, 80
columns, `es5` trailing commas, Tailwind classes sorted. The repo is normalized;
match it. Vendored `components/ui/**` and the generated artifacts are ignored.

## Theme

The palette is SolDevelo's, derived from the wordmark in `public/soldevelo.png`:
brand blue `#1589CB` and navy `#004C8B`, a blue chart ramp between them, Geist
for both body and headings. Items from every project render in this theme; a
project's own colours appear only in its logo.

`html` sets `scrollbar-gutter: stable` so navigating from a short page to a tall
one does not shift the layout. Deliberately not `overflow-y: scroll`, which
would paint a permanent scrollbar in every preview iframe.

### Shipping tokens with an item

A consumer's shadcn theme has no `--success`/`--warning`/`--info`, so an item
that uses one must carry it or it installs unstyled. `registry/tokens.ts`
detects which state tokens an item's source references and the build attaches
them as `cssVars`. That is additive, filling gaps without overwriting the
consumer's own theme, and it is derived from the source, so it cannot drift.
Add a token to both `registry/tokens.ts` and `app/globals.css`.

## SEO

This site is public, so every catalog route carries the full set. When adding
a route, add all of it. A route with none of this is a regression:

- `createMetadata()` from `lib/metadata.ts` for title, description, canonical,
  keywords, OG and Twitter tags. Never hand-roll a `Metadata` object.
- Return `notFoundMetadata` from `generateMetadata` when a dynamic segment has
  no match, or the 404 inherits a canonical pointing at a real page.
- JSON-LD via `components/structured-data.tsx`: breadcrumbs plus a
  `CollectionPage` listing the items.
- An `opengraph-image.tsx` using `createOgImage()` from `lib/og.tsx`.
- An entry in `app/sitemap.ts`.
- Copy written for that page. Templated sentences repeated across pages read as
  thin duplicate content.

Facts on these pages (counts, item names) must be **derived from the registry**,
never hand-written, so they cannot drift from what is actually installable.

`/preview/*` is `noindex` and disallowed in `robots.ts`: those pages exist to
be framed by the catalog, and crawling them spends budget on pages that cannot
rank.

## Deployment

`PRODUCTION_URL` in `config/site.ts` is the origin baked into canonicals,
absolute asset URLs, and the committed registry artifacts. It is a constant, not
an env var, so that `pnpm registry:build` is deterministic wherever it runs. An
environment fallback would let a local build publish `localhost` URLs.
`NEXT_PUBLIC_SITE_URL` overrides it for preview deploys.

## Gotchas

- **`config/*.ts` is server-only.** Importing it from a client component is a
  build error, on purpose.
- **Run the build before typecheck on a clean checkout.** `next typegen`
  generates the route types that `tsc` depends on. `pnpm typecheck` does both.
- **Preview routes live at `app/preview/`, outside the `(registry)` group.**
  They must render with no site chrome, or every iframe shows a nested header.
- **Measure `meta.height`.** Nothing catches a wrong one, and the frame visibly
  jumps to the right size on load.
- **Every item has its own page** at `/{kind-plural}/{name}`, generated from the
  registry. It is the indexable URL for the item; `/preview/*` is not.
- Conventional Commits (`feat:`, `fix:`, `refactor:`, `chore:`, `docs:`). Do
  not push or open a PR unless asked.
