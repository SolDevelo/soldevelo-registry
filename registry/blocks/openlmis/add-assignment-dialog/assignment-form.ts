import { z } from "zod"

/** Valid sources say where a facility type may receive stock from; destinations, where it may issue to. */
export type AssignmentKind = "sources" | "destinations"

export const ASSIGNMENT_LABELS = {
  sources: {
    one: "Valid Source",
    many: "Valid Sources",
    flow: "receive stock from",
  },
  destinations: {
    one: "Valid Destination",
    many: "Valid Destinations",
    flow: "issue stock to",
  },
} as const satisfies Record<
  AssignmentKind,
  { one: string; many: string; flow: string }
>

export type AssignmentChoice = {
  id: string
  name: string
  /** Muted beside the name, e.g. a facility's code. */
  code?: string
}

export type GeoLevelChoice = {
  id: string
  name: string
  levelNumber: number
}

/** The dialog's lists; one left undefined shows a skeleton in its field. */
export type AssignmentChoices = {
  programs: readonly AssignmentChoice[] | undefined
  facilityTypes: readonly AssignmentChoice[] | undefined
  facilities: readonly AssignmentChoice[] | undefined
  organizations: readonly AssignmentChoice[] | undefined
  geoLevels: readonly GeoLevelChoice[] | undefined
}

export type AssignmentNodeType = "facility" | "organization"

/** What the dialog submits: the place is a facility or an organization, never both. */
export type NewAssignment = {
  programId: string
  facilityTypeId: string
  nodeType: AssignmentNodeType
  nodeId: string
  geoLevelAffinityId: string | null
}

export const assignmentFormSchema = z
  .object({
    programId: z.string().min(1, "Pick a program."),
    facilityTypeId: z.string().min(1, "Pick a facility type."),
    nodeType: z.enum(["facility", "organization"]),
    facilityId: z.string().nullable(),
    organizationId: z.string(),
    geoLevelAffinityId: z.string().nullable(),
  })
  .superRefine((values, context) => {
    if (values.nodeType === "facility" && !values.facilityId) {
      context.addIssue({
        code: "custom",
        path: ["facilityId"],
        message: "Pick a facility.",
      })
    }
    if (values.nodeType === "organization" && !values.organizationId) {
      context.addIssue({
        code: "custom",
        path: ["organizationId"],
        message: "Pick an organization.",
      })
    }
  })

export type AssignmentFormValues = z.infer<typeof assignmentFormSchema>

export const EMPTY_ASSIGNMENT_FORM: AssignmentFormValues = {
  programId: "",
  facilityTypeId: "",
  nodeType: "facility",
  facilityId: null,
  organizationId: "",
  geoLevelAffinityId: null,
}

/** Only the place of the choice shown is sent; each side keeps its pick while the other is shown. */
export function toNewAssignment(values: AssignmentFormValues): NewAssignment {
  return {
    programId: values.programId,
    facilityTypeId: values.facilityTypeId,
    nodeType: values.nodeType,
    nodeId:
      values.nodeType === "facility"
        ? (values.facilityId ?? "")
        : values.organizationId,
    geoLevelAffinityId: values.geoLevelAffinityId,
  }
}
