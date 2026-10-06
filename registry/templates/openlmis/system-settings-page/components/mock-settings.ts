import type { Branding } from "@/registry/blocks/openlmis/branding-settings/branding"
import type {
  FeatureFlagDefinition,
  StoredFlags,
} from "@/registry/blocks/openlmis/feature-flags-settings/feature-flags"

export const DEFAULT_APP_NAME = "OpenLMIS"
export const DEFAULT_LOGO_URL = "/projects/openlmis.png"

export type SystemSettings = {
  branding: Branding
  featureFlags: StoredFlags
}

export const MOCK_SETTINGS: SystemSettings = {
  branding: { appName: "SIGECA", showAppName: true, logo: null },
  featureFlags: { BATCH_APPROVE_SCREEN: true },
}

export const MOCK_RELOADED_SETTINGS: SystemSettings = {
  branding: { appName: "SIGECA Health", showAppName: true, logo: null },
  featureFlags: { BATCH_APPROVE_SCREEN: false },
}

const QUANTITY_UNITS = {
  PACKS: { value: "PACKS", label: "Packs" },
  DOSES: { value: "DOSES", label: "Doses" },
  BOTH: { value: "BOTH", label: "Packs And Doses" },
}

export const MOCK_FLAGS: FeatureFlagDefinition[] = [
  {
    key: "BATCH_APPROVE_SCREEN",
    type: "boolean",
    label: "Batch Approval",
    description: "Approve several requisitions of the same program at once.",
    usedBy: "Requisitions > Approve",
    inherited: { value: false, source: "default" },
  },
  {
    key: "DEFAULT_QUANTITY_UNIT",
    type: "enum",
    options: [QUANTITY_UNITS.PACKS, QUANTITY_UNITS.DOSES],
    label: "Default Quantity Unit",
    description: "The unit quantities start in, until a user picks another.",
    usedBy: "Stock Management, Requisitions",
    inherited: { value: "DOSES", source: "default" },
  },
  {
    key: "GS1_SCANNING",
    type: "boolean",
    label: "GS1 Barcode Scanning",
    description: "Add products by scanning their GS1 barcode.",
    usedBy:
      "Stock Management > Physical Inventory, Adjustments, Issue, Receive",
    inherited: { value: true, source: "deployment" },
  },
  {
    key: "QUANTITY_UNIT_OPTION",
    type: "enum",
    options: Object.values(QUANTITY_UNITS),
    label: "Quantity Units",
    description:
      "Whether users can switch between packs and doses. With one unit, they cannot switch; the unit shown is still the default quantity unit.",
    usedBy: "Stock Management, Requisitions",
    inherited: { value: "BOTH", source: "default" },
  },
  {
    key: "SHOW_REQUISITION_LESS_ORDER",
    type: "boolean",
    label: "Create Orders Without A Requisition",
    description: "Show Create Order in the Orders menu.",
    usedBy: "Orders > Create Order",
    inherited: { value: true, source: "default" },
  },
]
