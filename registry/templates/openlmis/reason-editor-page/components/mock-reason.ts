import type {
  AssignmentOption,
  ReasonAssignment,
} from "@/registry/blocks/openlmis/reason-assignment-dialog/reason-assignment"
import type { ReasonValues } from "@/registry/blocks/openlmis/reason-general-form/reason-form"

export type MockReason = {
  values: ReasonValues
  assignments: ReasonAssignment[]
}

export const MOCK_PROGRAMS: AssignmentOption[] = [
  { id: "family-planning", name: "Family Planning" },
  { id: "essential-meds", name: "Essential Meds" },
  { id: "new-program", name: "New Program" },
  { id: "epi", name: "EPI" },
]

/** Every facility type, so a saved row for an inactive one still has a name. */
export const MOCK_FACILITY_TYPES: AssignmentOption[] = [
  { id: "health-center", name: "Health Center" },
  { id: "district-hospital", name: "District Hospital" },
  { id: "district-store", name: "District Store" },
  { id: "warehouse", name: "Warehouse" },
  { id: "dispensary", name: "Dispensary" },
]

/** Only active types are offered for a new row. */
export const MOCK_ACTIVE_FACILITY_TYPES = MOCK_FACILITY_TYPES.filter(
  (type) => type.id !== "dispensary"
)

/** Tags other reasons use, suggested as the user types. */
export const MOCK_TAGS = [
  "adjustment",
  "consumed",
  "damaged",
  "expired",
  "receipts",
]

/** Names other reasons already have. */
export const MOCK_TAKEN_NAMES = ["Transfer Out", "Damage", "Expired", "Stolen"]

export const MOCK_REASON: MockReason = {
  values: {
    name: "Transfer In",
    category: "TRANSFER",
    type: "CREDIT",
    isFreeTextAllowed: false,
    tags: ["receipts"],
  },
  assignments: [
    {
      programId: "family-planning",
      facilityTypeId: "health-center",
      show: true,
    },
    { programId: "family-planning", facilityTypeId: "dispensary", show: false },
    {
      programId: "essential-meds",
      facilityTypeId: "district-hospital",
      show: true,
    },
  ],
}
