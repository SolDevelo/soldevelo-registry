---
name: port-to-registry
description: Port UI that shipped in one of our projects (e.g. openlmis-ui) into this shadcn registry as components, blocks and templates. Use when asked to "port", "extract" or "bring over" what a project shipped, or to check a project for new registry candidates.
---

# Port to Registry

Turn what a project shipped into installable registry items. The registry is **UI only**:
every item must install and render in any React app (Next.js or Vite) with no backend.

Read `CLAUDE.md` first. It owns the conventions; this skill is the workflow.

## 1. Find what shipped

1. The project must exist in `config/projects.ts`. If it does not, stop and ask; adding a
   project also needs a logo (see `CLAUDE.md` > Adding a project).
2. Find the project's repo and read from its default branch, never the local working tree
   (it may be on an unmerged branch):
   ```bash
   git -C <repo> fetch -q origin
   git -C <repo> log --oneline origin/master -20
   git -C <repo> show --stat <commit>          # what each PR touched
   git -C <repo> show origin/master:<path>     # read a file as merged
   gh pr view <n> -R <owner>/<repo> --json body -q .body
   ```
3. Compare with `git log` here and with `registry/registry-items.ts` to see what is already
   ported. Skip tooling, docs and agent-only changes.
4. Tell the user the candidate list before building it.

## 2. Decide the kind

| Kind      | It is                                                 | Example                            |
| --------- | ----------------------------------------------------- | ---------------------------------- |
| Component | One reusable primitive or pattern, no page context    | Status Badge, Form Fields, Callout |
| Block     | A complete screen region, often built from components | User Form Dialog, Approvals Table  |
| Template  | A whole page assembled from blocks and components     | List Page, Home Dashboard          |

- A dialog for one domain task is a **block**; the generic dialog frame it uses is a **component**.
- Shared logic (types, pure helpers) lives in the item that owns it; others import it.
- Items build on each other through `@/registry/...` imports. Never copy a file between items.
- Names are `{project}-{what it is}`, e.g. `openlmis-add-role-dialog`.

## 3. Strip everything that is not UI

The source app has a data layer. None of it ships.

- **Remove:** API calls, axios, React Query, route loaders, mutations, i18n, auth, toasts,
  loader props (`loadUser`, `saveUser: () => Promise`), effect-based loading hooks, and async
  mocks with `setTimeout` delays.
- **Blocks take props in, callbacks out:** plain data (`user`, `rows`, `facilities`) and
  events (`onSubmit(values)`, `onRemove(row)`). Loading, saving and errors are UI states the
  parent passes in (`rows={undefined}` shows a skeleton, `pending`, `error`).
- **Templates run on static mocks** in their own `components/mock-*.ts` and plain React state.
  A save updates local state synchronously.
- **Copy is plain English.** Translation keys become strings; Title Case for buttons.
- Before calling the port done, this must print nothing but the search input's debounce:
  ```bash
  grep -rnE "async |Promise|setTimeout|fetch|\bawait\b|load[A-Z]\w*\??:" registry --include=*.ts --include=*.tsx
  ```

## 4. Stock primitives, tokens and deps

- **Only stock shadcn primitives ship.** Local variants in the source app (`size="lg"` on
  DialogTitle, `Alert variant="warning"`, `Badge warning`) do not exist for a consumer. Use
  layout classes, a stock variant, or a small registry component built from plain elements
  and theme tokens (as `openlmis-status-badge` and `openlmis-callout` do).
- Add a missing primitive with the CLI, never by hand, and never overwrite existing ones:
  `yes n | pnpm exec shadcn add <name>`.
- **Tokens ship automatically.** `registry/tokens.ts` attaches `destructive`, `success`,
  `warning` and `info` (each with `-foreground`, light and dark) to every item, and the CLI
  adds them without overwriting a consumer's theme. Use `text-warning` and friends freely;
  add any new token to both `registry/tokens.ts` and `app/globals.css`.
- **Deps in `registry-items.ts`:** `dependencies` lists npm packages the item's files import,
  with a major range (`@tanstack/react-form@^1`, `zod@^4`). `registryDependencies` lists the
  shadcn primitives it imports (`field`, `dialog`). Items it imports from this registry are
  derived by the build; leave them out. `@base-ui/react` is added for you.
- Avoid ES2023-only APIs (`toSorted`) in shipped source; a consumer's `lib` may not have them.

## 5. Build each item

1. Source under `registry/{components,blocks,templates}/{project}/{item}/`.
2. A `page.tsx` preview with inline mock data. A dialog preview opens on load and reserves
   room (`min-h-*`), since a fixed dialog adds nothing to the frame's height.
3. An entry in `registry/registry-items.ts`: `name`, `title`, a description that says what it
   does (no em dashes), `dependencies`, `registryDependencies`, `categories`, `meta.project`,
   `meta.height`.
4. `pnpm registry:build`, then open `/preview/{name}` on the dev server, check it at desktop
   and phone width with no console errors, and **measure** `meta.height` from
   `[data-preview-content]`.
5. Keep ported items in sync: if the source changed a component already in the registry
   (e.g. `workspace.tsx`), port that change too.

## 6. Review before the PR

Run these on every drop, and fix what they find:

1. **`vercel-composition-patterns`**, first and hardest. Prefer compound components
   (`FormDialog`, `FormDialogHeader`, `FormDialogBody`...) over boolean props and render
   config; lift state to the parent; keep each part small enough to compose.
2. **`vercel-react-best-practices`**: memoize what the table compares by reference, stable
   callbacks for columns, no effects for derived state.
3. **`/code-review`** on the diff for correctness.
4. **`/simplify`** to cut duplication and dead code.
5. Checks, all must pass on the committed tree:
   ```bash
   pnpm registry:check && pnpm lint && pnpm typecheck && pnpm format:check && pnpm build
   ```

## 7. Ship

- Branch off `master`, Conventional Commit (`feat:`), no attribution lines.
- PR body follows the project's format: optional ticket link, `## Changes` with one line per
  change, screenshots for visible changes. No testing essays.
- Link the source PRs it ports (e.g. `OpenLMIS/openlmis-ui#13`).
- Tell the user what did not port and why (toasts, local variants, anything data-bound).
