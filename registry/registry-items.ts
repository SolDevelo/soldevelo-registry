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
export const registryItems: RegistryItem[] = [
  // -- Components -------------------------------------------------------------
  {
    name: "openlmis-pagination",
    title: "Pagination",
    type: "registry:component",
    description:
      "Pager for a server-paged list: rows per page, the range on screen out of the total, and first, previous, next and last page buttons, with a matching loading skeleton. Tightens to fit narrow containers.",
    dependencies: ["lucide-react"],
    registryDependencies: ["button", "select", "skeleton"],
    files: [
      {
        path: "components/openlmis/pagination/pagination.tsx",
        type: "registry:component",
      },
    ],
    categories: ["navigation", "data-table"],
    meta: { project: "openlmis", height: "92px" },
  },
  {
    name: "openlmis-search-input",
    title: "Search Input",
    type: "registry:component",
    description:
      "Search field that reports after a pause in typing, on Enter or when it loses focus, with a clear button, so a list refetches once per search rather than on every keystroke.",
    dependencies: ["lucide-react"],
    registryDependencies: ["input-group"],
    files: [
      {
        path: "components/openlmis/search-input/search-input.tsx",
        type: "registry:component",
      },
      {
        path: "components/openlmis/search-input/use-debounced-input.ts",
        type: "registry:hook",
      },
    ],
    categories: ["forms", "data-table"],
    meta: { project: "openlmis", height: "128px" },
  },
  {
    name: "openlmis-select-filter",
    title: "Select Filter",
    type: "registry:component",
    description:
      'Toolbar dropdown that narrows a list to one value, reading "Status: Active" once picked, with a button to clear it.',
    dependencies: ["lucide-react"],
    registryDependencies: ["button", "select"],
    files: [
      {
        path: "components/openlmis/select-filter/select-filter.tsx",
        type: "registry:component",
      },
    ],
    categories: ["forms", "data-table"],
    meta: { project: "openlmis", height: "96px" },
  },
  {
    name: "openlmis-column-view-options",
    title: "Column View Options",
    type: "registry:component",
    description:
      "View menu that shows or hides a table's columns with checkboxes, and resets them to their defaults.",
    dependencies: ["lucide-react"],
    registryDependencies: ["button", "dropdown-menu"],
    files: [
      {
        path: "components/openlmis/column-view-options/column-view-options.tsx",
        type: "registry:component",
      },
    ],
    categories: ["data-table"],
    meta: { project: "openlmis", height: "128px" },
  },
  {
    name: "openlmis-status-badge",
    title: "Status Badge",
    type: "registry:component",
    description:
      "Badge for a yes-or-no state such as active or inactive, in a success or destructive tone with a check or cross icon, so the state reads without relying on colour.",
    dependencies: ["lucide-react"],
    registryDependencies: ["utils"],
    files: [
      {
        path: "components/openlmis/status-badge/status-badge.tsx",
        type: "registry:component",
      },
    ],
    categories: ["data-display"],
    meta: { project: "openlmis", height: "84px" },
  },
  {
    name: "openlmis-page-breadcrumbs",
    title: "Page Breadcrumbs",
    type: "registry:component",
    description:
      "Breadcrumb trail from a list of steps, where a step without a page, such as a menu section, shows as text, and links render through any router.",
    dependencies: [],
    registryDependencies: ["breadcrumb"],
    files: [
      {
        path: "components/openlmis/page-breadcrumbs/page-breadcrumbs.tsx",
        type: "registry:component",
      },
    ],
    categories: ["navigation"],
    meta: { project: "openlmis", height: "84px" },
  },
  // -- Blocks -----------------------------------------------------------------
  {
    name: "openlmis-data-table",
    title: "Data Table",
    type: "registry:block",
    description:
      "Server-paged table on TanStack Table v9: sortable headers, fixed column widths that hold steady from page to page, columns that drop when the table is narrow, a skeleton built from the real columns, empty and error states, and a pagination footer.",
    dependencies: ["@tanstack/react-table", "lucide-react"],
    registryDependencies: [
      "button",
      "empty",
      "skeleton",
      "table",
      "@soldevelo/openlmis-pagination",
    ],
    files: [
      {
        path: "blocks/openlmis/data-table/data-table.tsx",
        type: "registry:component",
      },
      {
        path: "blocks/openlmis/data-table/data-table-pagination.tsx",
        type: "registry:component",
      },
      {
        path: "blocks/openlmis/data-table/responsive-columns.ts",
        type: "registry:hook",
      },
    ],
    categories: ["data-table"],
    meta: { project: "openlmis", height: "639px" },
  },
  {
    name: "openlmis-workspace",
    title: "Workspace",
    type: "registry:block",
    description:
      "Page frame for an app screen: breadcrumbs, a heading with an icon, title and one-line description, header actions, and a content area, with the same padding and heading scale on every page.",
    dependencies: [],
    registryDependencies: ["@soldevelo/openlmis-page-breadcrumbs"],
    files: [
      {
        path: "blocks/openlmis/workspace/workspace.tsx",
        type: "registry:component",
      },
    ],
    categories: ["layout"],
    meta: { project: "openlmis", height: "320px" },
  },
  {
    name: "openlmis-list-toolbar",
    title: "List Toolbar",
    type: "registry:block",
    description:
      "Layout for the controls above a list: search, filters, the View menu and the create action in one row, with the search on a row of its own once the toolbar is narrow.",
    dependencies: [],
    registryDependencies: [],
    files: [
      {
        path: "blocks/openlmis/list-toolbar/list-toolbar.tsx",
        type: "registry:component",
      },
    ],
    categories: ["layout", "data-table"],
    meta: { project: "openlmis", height: "96px" },
  },

  // -- Templates --------------------------------------------------------------
  {
    name: "openlmis-list-page",
    title: "List Page",
    type: "registry:page",
    description:
      "Complete server-paged list screen, shown with OpenLMIS users on mock data: breadcrumbs and heading, a toolbar with search, a status filter, a View menu and Add User, and a table with sorting, paging, loading, empty, no-matches and error states.",
    dependencies: ["@tanstack/react-table", "lucide-react"],
    registryDependencies: [
      "button",
      "dropdown-menu",
      "@soldevelo/openlmis-data-table",
      "@soldevelo/openlmis-workspace",
      "@soldevelo/openlmis-list-toolbar",
      "@soldevelo/openlmis-search-input",
      "@soldevelo/openlmis-select-filter",
      "@soldevelo/openlmis-column-view-options",
      "@soldevelo/openlmis-status-badge",
    ],
    files: [
      {
        path: "templates/openlmis/list-page/page.tsx",
        type: "registry:page",
        // registry:page requires an explicit target; the shadcn schema rejects the item without one.
        target: "app/list-page/page.tsx",
      },
      {
        path: "templates/openlmis/list-page/components/mock-users.ts",
        type: "registry:lib",
      },
      {
        path: "templates/openlmis/list-page/components/use-user-list.ts",
        type: "registry:hook",
      },
      {
        path: "templates/openlmis/list-page/components/user-columns.tsx",
        type: "registry:component",
      },
    ],
    categories: ["data-table", "users"],
    meta: { project: "openlmis", height: "783px" },
  },
]
