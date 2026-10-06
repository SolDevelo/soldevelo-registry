import type {
  AssignmentChoice,
  AssignmentKind,
  AssignmentNodeType,
  GeoLevelChoice,
} from "./add-assignment-dialog/assignment-form"

export type MockFacility = AssignmentChoice & {
  code: string
  typeId: string
  geoZone: string
}

export type ValidAssignment = {
  id: string
  programId: string
  facilityTypeId: string
  nodeType: AssignmentNodeType
  nodeId: string
  geoLevelAffinityId: string | null
  /** Mock only: deleting it fails, to show a delete that only partly went through. */
  locked?: boolean
}

export const MOCK_PROGRAMS: AssignmentChoice[] = [
  { id: "fp", name: "Family Planning" },
  { id: "em", name: "Essential Meds" },
  { id: "tb", name: "TB" },
]

export const MOCK_FACILITY_TYPES: AssignmentChoice[] = [
  { id: "hc", name: "Health Center" },
  { id: "dh", name: "District Hospital" },
  { id: "wh", name: "Warehouse" },
]

export const MOCK_FACILITIES: MockFacility[] = [
  {
    id: "w1",
    code: "W001",
    name: "Ntcheu District Warehouse",
    typeId: "wh",
    geoZone: "Ntcheu",
  },
  {
    id: "w2",
    code: "W002",
    name: "Balaka District Warehouse",
    typeId: "wh",
    geoZone: "Balaka",
  },
  {
    id: "w3",
    code: "W003",
    name: "Lilongwe Regional Warehouse",
    typeId: "wh",
    geoZone: "Central Region",
  },
  {
    id: "h1",
    code: "HC01",
    name: "Comfort Health Clinic",
    typeId: "hc",
    geoZone: "Ntcheu",
  },
  {
    id: "h2",
    code: "HC02",
    name: "Nandumbo Health Center",
    typeId: "hc",
    geoZone: "Balaka",
  },
  {
    id: "d1",
    code: "DH01",
    name: "Balaka District Hospital",
    typeId: "dh",
    geoZone: "Balaka",
  },
]

export const MOCK_ORGANIZATIONS: AssignmentChoice[] = [
  { id: "o1", name: "Malawi Red Cross" },
  { id: "o2", name: "Medecins Sans Frontieres" },
  { id: "o3", name: "UNICEF Supply Division" },
]

export const MOCK_GEO_LEVELS: GeoLevelChoice[] = [
  { id: "country", name: "Country", levelNumber: 1 },
  { id: "region", name: "Region", levelNumber: 2 },
  { id: "district", name: "District", levelNumber: 3 },
]

const assignment = (
  id: string,
  programId: string,
  facilityTypeId: string,
  nodeId: string,
  extra: Partial<ValidAssignment> = {}
): ValidAssignment => ({
  id,
  programId,
  facilityTypeId,
  nodeType: nodeId.startsWith("o") ? "organization" : "facility",
  nodeId,
  geoLevelAffinityId: null,
  ...extra,
})

export const MOCK_ASSIGNMENTS: Record<AssignmentKind, ValidAssignment[]> = {
  sources: [
    assignment("s1", "fp", "hc", "w1", { geoLevelAffinityId: "district" }),
    assignment("s2", "fp", "hc", "w2", { geoLevelAffinityId: "district" }),
    assignment("s3", "fp", "dh", "w3", { geoLevelAffinityId: "region" }),
    assignment("s4", "fp", "hc", "o1", { locked: true }),
    assignment("s5", "em", "hc", "w1"),
    assignment("s6", "em", "hc", "w2"),
    assignment("s7", "em", "dh", "w3"),
    assignment("s8", "em", "dh", "o2"),
    assignment("s9", "em", "wh", "w3", { geoLevelAffinityId: "country" }),
    assignment("s10", "tb", "hc", "d1"),
    assignment("s11", "tb", "dh", "w3"),
    assignment("s12", "tb", "dh", "o3"),
    assignment("s13", "fp", "wh", "w3", { geoLevelAffinityId: "region" }),
  ],
  destinations: [
    assignment("d1", "fp", "wh", "h1", { geoLevelAffinityId: "district" }),
    assignment("d2", "fp", "wh", "h2", { geoLevelAffinityId: "district" }),
    assignment("d3", "fp", "wh", "d1"),
    assignment("d4", "em", "wh", "h1", { locked: true }),
    assignment("d5", "em", "wh", "h2"),
    assignment("d6", "em", "wh", "o1"),
    assignment("d7", "em", "dh", "h2", { geoLevelAffinityId: "district" }),
    assignment("d8", "tb", "dh", "o2"),
    assignment("d9", "tb", "wh", "d1"),
  ],
}
