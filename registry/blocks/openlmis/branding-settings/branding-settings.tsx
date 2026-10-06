"use client"

import { revalidateLogic, useStore } from "@tanstack/react-form"
import { type ReactNode, useEffect, useState } from "react"

import { useAppForm } from "@/registry/components/openlmis/form-fields/form"
import { SettingsList } from "@/registry/components/openlmis/settings-list/settings-list"

import { BrandingPreview } from "./branding-preview"
import {
  type Branding,
  type BrandingValues,
  brandingSchema,
  LOGO_TYPES,
  logoSchema,
  MAX_APP_NAME_LENGTH,
  toBrandingValues,
} from "./branding"

type BrandingFormOptions = {
  saved: Branding
  /** The page's Save button submits this form by id, and an invalid submit focuses its first error. */
  formId: string
  onSave: (values: BrandingValues) => void
}

/** The branding form, held by the page so its footer can save, cancel and see unsaved changes. */
export function useBrandingForm({
  saved,
  formId,
  onSave,
}: BrandingFormOptions) {
  return useAppForm({
    defaultValues: toBrandingValues(saved),
    validationLogic: revalidateLogic({
      mode: "submit",
      modeAfterSubmission: "change",
    }),
    validators: { onDynamic: brandingSchema(saved) },
    onSubmit: ({ value }) => onSave(value),
    onSubmitInvalid: () =>
      document
        .querySelector<HTMLElement>(`#${formId} [aria-invalid="true"]`)
        ?.focus(),
  })
}

export type BrandingForm = ReturnType<typeof useBrandingForm>

/** A URL for a picked file, revoked once the file is no longer shown. */
function useObjectUrl(file: File | null) {
  const [created, setCreated] = useState<{ file: File; url: string }>()
  useEffect(() => {
    if (!file) return
    const url = URL.createObjectURL(file)
    // oxlint-disable-next-line react/set-state-in-effect -- an object URL is a browser resource, created and revoked with the file
    setCreated({ file, url })
    return () => URL.revokeObjectURL(url)
  }, [file])
  return created && created.file === file ? created.url : null
}

function useLogoUrl(
  logo: File | null | undefined,
  saved: Branding["logo"],
  defaultLogoUrl: string
) {
  // A file that fails validation keeps the saved logo on show.
  const rejected = logo instanceof File && !logoSchema.safeParse(logo).success
  const shown = logo === undefined || rejected ? saved : logo
  const file = shown instanceof File ? shown : null
  const objectUrl = useObjectUrl(file)
  if (file) return objectUrl ?? defaultLogoUrl
  return typeof shown === "string" ? shown : defaultLogoUrl
}

type BrandingSettingsProps = {
  form: BrandingForm
  saved: Branding
  formId: string
  /** The app's own name and logo, shown while nothing is set here. */
  defaultAppName: string
  defaultLogoUrl: string
  /** Locks every field while the parent saves. */
  pending?: boolean
  /** Above the fields, such as a failed save. */
  feedback?: ReactNode
}

/** App name, logo and whether the name shows beside it, with a live preview of where they appear. */
export function BrandingSettings({
  form,
  saved,
  formId,
  defaultAppName,
  defaultLogoUrl,
  pending = false,
  feedback,
}: BrandingSettingsProps) {
  const values = useStore(form.store, (state) => state.values)
  const logoUrl = useLogoUrl(values.logo, saved.logo, defaultLogoUrl)

  return (
    <div className="flex flex-col gap-6">
      {feedback}
      <form
        id={formId}
        noValidate
        onSubmit={(event) => {
          event.preventDefault()
          void form.handleSubmit()
        }}
      >
        <SettingsList>
          <form.AppField name="appName">
            {(field) => (
              <field.TextField
                description={`Up to ${MAX_APP_NAME_LENGTH} characters.`}
                disabled={pending}
                label="App Name"
                layout="row"
                maxLength={MAX_APP_NAME_LENGTH}
                placeholder={defaultAppName}
              />
            )}
          </form.AppField>
          <form.AppField name="logo" validators={{ onChange: logoSchema }}>
            {(field) => (
              <field.ImageField
                accept={LOGO_TYPES.join(",")}
                canRemove={
                  field.state.value instanceof File ||
                  (field.state.value === undefined && saved.logo !== null)
                }
                chooseLabel="Upload Logo"
                description="PNG, JPEG or WebP, up to 512 KB."
                disabled={pending}
                label="Logo"
                previewAlt="Logo"
                previewUrl={logoUrl}
                removeLabel="Remove Logo"
              />
            )}
          </form.AppField>
          <form.AppField name="showAppName">
            {(field) => (
              <field.SwitchField
                description="Turn off when the logo already shows the name."
                disabled={pending}
                label="Show Name Beside Logo"
                layout="row"
              />
            )}
          </form.AppField>
        </SettingsList>
      </form>
      <BrandingPreview
        appName={values.appName}
        defaultAppName={defaultAppName}
        logoUrl={logoUrl}
        showAppName={values.showAppName}
      />
    </div>
  )
}
