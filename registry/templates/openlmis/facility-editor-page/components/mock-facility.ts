import type { FacilityValues } from "./facility-general-form/facility-form"
import type { FacilityLookups } from "./facility-general-form/facility-form-fields"
import type {
  FacilityProgram,
  ProgramOption,
} from "./facility-program-dialog/facility-program"

export type MockFacility = {
  values: FacilityValues
  programs: FacilityProgram[]
  /** Another system owns its name, code, zone, description and Active. */
  managedExternally: boolean
}

export const MOCK_LOOKUPS: FacilityLookups = {
  types: [
    { id: "health-center", name: "Health Center" },
    { id: "district-hospital", name: "District Hospital" },
    { id: "district-store", name: "District Store" },
    { id: "warehouse", name: "Warehouse" },
  ],
  zones: [
    { id: "malawi", name: "Malawi", description: "Country" },
    { id: "southern", name: "Southern Region", description: "Region" },
    { id: "balaka", name: "Balaka", description: "District" },
    { id: "neno", name: "Neno", description: "District" },
  ],
  operators: [
    { id: "moh", name: "Ministry of Health" },
    { id: "chai", name: "CHAI" },
    { id: "dwb", name: "Doctors Without Borders" },
  ],
}

export const MOCK_PROGRAMS: ProgramOption[] = [
  { id: "family-planning", code: "PRG001", name: "Family Planning" },
  { id: "essential-meds", code: "PRG002", name: "Essential Meds" },
  { id: "new-program", code: "PRG003", name: "New Program" },
  { id: "epi", code: "PRG004", name: "EPI" },
  { id: "tb", code: "PRG005", name: "TB" },
]

/** Codes other facilities already use. */
export const MOCK_TAKEN_CODES = ["HC02", "HC03", "DH01", "W001"]

export const MOCK_FACILITY: MockFacility = {
  values: {
    name: "Comfort Health Clinic",
    code: "HC01",
    typeId: "health-center",
    zoneId: "neno",
    goLiveDate: "2017-01-01",
    description: "",
    operatorId: "moh",
    active: true,
    enabled: true,
  },
  programs: [
    {
      id: "family-planning",
      code: "PRG001",
      name: "Family Planning",
      supportActive: true,
      supportLocallyFulfilled: false,
      supportStartDate: "2017-01-01",
      saved: true,
    },
    {
      id: "essential-meds",
      code: "PRG002",
      name: "Essential Meds",
      supportActive: true,
      supportLocallyFulfilled: true,
      // Legacy records may have no start date; a saved row keeps that.
      supportStartDate: "",
      saved: true,
    },
  ],
  managedExternally: false,
}

export const MOCK_MANAGED_FACILITY: MockFacility = {
  values: {
    name: "Balaka District Hospital",
    code: "DH01",
    typeId: "district-hospital",
    zoneId: "balaka",
    goLiveDate: "2016-06-01",
    description: "Synced from the national facility registry.",
    operatorId: "moh",
    active: true,
    enabled: true,
  },
  programs: [
    {
      id: "epi",
      code: "PRG004",
      name: "EPI",
      supportActive: true,
      supportLocallyFulfilled: false,
      supportStartDate: "2016-06-01",
      saved: true,
    },
  ],
  managedExternally: true,
}
