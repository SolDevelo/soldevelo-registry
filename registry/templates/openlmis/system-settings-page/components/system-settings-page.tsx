"use client"

import { useStore } from "@tanstack/react-form"
import { SlidersHorizontalIcon } from "lucide-react"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  applyBranding,
  DEFAULT_BRANDING,
  isBrandingDefault,
  toBrandingValues,
} from "./branding-settings/branding"
import {
  BrandingSettings,
  useBrandingForm,
} from "./branding-settings/branding-settings"
import { toFlagDraft } from "./feature-flags-settings/feature-flags"
import {
  FeatureFlagsSettings,
  useFeatureFlagsForm,
} from "./feature-flags-settings/feature-flags-settings"
import {
  Workspace,
  WorkspaceActions,
  WorkspaceContent,
  WorkspaceDescription,
  WorkspaceFooter,
  WorkspaceHeader,
  WorkspaceHeading,
  WorkspaceIcon,
  WorkspaceTitle,
} from "@/registry/blocks/openlmis/workspace/workspace"
import { DiscardChangesDialog } from "@/registry/components/openlmis/discard-changes-dialog/discard-changes-dialog"
import {
  WorkspaceTabs,
  WorkspaceTabsContent,
  WorkspaceTabsList,
  WorkspaceTabsTrigger,
} from "@/registry/components/openlmis/workspace-tabs/workspace-tabs"

import {
  DEFAULT_APP_NAME,
  DEFAULT_LOGO_URL,
  MOCK_FLAGS,
  MOCK_SETTINGS,
  MOCK_RELOADED_SETTINGS,
} from "./mock-settings"
import { SaveFeedback, type SaveOutcome } from "./save-feedback"
import { SettingsReset } from "./settings-reset"

type Section = "branding" | "feature-flags"

const FORM_IDS = {
  branding: "branding-form",
  "feature-flags": "feature-flags-form",
} as const satisfies Record<Section, string>

type SystemSettingsPageProps = {
  /** How the mock save answers, to show a failed save or one that lost to someone else's. */
  saveResult?: "saved" | "error" | "conflict" | "partial"
  /** Locks the forms as if a save were running. */
  pending?: boolean
}

/** Branding and feature flags for the whole deployment; mount it from any route. */
export function SystemSettingsPage({
  saveResult = "saved",
  pending = false,
}: SystemSettingsPageProps) {
  const [saved, setSaved] = useState(MOCK_SETTINGS)
  const [section, setSection] = useState<Section>("branding")
  const [leavingTo, setLeavingTo] = useState<Section>()
  const [search, setSearch] = useState("")
  const [outcomes, setOutcomes] = useState<
    Partial<Record<Section, SaveOutcome>>
  >({})
  const [reloadFocus, setReloadFocus] = useState<{ section: Section }>()
  const outcome = outcomes[section]
  const conflict = outcome?.kind === "conflict"
  const blocked = pending || conflict
  const setOutcome = (next: SaveOutcome | undefined) =>
    setOutcomes((current) => ({ ...current, [section]: next }))

  useEffect(() => {
    if (!reloadFocus) return
    const controls = document
      .getElementById(FORM_IDS[reloadFocus.section])
      ?.querySelectorAll<HTMLElement>(
        "input, button, select, textarea, [tabindex]"
      )
    Array.from(controls ?? [])
      .find(
        (control) =>
          control.tabIndex >= 0 &&
          !control.hasAttribute("disabled") &&
          control.getAttribute("aria-hidden") !== "true" &&
          !(control instanceof HTMLInputElement && control.type === "hidden")
      )
      ?.focus()
  }, [reloadFocus])

  const save = (
    next: typeof saved,
    title: string,
    description: string,
    reset: () => void
  ) => {
    if (blocked) return
    if (saveResult !== "saved")
      return setOutcome({
        kind: saveResult === "partial" ? "error" : saveResult,
      })
    setSaved(next)
    reset()
    setOutcome({ kind: "saved", title, description })
  }

  const brandingForm = useBrandingForm({
    saved: saved.branding,
    formId: FORM_IDS.branding,
    onSave: (values) => {
      if (blocked) return
      if (saveResult === "partial" && values.logo !== undefined) {
        setSaved({
          ...saved,
          branding: { ...saved.branding, logo: values.logo },
        })
        brandingForm.resetField("logo")
        setOutcome({
          kind: "error",
          message:
            "The logo was saved, but the name and display settings could not be saved. Try again.",
        })
        return
      }
      const branding = applyBranding(saved.branding, values)
      save(
        { ...saved, branding },
        "Branding Saved",
        "Everyone sees the new branding the next time they open the app.",
        () => brandingForm.reset(toBrandingValues(branding))
      )
    },
  })
  const flagsForm = useFeatureFlagsForm({
    flags: MOCK_FLAGS,
    saved: saved.featureFlags,
    onSave: (featureFlags) =>
      save(
        { ...saved, featureFlags },
        "Feature Flags Saved",
        "Everyone gets the new flags the next time they open the app.",
        () => flagsForm.reset(toFlagDraft(MOCK_FLAGS, featureFlags))
      ),
  })

  const brandingValues = useStore(brandingForm.store, (state) => state.values)
  const flagValues = useStore(flagsForm.store, (state) => state.values)
  const savedFlags = toFlagDraft(MOCK_FLAGS, saved.featureFlags)
  const nextBranding = applyBranding(saved.branding, brandingValues)
  const changes =
    section === "branding"
      ? (["appName", "showAppName", "logo"] as const).filter(
          (key) => nextBranding[key] !== saved.branding[key]
        ).length
      : MOCK_FLAGS.filter(
          ({ key }) =>
            flagValues[key]?.value !== savedFlags[key]?.value ||
            flagValues[key]?.overridden !== savedFlags[key]?.overridden
        ).length
  const changed = changes > 0

  const cancel = () => {
    if (section === "branding")
      brandingForm.reset(toBrandingValues(saved.branding))
    else flagsForm.reset(toFlagDraft(MOCK_FLAGS, saved.featureFlags))
    if (!conflict) setOutcome(undefined)
  }

  const openSection = (next: Section) => {
    setSection(next)
  }

  const reload = () => {
    const fresh = MOCK_RELOADED_SETTINGS
    setSaved(fresh)
    brandingForm.reset(toBrandingValues(fresh.branding))
    flagsForm.reset(toFlagDraft(MOCK_FLAGS, fresh.featureFlags))
    setOutcomes({})
    setReloadFocus({ section })
  }

  const feedback = (
    <SaveFeedback
      onDismiss={() => setOutcome(undefined)}
      onReload={reload}
      outcome={outcome}
    />
  )

  return (
    <div className="flex w-full flex-1 flex-col">
      <Workspace width="narrow">
        <WorkspaceHeader>
          <WorkspaceHeading>
            <WorkspaceIcon>
              <SlidersHorizontalIcon />
            </WorkspaceIcon>
            <WorkspaceTitle>Settings</WorkspaceTitle>
            <WorkspaceDescription>
              Settings that apply to everyone using this deployment.
            </WorkspaceDescription>
          </WorkspaceHeading>
          {section === "branding" && (
            <WorkspaceActions>
              <SettingsReset
                confirmLabel="Reset"
                description="The OpenLMIS logo and name come back for everyone."
                disabled={blocked || isBrandingDefault(saved.branding)}
                label="Reset To Defaults"
                onConfirm={() =>
                  save(
                    { ...saved, branding: DEFAULT_BRANDING },
                    "Branding Reset",
                    "The OpenLMIS logo and name are back for everyone.",
                    () => brandingForm.reset(toBrandingValues(DEFAULT_BRANDING))
                  )
                }
                pending={pending}
                title="Reset Branding?"
              />
            </WorkspaceActions>
          )}
        </WorkspaceHeader>
        <WorkspaceContent>
          <WorkspaceTabs
            onValueChange={(next) => {
              if (next === section) return
              if (changed) setLeavingTo(next as Section)
              else openSection(next as Section)
            }}
            value={section}
          >
            <WorkspaceTabsList label="Settings Sections">
              <WorkspaceTabsTrigger value="branding">
                Branding
              </WorkspaceTabsTrigger>
              <WorkspaceTabsTrigger value="feature-flags">
                Feature Flags
              </WorkspaceTabsTrigger>
            </WorkspaceTabsList>
            <WorkspaceTabsContent value="branding">
              <BrandingSettings
                defaultAppName={DEFAULT_APP_NAME}
                defaultLogoUrl={DEFAULT_LOGO_URL}
                feedback={feedback}
                form={brandingForm}
                formId={FORM_IDS.branding}
                pending={blocked}
                saved={saved.branding}
              />
            </WorkspaceTabsContent>
            <WorkspaceTabsContent value="feature-flags">
              <FeatureFlagsSettings
                feedback={feedback}
                flags={MOCK_FLAGS}
                form={flagsForm}
                formId={FORM_IDS["feature-flags"]}
                onSearchChange={setSearch}
                pending={blocked}
                search={search}
              />
            </WorkspaceTabsContent>
          </WorkspaceTabs>
        </WorkspaceContent>
      </Workspace>
      <WorkspaceFooter width="narrow">
        <Button
          disabled={pending || !changed}
          onClick={cancel}
          size="lg"
          variant="outline"
        >
          Cancel
        </Button>
        <Button
          disabled={blocked || !changed}
          form={FORM_IDS[section]}
          size="lg"
          type="submit"
        >
          Save
        </Button>
      </WorkspaceFooter>
      <DiscardChangesDialog
        changes={changes}
        onDiscard={() => {
          cancel()
          if (leavingTo) openSection(leavingTo)
          setLeavingTo(undefined)
        }}
        onKeepEditing={() => setLeavingTo(undefined)}
        open={leavingTo !== undefined}
      />
    </div>
  )
}
