import type { RegistryItem } from "shadcn/schema"

// The source of truth for everything this registry publishes. `pnpm registry:build` derives the rest.
//
// Conventions, enforced by lib/registry-invariants.ts and the build:
// - `meta.project` names the project and must exist in config/projects.ts.
// - `name` is `{project}-{item}`, lowercase kebab-case. The build rejects a name whose
//   prefix does not match `meta.project`.
// - Source lives at `registry/{kind-plural}/{project}/{item}/`, one folder per item.
// - `files[].path` is relative to `registry/`.
// - Templates include the shared example files they use, without installing another page.
// - `categories` is shadcn metadata for CLI search; the site does not group by it.
// - `meta.height` is the preview's first-paint height at desktop width. Measure it, do not guess.
export const registryItems: RegistryItem[] = [
  {
    name: "openlmis-form-actions",
    title: "Form Actions",
    type: "registry:component",
    description:
      "Cancel and Save actions for a form, with dirty and pending states, usable inside the form or in a page footer.",
    dependencies: [],
    registryDependencies: ["button", "input", "label", "spinner"],
    files: [
      {
        path: "components/openlmis/form-actions/form-actions.tsx",
        type: "registry:component",
      },
    ],
    categories: ["forms"],
    meta: {
      project: "openlmis",
      height: "170px",
    },
  },
  {
    name: "openlmis-settings-list",
    title: "Settings List",
    type: "registry:block",
    description:
      "Bordered setting rows with labels, descriptions, badges and editable or read-only values.",
    dependencies: [],
    registryDependencies: ["badge"],
    files: [
      {
        path: "blocks/openlmis/settings-list/settings-list.tsx",
        type: "registry:component",
      },
    ],
    categories: ["settings", "forms"],
    meta: {
      project: "openlmis",
      height: "303px",
    },
  },
  {
    name: "openlmis-date-picker",
    title: "Date Picker",
    type: "registry:component",
    description:
      "A calendar date picker with date bounds, a clear button and accessible labels. Values stay in yyyy-MM-dd format.",
    dependencies: ["lucide-react@^1"],
    registryDependencies: ["button", "calendar", "popover"],
    files: [
      {
        path: "components/openlmis/date-picker/date-picker.tsx",
        type: "registry:component",
      },
      {
        path: "components/openlmis/date-picker/date-value.ts",
        type: "registry:lib",
      },
    ],
    categories: ["forms"],
    meta: {
      project: "openlmis",
      height: "512px",
    },
  },
  {
    name: "openlmis-password-requirements",
    title: "Password Requirements",
    type: "registry:component",
    description:
      "A live checklist of password rules with pure validation helpers.",
    dependencies: ["lucide-react@^1", "zod@^4"],
    registryDependencies: ["input", "label", "utils"],
    files: [
      {
        path: "components/openlmis/password-requirements/password-requirements.tsx",
        type: "registry:component",
      },
      {
        path: "components/openlmis/password-requirements/password-rules.ts",
        type: "registry:lib",
      },
      {
        path: "components/openlmis/password-requirements/password-schema.ts",
        type: "registry:lib",
      },
    ],
    categories: ["forms", "auth"],
    meta: {
      project: "openlmis",
      height: "238px",
    },
  },
  {
    name: "openlmis-table-selection",
    title: "Table Selection",
    type: "registry:component",
    description:
      "A page selection checkbox column and a floating selected-count bar with Clear and actions.",
    dependencies: ["@tanstack/react-table@^9", "lucide-react@^1"],
    registryDependencies: ["button", "checkbox"],
    files: [
      {
        path: "components/openlmis/table-selection/table-selection.tsx",
        type: "registry:component",
      },
    ],
    categories: ["data-table"],
    meta: {
      project: "openlmis",
      height: "445px",
    },
  },
  {
    name: "openlmis-combobox-filter",
    title: "Combobox Filter",
    type: "registry:component",
    description:
      "A searchable toolbar filter with caller-supplied options, search callbacks, status and empty messages.",
    dependencies: ["@base-ui/react@^1", "lucide-react@^1"],
    registryDependencies: ["combobox", "input-group"],
    files: [
      {
        path: "components/openlmis/combobox-filter/combobox-filter.tsx",
        type: "registry:component",
      },
      {
        path: "components/openlmis/combobox-filter/narrow-options.ts",
        type: "registry:lib",
      },
    ],
    categories: ["forms", "data-table"],
    meta: {
      project: "openlmis",
      height: "352px",
    },
  },
  {
    name: "openlmis-workspace-tabs",
    title: "Workspace Tabs",
    type: "registry:component",
    description:
      "Controlled page section tabs that wrap into a column or grid on narrow screens.",
    dependencies: [],
    registryDependencies: ["tabs", "utils"],
    files: [
      {
        path: "components/openlmis/workspace-tabs/workspace-tabs.tsx",
        type: "registry:component",
      },
    ],
    categories: ["navigation", "layout"],
    meta: {
      project: "openlmis",
      height: "298px",
    },
  },
  {
    name: "openlmis-pagination",
    title: "Pagination",
    type: "registry:component",
    description:
      "Pager for a server-paged list: rows per page, the range on screen out of the total, and first, previous, next and last page buttons, with a matching loading skeleton. Tightens to fit narrow containers.",
    dependencies: ["lucide-react@^1"],
    registryDependencies: ["button", "select", "skeleton"],
    files: [
      {
        path: "components/openlmis/pagination/pagination.tsx",
        type: "registry:component",
      },
    ],
    categories: ["navigation", "data-table"],
    meta: {
      project: "openlmis",
      height: "288px",
    },
  },
  {
    name: "openlmis-search-input",
    title: "Search Input",
    type: "registry:component",
    description:
      "Search field that reports after a pause in typing, on Enter or when it loses focus, with a clear button, so a list updates once per search rather than on every keystroke.",
    dependencies: ["lucide-react@^1"],
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
    meta: {
      project: "openlmis",
      height: "128px",
    },
  },
  {
    name: "openlmis-select-filter",
    title: "Select Filter",
    type: "registry:component",
    description:
      'Toolbar dropdown that narrows a list to one value, reading "Status: Active" once picked, with a button to clear it.',
    dependencies: ["lucide-react@^1"],
    registryDependencies: ["button", "select"],
    files: [
      {
        path: "components/openlmis/select-filter/select-filter.tsx",
        type: "registry:component",
      },
    ],
    categories: ["forms", "data-table"],
    meta: {
      project: "openlmis",
      height: "220px",
    },
  },
  {
    name: "openlmis-column-view-options",
    title: "Column View Options",
    type: "registry:component",
    description:
      "View menu that shows or hides a table's columns with checkboxes, and resets them to their defaults.",
    dependencies: ["lucide-react@^1"],
    registryDependencies: ["button", "dropdown-menu"],
    files: [
      {
        path: "components/openlmis/column-view-options/column-view-options.tsx",
        type: "registry:component",
      },
    ],
    categories: ["data-table"],
    meta: {
      project: "openlmis",
      height: "320px",
    },
  },
  {
    name: "openlmis-status-badge",
    title: "Status Badge",
    type: "registry:component",
    description:
      "Badge for a state such as active, unsaved or ignored, in a success, warning, info or destructive tone with an icon of its own, so the state reads without relying on colour.",
    dependencies: ["lucide-react@^1"],
    registryDependencies: ["utils"],
    files: [
      {
        path: "components/openlmis/status-badge/status-badge.tsx",
        type: "registry:component",
      },
    ],
    categories: ["data-display"],
    meta: {
      project: "openlmis",
      height: "84px",
    },
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
    meta: {
      project: "openlmis",
      height: "84px",
    },
  },
  {
    name: "openlmis-form-fields",
    title: "Form Fields",
    type: "registry:component",
    description:
      "Thirteen TanStack Form controls with stacked, row and inline layouts, accessible hints and errors, password reveal, searchable options, tags, images and dates, compact switch rows and radio cards or tiles.",
    dependencies: [
      "@base-ui/react@^1",
      "@tanstack/react-form@^1",
      "lucide-react@^1",
      "zod@^4",
    ],
    registryDependencies: [
      "badge",
      "button",
      "combobox",
      "field",
      "input",
      "input-group",
      "popover",
      "radio-group",
      "select",
      "skeleton",
      "switch",
      "textarea",
      "tooltip",
      "utils",
    ],
    files: [
      {
        path: "components/openlmis/form-fields/form-context.ts",
        type: "registry:lib",
      },
      {
        path: "components/openlmis/form-fields/form-fields.tsx",
        type: "registry:component",
      },
      {
        path: "components/openlmis/form-fields/form-messages.tsx",
        type: "registry:component",
      },
      {
        path: "components/openlmis/form-fields/form.tsx",
        type: "registry:component",
      },
      {
        path: "components/openlmis/form-fields/tags.ts",
        type: "registry:lib",
      },
    ],
    categories: ["forms"],
    meta: {
      project: "openlmis",
      height: "1677px",
    },
  },
  {
    name: "openlmis-form-dialog",
    title: "Form Dialog",
    type: "registry:component",
    description:
      "Dialog for a form that stays inside the viewport and scrolls only its body, ignores clicks outside so nothing typed is lost, locks while a save runs, and shows save and load errors in place with a way to try again.",
    dependencies: ["lucide-react@^1"],
    registryDependencies: ["alert", "button", "dialog", "field", "spinner"],
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
    meta: {
      project: "openlmis",
      height: "416px",
    },
  },
  {
    name: "openlmis-dashboard-card",
    title: "Dashboard Card",
    type: "registry:block",
    description:
      "Card frame for a dashboard: a title with its count in a badge, a one-line description, placeholders and an error with Try Again for a body whose data is not ready, and a row that sets a wide card beside a narrow one when there is room.",
    dependencies: ["lucide-react@^1"],
    registryDependencies: ["badge", "button", "card", "skeleton"],
    files: [
      {
        path: "blocks/openlmis/dashboard-card/dashboard-card.tsx",
        type: "registry:component",
      },
    ],
    categories: ["dashboard", "layout"],
    meta: {
      project: "openlmis",
      height: "392px",
    },
  },
  {
    name: "openlmis-stat-strip",
    title: "Stat Strip",
    type: "registry:block",
    description:
      "One panel of headline numbers split by hairlines, with as many columns as there are stats, and a placeholder or Try Again for any number that is not ready.",
    dependencies: [],
    registryDependencies: ["skeleton", "utils"],
    files: [
      {
        path: "blocks/openlmis/stat-strip/stat-strip.tsx",
        type: "registry:component",
      },
    ],
    categories: ["dashboard", "data-display"],
    meta: {
      project: "openlmis",
      height: "152px",
    },
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
    meta: {
      project: "openlmis",
      height: "288px",
    },
  },
  {
    name: "openlmis-callout",
    title: "Callout",
    type: "registry:component",
    description:
      "Message box in a warning, info or success tone, tinted border and background with an icon of its own and text in the foreground colours, for the states the stock Alert has no variant for.",
    dependencies: ["lucide-react@^1"],
    registryDependencies: ["button", "utils"],
    files: [
      {
        path: "components/openlmis/callout/callout.tsx",
        type: "registry:component",
      },
    ],
    categories: ["feedback"],
    meta: {
      project: "openlmis",
      height: "308px",
    },
  },
  {
    name: "openlmis-data-table",
    title: "Data Table",
    type: "registry:block",
    description:
      "Server-paged table on TanStack Table v9: sortable headers, fixed column widths that hold steady from page to page, columns that drop when the table is narrow, a skeleton built from the real columns, empty and error states, and a pagination footer.",
    dependencies: ["@tanstack/react-table@^9", "lucide-react@^1"],
    registryDependencies: ["button", "empty", "skeleton", "table"],
    files: [
      {
        path: "blocks/openlmis/data-table/data-table.tsx",
        type: "registry:component",
      },
      {
        path: "blocks/openlmis/data-table/responsive-columns.ts",
        type: "registry:lib",
      },
    ],
    categories: ["data-table"],
    meta: {
      project: "openlmis",
      height: "639px",
    },
  },
  {
    name: "openlmis-workspace",
    title: "Workspace",
    type: "registry:block",
    description:
      "Page frame for an app screen: breadcrumbs, a heading with an icon, title and one-line description, header actions that share the width when the header stacks, a content area, and a bar stuck to the bottom for page-wide actions such as Save.",
    dependencies: ["lucide-react@^1"],
    registryDependencies: ["button", "utils"],
    files: [
      {
        path: "blocks/openlmis/workspace/workspace.tsx",
        type: "registry:component",
      },
    ],
    categories: ["layout"],
    meta: {
      project: "openlmis",
      height: "512px",
    },
  },
  {
    name: "openlmis-list-toolbar",
    title: "List Toolbar",
    type: "registry:block",
    description:
      "Layout for the controls above a list, installed with the search, filter and View menu it arranges: one row with room, and the search on a row of its own once the toolbar is narrow.",
    dependencies: ["lucide-react@^1"],
    registryDependencies: ["button"],
    files: [
      {
        path: "blocks/openlmis/list-toolbar/list-toolbar.tsx",
        type: "registry:component",
      },
    ],
    categories: ["layout", "data-table"],
    meta: {
      project: "openlmis",
      height: "288px",
    },
  },
  {
    name: "openlmis-profile-page",
    title: "Profile Page",
    type: "registry:page",
    description:
      "A mock profile with basic information, read-only role assignments, notification settings and a change password dialog.",
    dependencies: [
      "@tanstack/react-form@^1",
      "@tanstack/react-table@^9",
      "lucide-react@^1",
      "react-dom@^19",
      "zod@^4",
    ],
    registryDependencies: [
      "alert",
      "badge",
      "button",
      "dropdown-menu",
      "field",
      "skeleton",
      "spinner",
      "table",
      "tabs",
      "utils",
    ],
    files: [
      {
        path: "templates/openlmis/profile-page/components/change-password-dialog/change-password-dialog.tsx",
        type: "registry:component",
      },
      {
        path: "templates/openlmis/profile-page/components/mock-profile.ts",
        type: "registry:lib",
      },
      {
        path: "templates/openlmis/profile-page/components/profile-basic-information/profile-basic-information.tsx",
        type: "registry:component",
      },
      {
        path: "templates/openlmis/profile-page/components/profile-basic-information/profile.ts",
        type: "registry:lib",
      },
      {
        path: "templates/openlmis/profile-page/components/profile-notification-settings/digest.ts",
        type: "registry:lib",
      },
      {
        path: "templates/openlmis/profile-page/components/profile-notification-settings/profile-notification-settings.tsx",
        type: "registry:component",
      },
      {
        path: "templates/openlmis/profile-page/components/profile-page.tsx",
        type: "registry:component",
      },
      {
        path: "templates/openlmis/profile-page/page.tsx",
        type: "registry:page",
        target: "app/profile-page/page.tsx",
      },
      {
        path: "templates/openlmis/user-roles-page/components/role-assignments-table/role-assignments.ts",
        type: "registry:lib",
      },
      {
        path: "templates/openlmis/user-roles-page/components/role-assignments-table/role-assignments-table.tsx",
        type: "registry:component",
      },
      {
        path: "templates/openlmis/user-roles-page/components/role-assignments-table/role-rights-popover.tsx",
        type: "registry:component",
      },
    ],
    categories: ["profile"],
    meta: {
      project: "openlmis",
      height: "737px",
    },
  },
  {
    name: "openlmis-roles-page",
    title: "Roles Page",
    type: "registry:page",
    description:
      "Search and filter roles by type, create or edit them, and view their rights using local mock data.",
    dependencies: [
      "@tanstack/react-form@^1",
      "@tanstack/react-table@^9",
      "lucide-react@^1",
      "zod@^4",
    ],
    registryDependencies: [
      "alert-dialog",
      "button",
      "dialog",
      "dropdown-menu",
      "field",
      "skeleton",
      "tabs",
    ],
    files: [
      {
        path: "templates/openlmis/roles-page/components/mock-roles.ts",
        type: "registry:lib",
      },
      {
        path: "templates/openlmis/roles-page/components/role-columns.tsx",
        type: "registry:component",
      },
      {
        path: "templates/openlmis/roles-page/components/role-form-dialog/role-form-dialog.tsx",
        type: "registry:component",
      },
      {
        path: "templates/openlmis/roles-page/components/role-form-dialog/role-form.ts",
        type: "registry:lib",
      },
      {
        path: "templates/openlmis/roles-page/components/roles-list.ts",
        type: "registry:lib",
      },
      {
        path: "templates/openlmis/roles-page/components/roles-page.tsx",
        type: "registry:component",
      },
      {
        path: "templates/openlmis/roles-page/page.tsx",
        type: "registry:page",
        target: "app/roles-page/page.tsx",
      },
      {
        path: "templates/openlmis/user-roles-page/components/role-assignments-table/role-assignments.ts",
        type: "registry:lib",
      },
      {
        path: "templates/openlmis/user-roles-page/components/role-rights-dialog/role-rights-dialog.tsx",
        type: "registry:component",
      },
    ],
    categories: ["administration"],
    meta: {
      project: "openlmis",
      height: "783px",
    },
  },
  {
    name: "openlmis-list-page",
    title: "List Page",
    type: "registry:page",
    description:
      "Complete users list screen on mock data: breadcrumbs and heading, a toolbar with search, a status filter, a View menu and Add User, a table with sorting, paging, empty and no-matches states, and row actions that open Edit User and Reset Password, with Add User going on to Set Password.",
    dependencies: [
      "@tanstack/react-form@^1",
      "@tanstack/react-table@^9",
      "lucide-react@^1",
      "zod@^4",
    ],
    registryDependencies: ["badge", "button", "dropdown-menu", "field"],
    files: [
      {
        path: "templates/openlmis/list-page/components/list-page.tsx",
        type: "registry:component",
      },
      {
        path: "templates/openlmis/list-page/components/mock-users.ts",
        type: "registry:lib",
      },
      {
        path: "templates/openlmis/list-page/components/reset-password-dialog/password-form.ts",
        type: "registry:lib",
      },
      {
        path: "templates/openlmis/list-page/components/reset-password-dialog/reset-password-dialog.tsx",
        type: "registry:component",
      },
      {
        path: "templates/openlmis/list-page/components/use-user-list.ts",
        type: "registry:hook",
      },
      {
        path: "templates/openlmis/list-page/components/user-columns.tsx",
        type: "registry:component",
      },
      {
        path: "templates/openlmis/list-page/components/user-form-dialog/user-form-dialog.tsx",
        type: "registry:component",
      },
      {
        path: "templates/openlmis/list-page/components/user-form-dialog/user-form.ts",
        type: "registry:lib",
      },
      {
        path: "templates/openlmis/list-page/page.tsx",
        type: "registry:page",
        target: "app/list-page/page.tsx",
      },
    ],
    categories: ["data-table", "users"],
    meta: {
      project: "openlmis",
      height: "783px",
    },
  },
  {
    name: "openlmis-home-dashboard",
    title: "Home Dashboard",
    type: "registry:page",
    description:
      "OpenLMIS home screen on mock data: a greeting with what is waiting, Add User, system notices, a stat strip, requisitions by period and by status, cold chain equipment and the approvals queue, each shown only when the user's rights allow.",
    dependencies: ["lucide-react@^1", "recharts@^3"],
    registryDependencies: [
      "alert",
      "badge",
      "button",
      "chart",
      "empty",
      "skeleton",
      "table",
    ],
    files: [
      {
        path: "templates/openlmis/home-dashboard/components/approvals-table/approvals-table.tsx",
        type: "registry:component",
      },
      {
        path: "templates/openlmis/home-dashboard/components/equipment-status/equipment-status.tsx",
        type: "registry:component",
      },
      {
        path: "templates/openlmis/home-dashboard/components/home-dashboard.tsx",
        type: "registry:component",
      },
      {
        path: "templates/openlmis/home-dashboard/components/mock-dashboard.ts",
        type: "registry:lib",
      },
      {
        path: "templates/openlmis/home-dashboard/components/requisition-status-meter/requisition-status-meter.tsx",
        type: "registry:component",
      },
      {
        path: "templates/openlmis/home-dashboard/components/requisitions-by-period/periods.ts",
        type: "registry:lib",
      },
      {
        path: "templates/openlmis/home-dashboard/components/requisitions-by-period/requisitions-by-period.tsx",
        type: "registry:component",
      },
      {
        path: "templates/openlmis/home-dashboard/page.tsx",
        type: "registry:page",
        target: "app/home-dashboard/page.tsx",
      },
    ],
    categories: ["dashboard"],
    meta: {
      project: "openlmis",
      height: "1024px",
    },
  },
  {
    name: "openlmis-user-roles-page",
    title: "User Roles Page",
    type: "registry:page",
    description:
      "Edit User Roles on mock data: Supervision, Fulfillment, Reports and Administration tabs with counts over one draft, Add Role, Import Roles and View Rights dialogs, Remove with Undo, and Cancel and Save Changes in a bar at the bottom that asks before discarding unsaved changes.",
    dependencies: [
      "@tanstack/react-form@^1",
      "@tanstack/react-table@^9",
      "lucide-react@^1",
      "zod@^4",
    ],
    registryDependencies: [
      "badge",
      "button",
      "dialog",
      "dropdown-menu",
      "field",
      "skeleton",
      "tabs",
    ],
    files: [
      {
        path: "templates/openlmis/user-roles-page/components/add-role-dialog/add-role-dialog.tsx",
        type: "registry:component",
      },
      {
        path: "templates/openlmis/user-roles-page/components/add-role-dialog/role-form.ts",
        type: "registry:lib",
      },
      {
        path: "templates/openlmis/user-roles-page/components/import-roles-dialog/import-roles-dialog.tsx",
        type: "registry:component",
      },
      {
        path: "templates/openlmis/user-roles-page/components/mock-roles.ts",
        type: "registry:lib",
      },
      {
        path: "templates/openlmis/user-roles-page/components/role-assignments-table/role-assignments-table.tsx",
        type: "registry:component",
      },
      {
        path: "templates/openlmis/user-roles-page/components/role-assignments-table/role-assignments.ts",
        type: "registry:lib",
      },
      {
        path: "templates/openlmis/user-roles-page/components/role-assignments-table/role-rights-popover.tsx",
        type: "registry:component",
      },
      {
        path: "templates/openlmis/user-roles-page/components/role-rights-dialog/role-rights-dialog.tsx",
        type: "registry:component",
      },
      {
        path: "templates/openlmis/user-roles-page/components/use-role-draft.ts",
        type: "registry:hook",
      },
      {
        path: "templates/openlmis/user-roles-page/components/user-roles-page.tsx",
        type: "registry:component",
      },
      {
        path: "templates/openlmis/user-roles-page/page.tsx",
        type: "registry:page",
        target: "app/user-roles-page/page.tsx",
      },
    ],
    categories: ["users", "roles"],
    meta: {
      project: "openlmis",
      height: "561px",
    },
  },
  {
    name: "openlmis-not-found-page",
    title: "Not Found Page",
    type: "registry:page",
    description:
      "A 404 page that shows the address that was asked for, with Go Back and Back Home, ready to render inside an app shell so the navigation stays.",
    dependencies: ["lucide-react@^1"],
    registryDependencies: ["button", "empty"],
    files: [
      {
        path: "templates/openlmis/not-found-page/components/not-found-page.tsx",
        type: "registry:component",
      },
      {
        path: "templates/openlmis/not-found-page/page.tsx",
        type: "registry:page",
        target: "app/not-found-page/page.tsx",
      },
    ],
    categories: ["errors", "navigation"],
    meta: {
      project: "openlmis",
      height: "278px",
    },
  },
  {
    name: "openlmis-valid-assignments-page",
    title: "Valid Assignments Page",
    type: "registry:page",
    description:
      "Mock valid sources and destinations with paired facility and program filters, responsive tables, selection across pages, Add and partial Delete.",
    dependencies: [
      "@tanstack/react-form@^1",
      "@tanstack/react-table@^9",
      "lucide-react@^1",
      "zod@^4",
    ],
    registryDependencies: [
      "alert",
      "alert-dialog",
      "button",
      "dropdown-menu",
      "field",
      "spinner",
    ],
    files: [
      {
        path: "templates/openlmis/valid-assignments-page/components/add-assignment-dialog/add-assignment-dialog.tsx",
        type: "registry:component",
      },
      {
        path: "templates/openlmis/valid-assignments-page/components/add-assignment-dialog/assignment-form.ts",
        type: "registry:lib",
      },
      {
        path: "templates/openlmis/valid-assignments-page/components/assignment-columns.tsx",
        type: "registry:component",
      },
      {
        path: "templates/openlmis/valid-assignments-page/components/delete-assignments-dialog/delete-assignments-dialog.tsx",
        type: "registry:component",
      },
      {
        path: "templates/openlmis/valid-assignments-page/components/mock-assignments.ts",
        type: "registry:lib",
      },
      {
        path: "templates/openlmis/valid-assignments-page/components/use-assignments.ts",
        type: "registry:hook",
      },
      {
        path: "templates/openlmis/valid-assignments-page/components/valid-assignments-page.tsx",
        type: "registry:component",
      },
      {
        path: "templates/openlmis/valid-assignments-page/page.tsx",
        type: "registry:page",
        target: "app/valid-assignments-page/page.tsx",
      },
    ],
    categories: ["assignments", "data-table"],
    meta: {
      project: "openlmis",
      height: "803px",
    },
  },
  {
    name: "openlmis-system-settings-page",
    title: "System Settings Page",
    type: "registry:page",
    description:
      "Mock branding and feature flag settings with sticky Save and Cancel, discard confirmation, defaults, conflict Reload and partial-save feedback.",
    dependencies: ["@tanstack/react-form@^1", "lucide-react@^1", "zod@^4"],
    registryDependencies: [
      "alert",
      "alert-dialog",
      "button",
      "popover",
      "spinner",
    ],
    files: [
      {
        path: "templates/openlmis/system-settings-page/components/branding-settings/branding-preview.tsx",
        type: "registry:component",
      },
      {
        path: "templates/openlmis/system-settings-page/components/branding-settings/branding-settings.tsx",
        type: "registry:component",
      },
      {
        path: "templates/openlmis/system-settings-page/components/branding-settings/branding.ts",
        type: "registry:lib",
      },
      {
        path: "templates/openlmis/system-settings-page/components/feature-flags-settings/feature-flags-settings.tsx",
        type: "registry:component",
      },
      {
        path: "templates/openlmis/system-settings-page/components/feature-flags-settings/feature-flags.ts",
        type: "registry:lib",
      },
      {
        path: "templates/openlmis/system-settings-page/components/mock-settings.ts",
        type: "registry:lib",
      },
      {
        path: "templates/openlmis/system-settings-page/components/save-feedback.tsx",
        type: "registry:component",
      },
      {
        path: "templates/openlmis/system-settings-page/components/settings-reset.tsx",
        type: "registry:component",
      },
      {
        path: "templates/openlmis/system-settings-page/components/system-settings-page.tsx",
        type: "registry:component",
      },
      {
        path: "templates/openlmis/system-settings-page/page.tsx",
        type: "registry:page",
        target: "app/system-settings-page/page.tsx",
      },
    ],
    categories: ["settings"],
    meta: {
      project: "openlmis",
      height: "641px",
    },
  },
  {
    name: "openlmis-number-text",
    title: "Number Text",
    type: "registry:component",
    description:
      "Pure number validation for text fields, including whole numbers, bounds and decimal precision.",
    dependencies: ["zod@^4"],
    registryDependencies: ["field", "input"],
    files: [
      {
        path: "components/openlmis/number-text/number-text.ts",
        type: "registry:lib",
      },
    ],
    categories: ["forms"],
    meta: {
      project: "openlmis",
      height: "260px",
    },
  },
  {
    name: "openlmis-product-editor-page",
    title: "Product Editor Page",
    type: "registry:page",
    description:
      "Mock product editor with General, Programs, Facility Types and Kit Unpack List tabs, dialogs and discard confirmation.",
    dependencies: [
      "@tanstack/react-form@^1",
      "@tanstack/react-table@^9",
      "lucide-react@^1",
      "react-dom@^19",
      "zod@^4",
    ],
    registryDependencies: [
      "alert",
      "alert-dialog",
      "badge",
      "button",
      "dropdown-menu",
      "field",
      "skeleton",
      "spinner",
      "table",
    ],
    files: [
      {
        path: "templates/openlmis/product-editor-page/components/facility-approved-products/facility-approved-products.tsx",
        type: "registry:component",
      },
      {
        path: "templates/openlmis/product-editor-page/components/facility-approved-products/remove-approval-dialog.tsx",
        type: "registry:component",
      },
      {
        path: "templates/openlmis/product-editor-page/components/kit-products-dialog/kit-products-dialog.tsx",
        type: "registry:component",
      },
      {
        path: "templates/openlmis/product-editor-page/components/mock-product.ts",
        type: "registry:lib",
      },
      {
        path: "templates/openlmis/product-editor-page/components/product-approval-dialog/approval-form.ts",
        type: "registry:lib",
      },
      {
        path: "templates/openlmis/product-editor-page/components/product-approval-dialog/product-approval-dialog.tsx",
        type: "registry:component",
      },
      {
        path: "templates/openlmis/product-editor-page/components/product-editor-page.tsx",
        type: "registry:component",
      },
      {
        path: "templates/openlmis/product-editor-page/components/product-form-dialog/product-form-dialog.tsx",
        type: "registry:component",
      },
      {
        path: "templates/openlmis/product-editor-page/components/product-general-form/product-form-fields.tsx",
        type: "registry:component",
      },
      {
        path: "templates/openlmis/product-editor-page/components/product-general-form/product-form.ts",
        type: "registry:lib",
      },
      {
        path: "templates/openlmis/product-editor-page/components/product-general-form/product-general-form.tsx",
        type: "registry:component",
      },
      {
        path: "templates/openlmis/product-editor-page/components/product-kit-unpack-list/kit-form.ts",
        type: "registry:lib",
      },
      {
        path: "templates/openlmis/product-editor-page/components/product-kit-unpack-list/product-kit-unpack-list.tsx",
        type: "registry:component",
      },
      {
        path: "templates/openlmis/product-editor-page/components/product-program-link-dialog/product-program-link-dialog.tsx",
        type: "registry:component",
      },
      {
        path: "templates/openlmis/product-editor-page/components/product-program-link-dialog/program-link-form.ts",
        type: "registry:lib",
      },
      {
        path: "templates/openlmis/product-editor-page/components/product-program-links/product-program-links.tsx",
        type: "registry:component",
      },
      {
        path: "templates/openlmis/product-editor-page/components/product-program-links/remove-program-link-dialog.tsx",
        type: "registry:component",
      },
      {
        path: "templates/openlmis/product-editor-page/page.tsx",
        type: "registry:page",
        target: "app/product-editor-page/page.tsx",
      },
    ],
    categories: ["products"],
    meta: {
      project: "openlmis",
      height: "788px",
    },
  },
  {
    name: "openlmis-facility-editor-page",
    title: "Facility Editor Page",
    type: "registry:page",
    description:
      "Mock facility editor with Information and Associated Programs tabs, managed fields, combined validation and discard confirmation.",
    dependencies: ["@tanstack/react-form@^1", "lucide-react@^1", "zod@^4"],
    registryDependencies: [
      "alert",
      "badge",
      "button",
      "empty",
      "field",
      "skeleton",
      "spinner",
      "switch",
      "table",
      "tabs",
    ],
    files: [
      {
        path: "templates/openlmis/facility-editor-page/components/facility-editor-page.tsx",
        type: "registry:component",
      },
      {
        path: "templates/openlmis/facility-editor-page/components/facility-form-dialog/facility-form-dialog.tsx",
        type: "registry:component",
      },
      {
        path: "templates/openlmis/facility-editor-page/components/facility-general-form/facility-form-fields.tsx",
        type: "registry:component",
      },
      {
        path: "templates/openlmis/facility-editor-page/components/facility-general-form/facility-form.ts",
        type: "registry:lib",
      },
      {
        path: "templates/openlmis/facility-editor-page/components/facility-general-form/facility-general-form.tsx",
        type: "registry:component",
      },
      {
        path: "templates/openlmis/facility-editor-page/components/facility-program-dialog/facility-program-dialog.tsx",
        type: "registry:component",
      },
      {
        path: "templates/openlmis/facility-editor-page/components/facility-program-dialog/facility-program.ts",
        type: "registry:lib",
      },
      {
        path: "templates/openlmis/facility-editor-page/components/facility-programs/facility-programs.tsx",
        type: "registry:component",
      },
      {
        path: "templates/openlmis/facility-editor-page/components/mock-facility.ts",
        type: "registry:lib",
      },
      {
        path: "templates/openlmis/facility-editor-page/page.tsx",
        type: "registry:page",
        target: "app/facility-editor-page/page.tsx",
      },
    ],
    categories: ["facilities"],
    meta: {
      project: "openlmis",
      height: "680px",
    },
  },
  {
    name: "openlmis-reason-editor-page",
    title: "Reason Editor Page",
    type: "registry:page",
    description:
      "Mock stock reason editor with assignment pairs, partial-save feedback and discard confirmation.",
    dependencies: ["@tanstack/react-form@^1", "lucide-react@^1", "zod@^4"],
    registryDependencies: [
      "alert",
      "button",
      "empty",
      "field",
      "skeleton",
      "spinner",
      "switch",
      "table",
    ],
    files: [
      {
        path: "templates/openlmis/reason-editor-page/components/mock-reason.ts",
        type: "registry:lib",
      },
      {
        path: "templates/openlmis/reason-editor-page/components/reason-assignment-dialog/reason-assignment-dialog.tsx",
        type: "registry:component",
      },
      {
        path: "templates/openlmis/reason-editor-page/components/reason-assignment-dialog/reason-assignment.ts",
        type: "registry:lib",
      },
      {
        path: "templates/openlmis/reason-editor-page/components/reason-assignments/reason-assignments.tsx",
        type: "registry:component",
      },
      {
        path: "templates/openlmis/reason-editor-page/components/reason-editor-page.tsx",
        type: "registry:component",
      },
      {
        path: "templates/openlmis/reason-editor-page/components/reason-form-dialog/reason-form-dialog.tsx",
        type: "registry:component",
      },
      {
        path: "templates/openlmis/reason-editor-page/components/reason-general-form/reason-form-fields.tsx",
        type: "registry:component",
      },
      {
        path: "templates/openlmis/reason-editor-page/components/reason-general-form/reason-form.ts",
        type: "registry:lib",
      },
      {
        path: "templates/openlmis/reason-editor-page/components/reason-general-form/reason-general-form.tsx",
        type: "registry:component",
      },
      {
        path: "templates/openlmis/reason-editor-page/page.tsx",
        type: "registry:page",
        target: "app/reason-editor-page/page.tsx",
      },
    ],
    categories: ["stock"],
    meta: {
      project: "openlmis",
      height: "813px",
    },
  },
  {
    name: "openlmis-auth-card",
    title: "Auth Card",
    type: "registry:block",
    description:
      "Composable authentication cards and a page shell with logo, title, form, actions and Powered By footer.",
    dependencies: [],
    registryDependencies: ["button", "card", "field", "spinner"],
    files: [
      {
        path: "blocks/openlmis/auth-card/auth-card.tsx",
        type: "registry:component",
      },
    ],
    categories: ["auth", "forms"],
    meta: {
      project: "openlmis",
      height: "329px",
    },
  },
  {
    name: "openlmis-no-access",
    title: "No Access",
    type: "registry:component",
    description:
      "No-access empty state with a heading-level choice and optional Back Home link.",
    dependencies: ["lucide-react@^1"],
    registryDependencies: ["button", "empty"],
    files: [
      {
        path: "components/openlmis/no-access/no-access.tsx",
        type: "registry:component",
      },
    ],
    categories: ["feedback"],
    meta: {
      project: "openlmis",
      height: "477px",
    },
  },
  {
    name: "openlmis-sign-in-page",
    title: "Sign In Page",
    type: "registry:page",
    description:
      "Mock sign-in page with credentials, refused feedback and a signed-in result.",
    dependencies: ["@tanstack/react-form@^1", "zod@^4"],
    registryDependencies: ["button", "card", "field"],
    files: [
      {
        path: "templates/openlmis/sign-in-page/components/session-expired-dialog/session-expired-dialog.tsx",
        type: "registry:component",
      },
      {
        path: "templates/openlmis/sign-in-page/components/sign-in-form/sign-in-form.tsx",
        type: "registry:component",
      },
      {
        path: "templates/openlmis/sign-in-page/components/sign-in-page.tsx",
        type: "registry:component",
      },
      {
        path: "templates/openlmis/sign-in-page/page.tsx",
        type: "registry:page",
        target: "app/sign-in-page/page.tsx",
      },
    ],
    categories: ["auth"],
    meta: {
      project: "openlmis",
      height: "484px",
    },
  },
  {
    name: "openlmis-forgot-password-page",
    title: "Forgot Password Page",
    type: "registry:page",
    description: "Mock email reset request page with a neutral confirmation.",
    dependencies: ["@tanstack/react-form@^1", "zod@^4"],
    registryDependencies: ["card"],
    files: [
      {
        path: "templates/openlmis/forgot-password-page/components/forgot-password-form/forgot-password-form.tsx",
        type: "registry:component",
      },
      {
        path: "templates/openlmis/forgot-password-page/components/forgot-password-page.tsx",
        type: "registry:component",
      },
      {
        path: "templates/openlmis/forgot-password-page/page.tsx",
        type: "registry:page",
        target: "app/forgot-password-page/page.tsx",
      },
    ],
    categories: ["auth"],
    meta: {
      project: "openlmis",
      height: "468px",
    },
  },
  {
    name: "openlmis-reset-password-page",
    title: "Reset Password Page",
    type: "registry:page",
    description:
      "Mock password reset page with validation and link-status presentation.",
    dependencies: ["@tanstack/react-form@^1"],
    registryDependencies: ["card"],
    files: [
      {
        path: "templates/openlmis/reset-password-page/components/reset-password-form/reset-password-form.tsx",
        type: "registry:component",
      },
      {
        path: "templates/openlmis/reset-password-page/components/reset-password-page.tsx",
        type: "registry:component",
      },
      {
        path: "templates/openlmis/reset-password-page/page.tsx",
        type: "registry:page",
        target: "app/reset-password-page/page.tsx",
      },
    ],
    categories: ["auth"],
    meta: {
      project: "openlmis",
      height: "603px",
    },
  },
  {
    name: "openlmis-lots-page",
    title: "Lots Page",
    type: "registry:page",
    description:
      "Mock lot list with product/expiry filters, paging and editable lot dialogs.",
    dependencies: [
      "@tanstack/react-form@^1",
      "@tanstack/react-table@^9",
      "lucide-react@^1",
      "zod@^4",
    ],
    registryDependencies: ["button", "dropdown-menu", "field"],
    files: [
      {
        path: "templates/openlmis/lots-page/components/lot-form-dialog/lot-form-dialog.tsx",
        type: "registry:component",
      },
      {
        path: "templates/openlmis/lots-page/components/lot-form-dialog/lot-form.ts",
        type: "registry:lib",
      },
      {
        path: "templates/openlmis/lots-page/components/lots-page.tsx",
        type: "registry:component",
      },
      {
        path: "templates/openlmis/lots-page/components/lots-table/lots-table.tsx",
        type: "registry:component",
      },
      {
        path: "templates/openlmis/lots-page/components/lots-table/lots-toolbar.tsx",
        type: "registry:component",
      },
      {
        path: "templates/openlmis/lots-page/components/lots-table/lots.ts",
        type: "registry:lib",
      },
      {
        path: "templates/openlmis/lots-page/components/mock-lots.ts",
        type: "registry:lib",
      },
      {
        path: "templates/openlmis/lots-page/page.tsx",
        type: "registry:page",
        target: "app/lots-page/page.tsx",
      },
    ],
    categories: ["administration"],
    meta: {
      project: "openlmis",
      height: "747px",
    },
  },
  {
    name: "openlmis-service-accounts-page",
    title: "Service Accounts Page",
    type: "registry:page",
    description:
      "Mock service-key list with sorting, paging, add/delete dialogs and copy-state presentation.",
    dependencies: ["@tanstack/react-table@^9", "lucide-react@^1"],
    registryDependencies: [
      "alert",
      "alert-dialog",
      "button",
      "dropdown-menu",
      "spinner",
    ],
    files: [
      {
        path: "templates/openlmis/service-accounts-page/components/mock-service-accounts.ts",
        type: "registry:lib",
      },
      {
        path: "templates/openlmis/service-accounts-page/components/service-account-form-dialog/service-account-form-dialog.tsx",
        type: "registry:component",
      },
      {
        path: "templates/openlmis/service-accounts-page/components/service-account.ts",
        type: "registry:lib",
      },
      {
        path: "templates/openlmis/service-accounts-page/components/service-accounts-page.tsx",
        type: "registry:component",
      },
      {
        path: "templates/openlmis/service-accounts-page/components/service-accounts-table/service-accounts-table.tsx",
        type: "registry:component",
      },
      {
        path: "templates/openlmis/service-accounts-page/page.tsx",
        type: "registry:page",
        target: "app/service-accounts-page/page.tsx",
      },
    ],
    categories: ["administration"],
    meta: {
      project: "openlmis",
      height: "459px",
    },
  },
  {
    name: "openlmis-copyable-value",
    title: "Copyable Value",
    type: "registry:component",
    description:
      "A value display and controlled copy button, with caller-owned copy behavior and feedback.",
    categories: ["feedback"],
    meta: {
      project: "openlmis",
      height: "146px",
    },
    dependencies: ["lucide-react@^1"],
    registryDependencies: ["button", "utils"],
    files: [
      {
        path: "components/openlmis/copyable-value/copyable-value.tsx",
        type: "registry:component",
      },
    ],
  },
  {
    name: "openlmis-label-popover",
    title: "Label Popover",
    type: "registry:component",
    description:
      "A truncated label with an accessible details button and a composable popover panel.",
    categories: ["feedback"],
    meta: {
      project: "openlmis",
      height: "384px",
    },
    dependencies: ["lucide-react@^1"],
    registryDependencies: ["button", "popover"],
    files: [
      {
        path: "components/openlmis/label-popover/label-popover.tsx",
        type: "registry:component",
      },
    ],
  },
  {
    name: "openlmis-segmented-meter",
    title: "Segmented Meter",
    type: "registry:component",
    description:
      "A stacked meter with a labeled count and percentage legend, locale formatting and right-to-left support.",
    categories: ["charts"],
    meta: {
      project: "openlmis",
      height: "330px",
    },
    dependencies: ["recharts@^3"],
    registryDependencies: ["chart", "utils"],
    files: [
      {
        path: "components/openlmis/segmented-meter/segmented-meter.tsx",
        type: "registry:component",
      },
    ],
  },
  {
    name: "openlmis-status-meter-list",
    title: "Status Meter List",
    type: "registry:component",
    description:
      "Composable labeled meters with icons, counts and semantic tones.",
    categories: ["charts"],
    meta: {
      project: "openlmis",
      height: "220px",
    },
    dependencies: ["@base-ui/react@^1", "lucide-react@^1"],
    registryDependencies: ["utils"],
    files: [
      {
        path: "components/openlmis/status-meter-list/status-meter-list.tsx",
        type: "registry:component",
      },
    ],
  },
  {
    name: "openlmis-programs-page",
    title: "Programs Page",
    type: "registry:page",
    description:
      "Mock program administration with responsive columns, sorting, paging and create/edit forms.",
    categories: ["administration"],
    meta: {
      project: "openlmis",
      height: "507px",
    },
    dependencies: [
      "@tanstack/react-form@^1",
      "@tanstack/react-table@^9",
      "lucide-react@^1",
      "zod@^4",
    ],
    registryDependencies: ["button", "dropdown-menu", "field"],
    files: [
      {
        path: "templates/openlmis/programs-page/components/mock-programs.ts",
        type: "registry:lib",
      },
      {
        path: "templates/openlmis/programs-page/components/program-columns.tsx",
        type: "registry:component",
      },
      {
        path: "templates/openlmis/programs-page/components/program-form-dialog/program-form-dialog.tsx",
        type: "registry:component",
      },
      {
        path: "templates/openlmis/programs-page/components/program-form-dialog/program-form.ts",
        type: "registry:lib",
      },
      {
        path: "templates/openlmis/programs-page/components/programs-page.tsx",
        type: "registry:component",
      },
      {
        path: "templates/openlmis/programs-page/page.tsx",
        type: "registry:page",
        target: "app/programs-page/page.tsx",
      },
    ],
  },
  {
    name: "openlmis-facility-types-page",
    title: "Facility Types Page",
    type: "registry:page",
    description:
      "Mock facility type administration with responsive columns, sorting, paging and create/edit forms.",
    categories: ["administration"],
    meta: {
      project: "openlmis",
      height: "411px",
    },
    dependencies: [
      "@tanstack/react-form@^1",
      "@tanstack/react-table@^9",
      "lucide-react@^1",
      "zod@^4",
    ],
    registryDependencies: ["button", "dropdown-menu", "field"],
    files: [
      {
        path: "templates/openlmis/facility-types-page/components/facility-type-columns.tsx",
        type: "registry:component",
      },
      {
        path: "templates/openlmis/facility-types-page/components/facility-type-form-dialog/facility-type-form-dialog.tsx",
        type: "registry:component",
      },
      {
        path: "templates/openlmis/facility-types-page/components/facility-type-form-dialog/facility-type-form.ts",
        type: "registry:lib",
      },
      {
        path: "templates/openlmis/facility-types-page/components/facility-types-page.tsx",
        type: "registry:component",
      },
      {
        path: "templates/openlmis/facility-types-page/components/mock-facility-types.ts",
        type: "registry:lib",
      },
      {
        path: "templates/openlmis/facility-types-page/page.tsx",
        type: "registry:page",
        target: "app/facility-types-page/page.tsx",
      },
    ],
  },
]
