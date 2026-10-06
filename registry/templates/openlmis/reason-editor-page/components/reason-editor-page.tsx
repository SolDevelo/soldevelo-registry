"use client"

import { AlertCircleIcon, MessageSquareTextIcon } from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { FieldDescription, FieldLegend, FieldSet } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import {
  assignmentKey,
  assignmentNames,
  type ReasonAssignment,
} from "./reason-assignment-dialog/reason-assignment"
import { ReasonAssignments } from "./reason-assignments/reason-assignments"
import {
  EMPTY_REASON,
  type ReasonValues,
} from "./reason-general-form/reason-form"
import { ReasonGeneralForm } from "./reason-general-form/reason-general-form"
import {
  Workspace,
  WorkspaceContent,
  WorkspaceDescription,
  WorkspaceFooter,
  WorkspaceHeader,
  WorkspaceHeading,
  WorkspaceIcon,
  WorkspaceTitle,
} from "@/registry/blocks/openlmis/workspace/workspace"
import { Callout } from "@/registry/components/openlmis/callout/callout"
import { DiscardChangesDialog } from "@/registry/components/openlmis/discard-changes-dialog/discard-changes-dialog"
import { PageBreadcrumbs } from "@/registry/components/openlmis/page-breadcrumbs/page-breadcrumbs"

import {
  MOCK_ACTIVE_FACILITY_TYPES,
  MOCK_FACILITY_TYPES,
  MOCK_PROGRAMS,
  MOCK_REASON,
  MOCK_TAGS,
  MOCK_TAKEN_NAMES,
  type MockReason,
} from "./mock-reason"

const FORM_ID = "reason-form"

type ReasonEditorPageProps = {
  /** Start on a new, empty reason. */
  adding?: boolean
  /** Show the skeleton, as while the reason loads. */
  loading?: boolean
  /** Show Save as in progress. */
  pending?: boolean
  /** Mock outcome: every save fails. */
  saveFails?: boolean
  /** Mock outcome: the server refuses any changed name. */
  refuseNames?: boolean
  /** Mock outcome: the reason saves, but its new or changed places do not. */
  placesFail?: boolean
}

const NEW_REASON: MockReason = { values: EMPTY_REASON, assignments: [] }

const LOOKUPS = { tags: MOCK_TAGS }

const NAMES = assignmentNames(MOCK_PROGRAMS, MOCK_FACILITY_TYPES)

/** Rows that are new, or whose Show changed, since the last save. */
function unsavedAssignments(
  rows: readonly ReasonAssignment[],
  saved: readonly ReasonAssignment[]
) {
  const stored = new Map(saved.map((row) => [assignmentKey(row), row]))
  return rows.filter((row) => stored.get(assignmentKey(row))?.show !== row.show)
}

const sameAssignments = (
  rows: readonly ReasonAssignment[],
  saved: readonly ReasonAssignment[]
) =>
  rows.length === saved.length && unsavedAssignments(rows, saved).length === 0

type Notice = { title: string; description: string }

/** Focuses the first invalid field, waiting for it to render if needed. */
function focusFirstError(container: HTMLElement) {
  const focus = () => {
    const field = container.querySelector<HTMLElement>('[aria-invalid="true"]')
    field?.focus()
    return Boolean(field)
  }
  if (focus()) return () => {}
  const observer = new MutationObserver(() => {
    if (focus()) observer.disconnect()
  })
  observer.observe(container, {
    attributes: true,
    attributeFilter: ["aria-invalid"],
    childList: true,
    subtree: true,
  })
  return () => observer.disconnect()
}

/** Add or edit a stock reason: why stock moves, and where the reason is offered. */
export function ReasonEditorPage({
  adding: startAdding = false,
  loading = false,
  pending = false,
  saveFails = false,
  refuseNames = false,
  placesFail = false,
}: ReasonEditorPageProps) {
  const [adding, setAdding] = useState(startAdding)
  const [saved, setSaved] = useState(startAdding ? NEW_REASON : MOCK_REASON)
  // Bumped to start the form again from `saved`, after a save or a discard.
  const [revision, setRevision] = useState(0)
  const [assignments, setAssignments] = useState(saved.assignments)
  const [formChanges, setFormChanges] = useState(0)
  const [refusedNames, setRefusedNames] = useState<string[]>([])
  const [saveError, setSaveError] = useState(false)
  const [notSaved, setNotSaved] = useState<ReasonAssignment[]>([])
  const [notice, setNotice] = useState<Notice>()
  const [discarding, setDiscarding] = useState(false)
  // Bumped to focus the first error after a refused or invalid submit.
  const [focusRequest, setFocusRequest] = useState(0)
  const container = useRef<HTMLDivElement>(null)
  const changes =
    formChanges + (sameAssignments(assignments, saved.assignments) ? 0 : 1)
  const takenNames = useMemo(
    () => [
      ...MOCK_TAKEN_NAMES.filter((name) => name !== saved.values.name),
      ...refusedNames,
    ],
    [saved.values.name, refusedNames]
  )

  useEffect(() => {
    if (focusRequest === 0 || !container.current) return
    return focusFirstError(container.current)
  }, [focusRequest])

  const requestFocus = () => setFocusRequest((current) => current + 1)

  const start = (reason: MockReason) => {
    setSaved(reason)
    setAssignments(reason.assignments)
    setRevision((current) => current + 1)
    setFormChanges(0)
    setRefusedNames([])
    setSaveError(false)
    setNotSaved([])
    setNotice(undefined)
  }

  const save = (values: ReasonValues) => {
    setSaveError(false)
    setNotSaved([])
    setNotice(undefined)
    if (saveFails) {
      setSaveError(true)
      return
    }
    if (refuseNames && values.name !== saved.values.name) {
      // The server refused the name, so the form now marks it as taken.
      setRefusedNames((names) => [...names, values.name])
      requestFocus()
      return
    }
    const unsaved = unsavedAssignments(assignments, saved.assignments)
    if (placesFail && unsaved.length > 0) {
      // The reason saved, but its new places did not; Save again retries them.
      const failed = new Set(unsaved.map(assignmentKey))
      setSaved({
        values,
        assignments: [
          ...saved.assignments.filter((row) =>
            assignments.some(
              (draft) => assignmentKey(draft) === assignmentKey(row)
            )
          ),
          ...assignments.filter(
            (row) =>
              !failed.has(assignmentKey(row)) &&
              !saved.assignments.some(
                (stored) => assignmentKey(stored) === assignmentKey(row)
              )
          ),
        ],
      })
      // The form starts again from the saved values; the failed places stay as drafts.
      setRevision((current) => current + 1)
      setFormChanges(0)
      setNotSaved(unsaved)
      setAdding(false)
      return
    }
    const wasAdding = adding
    start({ values, assignments })
    setAdding(false)
    setNotice(
      wasAdding
        ? {
            title: "Reason Created",
            description: `${values.name} is ready to use.`,
          }
        : {
            title: "Reason Saved",
            description: `Changes to ${values.name} are saved.`,
          }
    )
  }

  const cancel = () => {
    if (changes > 0) setDiscarding(true)
    else start(saved)
  }

  return (
    <div className="flex w-full flex-1 flex-col" ref={container}>
      <Workspace width="narrow">
        <PageBreadcrumbs
          items={[
            { label: "Home", href: "#" },
            { label: "Administration" },
            { label: "Reasons", href: "#" },
            { label: adding ? "Add Reason" : "Edit Reason" },
          ]}
        />
        <WorkspaceHeader>
          <WorkspaceHeading>
            <WorkspaceIcon>
              <MessageSquareTextIcon />
            </WorkspaceIcon>
            <WorkspaceTitle>
              {adding
                ? "Add Reason"
                : loading
                  ? "Edit Reason"
                  : `Edit ${saved.values.name}`}
            </WorkspaceTitle>
            <WorkspaceDescription>
              {adding
                ? "Say why stock moves, and where the reason is offered."
                : "Change the reason's name, tags and where it is offered."}
            </WorkspaceDescription>
          </WorkspaceHeading>
        </WorkspaceHeader>
        <WorkspaceContent>
          <div className="flex flex-col gap-8" inert={pending}>
            {(notice || saveError || notSaved.length > 0) && (
              <div className="flex flex-col gap-4">
                {notice && (
                  <Callout title={notice.title} tone="success">
                    {notice.description}
                  </Callout>
                )}
                {saveError && (
                  <Alert variant="destructive">
                    <AlertCircleIcon />
                    <AlertTitle>Could Not Save Reason</AlertTitle>
                    <AlertDescription>
                      Something went wrong. Check your connection and try again.
                    </AlertDescription>
                  </Alert>
                )}
                {notSaved.length > 0 && (
                  <Alert variant="destructive">
                    <AlertCircleIcon />
                    <AlertTitle>Some Places Not Saved</AlertTitle>
                    <AlertDescription>
                      The reason is saved, but these places are not:{" "}
                      {notSaved.map(NAMES.pair).join("; ")}. Save again to try
                      them once more.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
            <ReasonGeneralForm
              formId={FORM_ID}
              key={revision}
              lookups={LOOKUPS}
              onChangesChange={setFormChanges}
              onInvalid={requestFocus}
              onSubmit={save}
              reason={loading ? undefined : saved.values}
              saved={!adding}
              takenNames={takenNames}
            />
            <FieldSet>
              <FieldLegend>Where Is This Reason Used?</FieldLegend>
              <FieldDescription>
                Add each program and facility type where this reason can be
                used, and whether to show it in the requisition and stock
                adjustment forms.
              </FieldDescription>
              <ReasonAssignments
                activeFacilityTypes={MOCK_ACTIVE_FACILITY_TYPES}
                facilityTypes={loading ? undefined : MOCK_FACILITY_TYPES}
                onRowsChange={setAssignments}
                programs={loading ? undefined : MOCK_PROGRAMS}
                rows={assignments}
              />
            </FieldSet>
          </div>
        </WorkspaceContent>
      </Workspace>
      <WorkspaceFooter width="narrow">
        <Button
          disabled={pending || loading}
          onClick={cancel}
          size="lg"
          variant="outline"
        >
          Cancel
        </Button>
        <Button
          disabled={pending || loading}
          focusableWhenDisabled={pending}
          form={FORM_ID}
          size="lg"
          type="submit"
        >
          {pending && <Spinner data-icon="inline-start" />}
          {adding ? "Create" : "Save"}
        </Button>
      </WorkspaceFooter>
      <DiscardChangesDialog
        changes={changes}
        onDiscard={() => {
          setDiscarding(false)
          start(saved)
        }}
        onKeepEditing={() => setDiscarding(false)}
        open={discarding}
        subject={adding ? "the new reason" : saved.values.name}
      />
    </div>
  )
}
