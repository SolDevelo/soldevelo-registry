"use client"

import { AlertCircleIcon, BuildingIcon } from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { TabsContent } from "@/components/ui/tabs"
import {
  EMPTY_FACILITY,
  type FacilityValues,
} from "./facility-general-form/facility-form"
import { FacilityGeneralForm } from "./facility-general-form/facility-general-form"
import {
  type FacilityProgram,
  missingStartDate,
} from "./facility-program-dialog/facility-program"
import { FacilityPrograms } from "./facility-programs/facility-programs"
import {
  Workspace,
  WorkspaceContent,
  WorkspaceDescription,
  WorkspaceFooter,
  WorkspaceHeader,
  WorkspaceHeading,
  WorkspaceIcon,
  WorkspaceLayout,
  WorkspaceTitle,
} from "@/registry/blocks/openlmis/workspace/workspace"
import { Callout } from "@/registry/components/openlmis/callout/callout"
import { DiscardChangesDialog } from "@/registry/components/openlmis/discard-changes-dialog/discard-changes-dialog"
import { PageBreadcrumbs } from "@/registry/components/openlmis/page-breadcrumbs/page-breadcrumbs"
import {
  WorkspaceTabs,
  WorkspaceTabsList,
  WorkspaceTabsTrigger,
} from "@/registry/components/openlmis/workspace-tabs/workspace-tabs"

import {
  MOCK_FACILITY,
  MOCK_LOOKUPS,
  MOCK_MANAGED_FACILITY,
  MOCK_PROGRAMS,
  MOCK_TAKEN_CODES,
  type MockFacility,
} from "./mock-facility"

const FORM_ID = "facility-form"

type FacilityTab = "information" | "programs"

type FacilityEditorPageProps = {
  /** Start on a new, empty facility. */
  adding?: boolean
  /** Start on the facility managed by another system. */
  managed?: boolean
  /** Show the skeleton, as while the facility loads. */
  loading?: boolean
  /** Show Save as in progress. */
  pending?: boolean
  /** Mock outcome: every save fails. */
  saveFails?: boolean
  /** Mock outcome: the server refuses any changed code. */
  refuseCodes?: boolean
}

const NEW_FACILITY: MockFacility = {
  values: EMPTY_FACILITY,
  programs: [],
  managedExternally: false,
}

/** Focuses the first invalid field on the open tab, waiting for it to render if needed. */
function focusFirstError(container: HTMLElement) {
  const selector = '[role="tabpanel"]:not([hidden]) [aria-invalid="true"]'
  const focus = () => {
    const field = container.querySelector<HTMLElement>(selector)
    field?.focus()
    return Boolean(field)
  }
  if (focus()) return () => {}
  const observer = new MutationObserver(() => {
    if (focus()) observer.disconnect()
  })
  observer.observe(container, {
    attributes: true,
    attributeFilter: ["aria-invalid", "hidden"],
    childList: true,
    subtree: true,
  })
  return () => observer.disconnect()
}

const programChanges = (
  rows: readonly FacilityProgram[],
  saved: readonly FacilityProgram[]
) => (JSON.stringify(rows) === JSON.stringify(saved) ? 0 : 1)

/** Add or edit a facility on one page: its information, then the programs it supports. */
export function FacilityEditorPage({
  adding: startAdding = false,
  managed = false,
  loading = false,
  pending = false,
  saveFails = false,
  refuseCodes = false,
}: FacilityEditorPageProps) {
  const [adding, setAdding] = useState(startAdding)
  const [saved, setSaved] = useState(
    startAdding ? NEW_FACILITY : managed ? MOCK_MANAGED_FACILITY : MOCK_FACILITY
  )
  // Bumped to start the form again from `saved`, after a save or a discard.
  const [revision, setRevision] = useState(0)
  const [programs, setPrograms] = useState(saved.programs)
  const [tab, setTab] = useState<FacilityTab>("information")
  const [infoChanges, setInfoChanges] = useState(0)
  const [showProgramErrors, setShowProgramErrors] = useState(false)
  const [refusedCodes, setRefusedCodes] = useState<string[]>([])
  const [saveError, setSaveError] = useState(false)
  const [notice, setNotice] = useState<{ title: string; description: string }>()
  const [discarding, setDiscarding] = useState(false)
  // Bumped to focus the first error once the tab holding it is open.
  const [focusRequest, setFocusRequest] = useState(0)
  const container = useRef<HTMLDivElement>(null)

  const locked = saved.managedExternally
  const name = saved.values.name || saved.values.code
  const changes = infoChanges + programChanges(programs, saved.programs)
  const takenCodes = useMemo(
    () => [
      ...MOCK_TAKEN_CODES.filter((code) => code !== saved.values.code),
      ...refusedCodes,
    ],
    [saved.values.code, refusedCodes]
  )

  useEffect(() => {
    if (focusRequest === 0 || !container.current) return
    return focusFirstError(container.current)
  }, [focusRequest])

  const showErrors = (nextTab: FacilityTab) => {
    setTab(nextTab)
    setFocusRequest((current) => current + 1)
  }

  const start = (facility: MockFacility) => {
    setSaved(facility)
    setPrograms(facility.programs)
    setRevision((current) => current + 1)
    setTab("information")
    setInfoChanges(0)
    setShowProgramErrors(false)
    setRefusedCodes([])
    setSaveError(false)
    setNotice(undefined)
  }

  const save = (values: FacilityValues) => {
    setSaveError(false)
    if (programs.some(missingStartDate)) {
      setShowProgramErrors(true)
      showErrors("programs")
      return
    }
    if (saveFails) {
      setSaveError(true)
      return
    }
    if (refuseCodes && values.code !== saved.values.code) {
      // The server refused the code, so the form now marks it as taken.
      setRefusedCodes((codes) => [...codes, values.code])
      showErrors("information")
      return
    }
    const next: MockFacility = {
      ...saved,
      values,
      programs: programs.map((row) => ({ ...row, saved: true })),
    }
    start(next)
    setAdding(false)
    const savedName = values.name || values.code
    setNotice(
      adding
        ? {
            title: "Facility Created",
            description: `${savedName} is ready to use.`,
          }
        : {
            title: "Facility Saved",
            description: `Changes to ${savedName} are saved.`,
          }
    )
  }

  const cancel = () => {
    if (changes > 0) setDiscarding(true)
    else start(saved)
  }

  return (
    <WorkspaceLayout ref={container}>
      <Workspace width="narrow">
        <PageBreadcrumbs
          items={[
            { label: "Home", href: "#" },
            { label: "Administration" },
            { label: "Facilities", href: "#" },
            { label: adding ? "Add Facility" : "Edit Facility" },
          ]}
        />
        <WorkspaceHeader>
          <WorkspaceHeading>
            <WorkspaceIcon>
              <BuildingIcon />
            </WorkspaceIcon>
            <WorkspaceTitle>
              {adding
                ? "Add Facility"
                : loading
                  ? "Edit Facility"
                  : `Edit ${name}`}
            </WorkspaceTitle>
            <WorkspaceDescription>
              {adding
                ? "Set up a facility and the programs it supports."
                : "Change the facility's details and the programs it supports."}
            </WorkspaceDescription>
          </WorkspaceHeading>
        </WorkspaceHeader>
        <WorkspaceContent>
          <div className="flex flex-col gap-4 lg:gap-6" inert={pending}>
            {notice && (
              <Callout title={notice.title} tone="success">
                {notice.description}
              </Callout>
            )}
            {locked && !loading && (
              <Callout title="Managed By Another System" tone="info">
                Its name, code, description, geographic zone and active status
                come from another system, so they cannot be changed here.
              </Callout>
            )}
            {saveError && (
              <Alert variant="destructive">
                <AlertCircleIcon />
                <AlertTitle>Could Not Save Facility</AlertTitle>
                <AlertDescription>
                  Something went wrong. Check your connection and try again.
                </AlertDescription>
              </Alert>
            )}
            <WorkspaceTabs
              onValueChange={(value) => setTab(value as FacilityTab)}
              value={tab}
            >
              <WorkspaceTabsList label="Facility Sections">
                <WorkspaceTabsTrigger value="information">
                  Facility Information
                </WorkspaceTabsTrigger>
                <WorkspaceTabsTrigger value="programs">
                  Associated Programs
                  {!loading && (
                    <Badge variant="secondary">{programs.length}</Badge>
                  )}
                </WorkspaceTabsTrigger>
              </WorkspaceTabsList>
              {/* Kept mounted, so a hidden tab keeps its edits and Save checks both. */}
              <TabsContent keepMounted value="information">
                <FacilityGeneralForm
                  facility={loading ? undefined : saved.values}
                  formId={FORM_ID}
                  goLiveDateRequired={!adding}
                  key={revision}
                  locked={locked}
                  lookups={MOCK_LOOKUPS}
                  onChangesChange={setInfoChanges}
                  onInvalid={() => {
                    // Programs share the submit, so their errors show at once too.
                    setShowProgramErrors(programs.some(missingStartDate))
                    showErrors("information")
                  }}
                  onSubmit={save}
                  takenCodes={takenCodes}
                />
              </TabsContent>
              <TabsContent keepMounted value="programs">
                <FacilityPrograms
                  onRowsChange={setPrograms}
                  programs={MOCK_PROGRAMS}
                  rows={loading ? undefined : programs}
                  showErrors={showProgramErrors}
                />
              </TabsContent>
            </WorkspaceTabs>
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
        subject={adding ? "the new facility" : name}
      />
    </WorkspaceLayout>
  )
}
