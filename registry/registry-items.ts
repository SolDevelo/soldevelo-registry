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
    meta: { project: "openlmis", height: "236px" },
  },
  {
    name: "openlmis-search-input",
    title: "Search Input",
    type: "registry:component",
    description:
      "Search field that reports after a pause in typing, on Enter or when it loses focus, with a clear button, so a list updates once per search rather than on every keystroke.",
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
    meta: { project: "openlmis", height: "176px" },
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
    meta: { project: "openlmis", height: "320px" },
  },
  {
    name: "openlmis-status-badge",
    title: "Status Badge",
    type: "registry:component",
    description:
      "Badge for a state such as active, unsaved or ignored, in a success, warning, info or destructive tone with an icon of its own, so the state reads without relying on colour.",
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
  {
    name: "openlmis-form-fields",
    title: "Form Fields",
    type: "registry:component",
    description:
      "TanStack Form field components on shadcn Field: text, password with a show button, a type-to-filter combobox, radio and switch choice cards, required marks, inline errors, and skeletons that hold the form's shape while values load.",
    dependencies: ["@base-ui/react", "@tanstack/react-form@^1", "lucide-react"],
    registryDependencies: [
      "combobox",
      "field",
      "input",
      "input-group",
      "radio-group",
      "skeleton",
      "switch",
    ],
    files: [
      {
        path: "components/openlmis/form-fields/form.tsx",
        type: "registry:component",
      },
      {
        path: "components/openlmis/form-fields/form-fields.tsx",
        type: "registry:component",
      },
      {
        path: "components/openlmis/form-fields/form-context.ts",
        type: "registry:lib",
      },
      {
        path: "components/openlmis/form-fields/form-messages.tsx",
        type: "registry:component",
      },
    ],
    categories: ["forms"],
    meta: { project: "openlmis", height: "620px" },
  },
  {
    name: "openlmis-form-dialog",
    title: "Form Dialog",
    type: "registry:component",
    description:
      "Dialog for a form that stays inside the viewport and scrolls only its body, ignores clicks outside so nothing typed is lost, locks while a save runs, and shows save and load errors in place with a way to try again.",
    dependencies: ["lucide-react"],
    registryDependencies: ["alert", "button", "dialog", "spinner"],
    files: [
      {
        path: "components/openlmis/form-dialog/form-dialog.tsx",
        type: "registry:component",
      },
      {
        path: "components/openlmis/form-dialog/use-dialog-target.ts",
        type: "registry:hook",
      },
    ],
    categories: ["forms", "overlay"],
    meta: { project: "openlmis", height: "416px" },
  },
  {
    name: "openlmis-dashboard-card",
    title: "Dashboard Card",
    type: "registry:component",
    description:
      "Card frame for a dashboard: a title with its count in a badge, a one-line description, placeholders and an error with Try Again for a body whose data is not ready, and a row that sets a wide card beside a narrow one when there is room.",
    dependencies: ["lucide-react"],
    registryDependencies: ["badge", "button", "card", "skeleton"],
    files: [
      {
        path: "components/openlmis/dashboard-card/dashboard-card.tsx",
        type: "registry:component",
      },
    ],
    categories: ["dashboard", "layout"],
    meta: { project: "openlmis", height: "254px" },
  },
  {
    name: "openlmis-stat-strip",
    title: "Stat Strip",
    type: "registry:component",
    description:
      "One panel of headline numbers split by hairlines, with as many columns as there are stats, and a placeholder or Try Again for any number that is not ready.",
    dependencies: [],
    registryDependencies: ["skeleton", "utils"],
    files: [
      {
        path: "components/openlmis/stat-strip/stat-strip.tsx",
        type: "registry:component",
      },
    ],
    categories: ["dashboard", "data-display"],
    meta: { project: "openlmis", height: "152px" },
  },
  {
    name: "openlmis-discard-changes-dialog",
    title: "Discard Changes Dialog",
    type: "registry:component",
    description:
      "Alert dialog asked before leaving a page with unsaved changes: how many would be lost and whose, Keep Editing, and a destructive Discard whose label says what happens next.",
    dependencies: [],
    registryDependencies: ["alert-dialog", "button"],
    files: [
      {
        path: "components/openlmis/discard-changes-dialog/discard-changes-dialog.tsx",
        type: "registry:component",
      },
    ],
    categories: ["overlay", "forms"],
    meta: { project: "openlmis", height: "288px" },
  },
  // -- Blocks -----------------------------------------------------------------
  {
    name: "openlmis-data-table",
    title: "Data Table",
    type: "registry:block",
    description:
      "Server-paged table on TanStack Table v9: sortable headers, fixed column widths that hold steady from page to page, columns that drop when the table is narrow, a skeleton built from the real columns, empty and error states, and a pagination footer.",
    dependencies: ["@tanstack/react-table@^9", "lucide-react"],
    registryDependencies: ["button", "empty", "skeleton", "table"],
    files: [
      {
        path: "blocks/openlmis/data-table/data-table.tsx",
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
      "Page frame for an app screen: breadcrumbs, a heading with an icon, title and one-line description, header actions that share the width when the header stacks, a content area, and a bar stuck to the bottom for page-wide actions such as Save.",
    dependencies: [],
    registryDependencies: [],
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
      "Layout for the controls above a list, installed with the search, filter and View menu it arranges: one row with room, and the search on a row of its own once the toolbar is narrow.",
    dependencies: [],
    registryDependencies: [],
    files: [
      {
        path: "blocks/openlmis/list-toolbar/list-toolbar.tsx",
        type: "registry:component",
      },
    ],
    categories: ["layout", "data-table"],
    meta: { project: "openlmis", height: "288px" },
  },
  {
    name: "openlmis-user-form-dialog",
    title: "User Form Dialog",
    type: "registry:block",
    description:
      "Add User and Edit User dialog for OpenLMIS: name, email with its verified state, job title, phone, a searchable home facility, sign-in and notification settings, and removing home facility roles when the facility changes. It takes the user, facilities and save state as props.",
    dependencies: ["@tanstack/react-form@^1", "zod@^4"],
    registryDependencies: ["badge", "button", "field"],
    files: [
      {
        path: "blocks/openlmis/user-form-dialog/user-form-dialog.tsx",
        type: "registry:component",
      },
      {
        path: "blocks/openlmis/user-form-dialog/user-form.ts",
        type: "registry:lib",
      },
    ],
    categories: ["forms", "overlay", "users"],
    meta: { project: "openlmis", height: "768px" },
  },
  {
    name: "openlmis-reset-password-dialog",
    title: "Reset Password Dialog",
    type: "registry:block",
    description:
      "Reset Password dialog that emails the user a reset link or sets a password by hand, falls back to a typed password when the user has no email, and opens as Set Password for a user just created.",
    dependencies: ["@tanstack/react-form@^1", "zod@^4"],
    registryDependencies: ["field"],
    files: [
      {
        path: "blocks/openlmis/reset-password-dialog/reset-password-dialog.tsx",
        type: "registry:component",
      },
      {
        path: "blocks/openlmis/reset-password-dialog/password-form.ts",
        type: "registry:lib",
      },
    ],
    categories: ["forms", "overlay", "users"],
    meta: { project: "openlmis", height: "448px" },
  },
  {
    name: "openlmis-requisitions-by-period",
    title: "Requisitions By Period",
    type: "registry:block",
    description:
      "Stacked bar chart of sent requisitions over the latest six months, in progress against approved, grouped by the month their period starts, with two-line month ticks, totals on each bar and a table for screen readers.",
    dependencies: ["lucide-react", "recharts"],
    registryDependencies: ["chart", "empty", "skeleton"],
    files: [
      {
        path: "blocks/openlmis/requisitions-by-period/requisitions-by-period.tsx",
        type: "registry:component",
      },
      {
        path: "blocks/openlmis/requisitions-by-period/periods.ts",
        type: "registry:lib",
      },
    ],
    categories: ["dashboard", "charts", "requisitions"],
    meta: { project: "openlmis", height: "414px" },
  },
  {
    name: "openlmis-requisition-status-meter",
    title: "Requisition Status Meter",
    type: "registry:block",
    description:
      "Where sent requisitions stand, from submitted to released, as one segmented bar in the chart ramp with a legend of counts and shares.",
    dependencies: ["recharts"],
    registryDependencies: ["chart", "skeleton"],
    files: [
      {
        path: "blocks/openlmis/requisition-status-meter/requisition-status-meter.tsx",
        type: "registry:component",
      },
    ],
    categories: ["dashboard", "charts", "requisitions"],
    meta: { project: "openlmis", height: "310px" },
  },
  {
    name: "openlmis-equipment-status",
    title: "Equipment Status",
    type: "registry:block",
    description:
      "Cold chain equipment by functional status, each with its own icon, count and meter in a success, warning or destructive tone, so the state reads without relying on colour.",
    dependencies: ["lucide-react"],
    registryDependencies: ["skeleton", "utils"],
    files: [
      {
        path: "blocks/openlmis/equipment-status/equipment-status.tsx",
        type: "registry:component",
      },
    ],
    categories: ["dashboard", "cold-chain"],
    meta: { project: "openlmis", height: "314px" },
  },
  {
    name: "openlmis-approvals-table",
    title: "Approvals Table",
    type: "registry:block",
    description:
      "Requisitions waiting on the user, emergencies flagged: a table when the card has room and two lines per requisition on a narrow card, with loading, empty and error states.",
    dependencies: ["lucide-react"],
    registryDependencies: ["badge", "empty", "skeleton", "table"],
    files: [
      {
        path: "blocks/openlmis/approvals-table/approvals-table.tsx",
        type: "registry:component",
      },
    ],
    categories: ["dashboard", "requisitions"],
    meta: { project: "openlmis", height: "357px" },
  },
  {
    name: "openlmis-role-assignments-table",
    title: "Role Assignments Table",
    type: "registry:block",
    description:
      "One role type's assignments for a user: search, sort and paging in the browser, program and supervisory node or facility columns that fold under the role when narrow, Unsaved and Ignored badges, names that show a placeholder until they load, and View Rights and Remove row actions.",
    dependencies: ["@tanstack/react-table@^9", "lucide-react"],
    registryDependencies: ["button", "dropdown-menu", "skeleton"],
    files: [
      {
        path: "blocks/openlmis/role-assignments-table/role-assignments-table.tsx",
        type: "registry:component",
      },
      {
        path: "blocks/openlmis/role-assignments-table/role-assignments.ts",
        type: "registry:lib",
      },
    ],
    categories: ["data-table", "users", "roles"],
    meta: { project: "openlmis", height: "403px" },
  },
  {
    name: "openlmis-add-role-dialog",
    title: "Add Role Dialog",
    type: "registry:block",
    description:
      "Dialog that adds one role of a type: searchable programs, supervisory nodes, facilities and roles as the type needs, the rights a role grants once picked, required fields, a refusal of duplicates, and a warning when a home facility role has no home facility to apply at.",
    dependencies: ["@tanstack/react-form@^1", "lucide-react", "zod@^4"],
    registryDependencies: ["alert", "field"],
    files: [
      {
        path: "blocks/openlmis/add-role-dialog/add-role-dialog.tsx",
        type: "registry:component",
      },
      {
        path: "blocks/openlmis/add-role-dialog/role-form.ts",
        type: "registry:lib",
      },
    ],
    categories: ["forms", "overlay", "roles"],
    meta: { project: "openlmis", height: "528px" },
  },
  {
    name: "openlmis-import-roles-dialog",
    title: "Import Roles Dialog",
    type: "registry:block",
    description:
      "Dialog that copies another user's roles into the ones being edited, with a searchable list of users and a preview of how many roles are new before anything is added.",
    dependencies: ["@tanstack/react-form@^1", "zod@^4"],
    registryDependencies: ["field"],
    files: [
      {
        path: "blocks/openlmis/import-roles-dialog/import-roles-dialog.tsx",
        type: "registry:component",
      },
    ],
    categories: ["forms", "overlay", "roles"],
    meta: { project: "openlmis", height: "384px" },
  },
  {
    name: "openlmis-role-rights-dialog",
    title: "Role Rights Dialog",
    type: "registry:block",
    description:
      "Dialog listing what a role lets its holder do, each right named in words, scrolling inside the viewport when the list is long.",
    dependencies: ["lucide-react"],
    registryDependencies: ["button", "dialog"],
    files: [
      {
        path: "blocks/openlmis/role-rights-dialog/role-rights-dialog.tsx",
        type: "registry:component",
      },
    ],
    categories: ["overlay", "roles"],
    meta: { project: "openlmis", height: "384px" },
  },

  // -- Templates --------------------------------------------------------------
  {
    name: "openlmis-list-page",
    title: "List Page",
    type: "registry:page",
    description:
      "Complete users list screen on mock data: breadcrumbs and heading, a toolbar with search, a status filter, a View menu and Add User, a table with sorting, paging, empty and no-matches states, and row actions that open Edit User and Reset Password, with Add User going on to Set Password.",
    dependencies: ["@tanstack/react-table@^9", "lucide-react"],
    registryDependencies: ["button", "dropdown-menu"],
    files: [
      {
        path: "templates/openlmis/list-page/page.tsx",
        type: "registry:page",
        // registry:page requires an explicit target; the shadcn schema rejects the item without one.
        target: "app/list-page/page.tsx",
      },
      {
        path: "templates/openlmis/list-page/components/list-page.tsx",
        type: "registry:component",
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
  {
    name: "openlmis-home-dashboard",
    title: "Home Dashboard",
    type: "registry:page",
    description:
      "OpenLMIS home screen on mock data: a greeting with what is waiting, Add User, system notices, a stat strip, requisitions by period and by status, cold chain equipment and the approvals queue, each shown only when the user's rights allow.",
    dependencies: ["lucide-react"],
    registryDependencies: ["alert", "button", "empty"],
    files: [
      {
        path: "templates/openlmis/home-dashboard/page.tsx",
        type: "registry:page",
        // registry:page requires an explicit target; the shadcn schema rejects the item without one.
        target: "app/home-dashboard/page.tsx",
      },
      {
        path: "templates/openlmis/home-dashboard/components/home-dashboard.tsx",
        type: "registry:component",
      },
      {
        path: "templates/openlmis/home-dashboard/components/mock-dashboard.ts",
        type: "registry:lib",
      },
    ],
    categories: ["dashboard"],
    meta: { project: "openlmis", height: "1024px" },
  },
  {
    name: "openlmis-user-roles-page",
    title: "User Roles Page",
    type: "registry:page",
    description:
      "Edit User Roles on mock data: Supervision, Fulfillment, Reports and Administration tabs with counts over one draft, Add Role, Import Roles and View Rights dialogs, Remove with Undo, and Cancel and Save Changes in a bar at the bottom that asks before discarding unsaved changes.",
    dependencies: ["lucide-react"],
    registryDependencies: ["alert", "badge", "button", "tabs"],
    files: [
      {
        path: "templates/openlmis/user-roles-page/page.tsx",
        type: "registry:page",
        // registry:page requires an explicit target; the shadcn schema rejects the item without one.
        target: "app/user-roles-page/page.tsx",
      },
      {
        path: "templates/openlmis/user-roles-page/components/user-roles-page.tsx",
        type: "registry:component",
      },
      {
        path: "templates/openlmis/user-roles-page/components/mock-roles.ts",
        type: "registry:lib",
      },
      {
        path: "templates/openlmis/user-roles-page/components/use-role-draft.ts",
        type: "registry:hook",
      },
    ],
    categories: ["users", "roles"],
    meta: { project: "openlmis", height: "561px" },
  },
  {
    name: "openlmis-not-found-page",
    title: "Not Found Page",
    type: "registry:page",
    description:
      "A 404 page that shows the address that was asked for, with Go Back and Back Home, ready to render inside an app shell so the navigation stays.",
    dependencies: ["lucide-react"],
    registryDependencies: ["button", "empty"],
    files: [
      {
        path: "templates/openlmis/not-found-page/page.tsx",
        type: "registry:page",
        // registry:page requires an explicit target; the shadcn schema rejects the item without one.
        target: "app/not-found-page/page.tsx",
      },
      {
        path: "templates/openlmis/not-found-page/components/not-found-page.tsx",
        type: "registry:component",
      },
    ],
    categories: ["errors", "navigation"],
    meta: { project: "openlmis", height: "278px" },
  },
]
