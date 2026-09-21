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
// - `meta.height` is the catalog iframe height. Measure it, do not guess.
export const registryItems: RegistryItem[] = [
  // -- Components -------------------------------------------------------------
  {
    name: "openlmis-status-pill",
    title: "Requisition Status Pill",
    type: "registry:component",
    description:
      "Badge that renders an OpenLMIS requisition status with the colour and label matched to its stage, from initiated through to released.",
    dependencies: [],
    registryDependencies: ["badge"],
    files: [
      {
        path: "components/openlmis/status-pill/status-pill.tsx",
        type: "registry:component",
      },
    ],
    categories: ["data-display"],
    meta: { project: "openlmis", height: "220px" },
  },

  // -- Blocks -----------------------------------------------------------------
  {
    name: "openlmis-requisition-table",
    title: "Requisition Line Items Table",
    type: "registry:block",
    description:
      "Requisition review table listing products with beginning balance, received and consumed quantities, stock on hand, and requested quantity, above a totals row and approve and reject actions.",
    dependencies: [],
    registryDependencies: ["badge", "button", "card", "separator", "table"],
    files: [
      {
        path: "blocks/openlmis/requisition-table/requisition-table.tsx",
        type: "registry:component",
      },
    ],
    categories: ["requisition"],
    meta: { project: "openlmis", height: "760px" },
  },
  {
    name: "openlmis-stock-summary",
    title: "Stock On Hand Summary Cards",
    type: "registry:block",
    description:
      "Stock overview band of four summary cards (total stock on hand, items below minimum, items expiring soon, and stockouts), each with its change against the previous period.",
    dependencies: [],
    registryDependencies: ["card", "utils"],
    files: [
      {
        path: "blocks/openlmis/stock-summary/stock-summary.tsx",
        type: "registry:component",
      },
    ],
    categories: ["stock"],
    meta: { project: "openlmis", height: "340px" },
  },
  {
    name: "openlmis-facility-filters",
    title: "Facility Program Period Selector",
    type: "registry:block",
    description:
      "Filter bar for scoping a view to a facility, program, and reporting period, with the active selection summarised beside a search field and a clear-filters action.",
    dependencies: [],
    registryDependencies: [
      "badge",
      "button",
      "card",
      "field",
      "input",
      "select",
    ],
    files: [
      {
        path: "blocks/openlmis/facility-filters/facility-filters.tsx",
        type: "registry:component",
      },
    ],
    categories: ["facility"],
    meta: { project: "openlmis", height: "420px" },
  },

  // -- Templates --------------------------------------------------------------
  {
    name: "openlmis-requisition-approval",
    title: "Requisition Approval Page",
    type: "registry:page",
    description:
      "Complete requisition approval screen: a facility, program and period filter bar above the line-item review table, with the requisition status summarised in the page header.",
    dependencies: [],
    registryDependencies: [
      "badge",
      "button",
      "card",
      "field",
      "input",
      "select",
      "separator",
      "table",
    ],
    files: [
      {
        path: "templates/openlmis/requisition-approval/page.tsx",
        type: "registry:page",
        // registry:page requires an explicit target; the shadcn schema rejects the item without one.
        target: "app/requisition-approval/page.tsx",
      },
      {
        path: "templates/openlmis/requisition-approval/components/approval-filters.tsx",
        type: "registry:component",
      },
      {
        path: "templates/openlmis/requisition-approval/components/approval-table.tsx",
        type: "registry:component",
      },
    ],
    categories: ["requisition"],
    meta: { project: "openlmis", height: "980px" },
  },
]
