// Mock facility types, so the page runs with no backend. Pass your own instead.

import type { FacilityType } from "./facility-type-form-dialog/facility-type-form"

export const MOCK_FACILITY_TYPES: FacilityType[] = [
  {
    id: "type-health-center",
    code: "health_center",
    name: "Health Center",
    displayOrder: 1,
    active: true,
    primaryHealthCare: true,
  },
  {
    id: "type-district-hospital",
    code: "district_hospital",
    name: "District Hospital",
    displayOrder: 2,
    active: true,
    primaryHealthCare: false,
  },
  {
    id: "type-warehouse",
    code: "warehouse",
    name: "Warehouse",
    displayOrder: 3,
    active: false,
    primaryHealthCare: false,
  },
]
