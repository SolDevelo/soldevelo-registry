"use client"

import { revalidateLogic } from "@tanstack/react-form"
import { type ReactNode, useEffect, useState } from "react"
import { z } from "zod"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FieldGroup, FieldSeparator } from "@/components/ui/field"
import {
  SettingsItem,
  SettingsList,
} from "@/registry/blocks/openlmis/settings-list/settings-list"

import { useAppForm } from "./form"

const FACILITIES = [
  { value: "balaka", label: "Balaka District Hospital", description: "HC01" },
  { value: "comfort", label: "Comfort Health Clinic", description: "HC02" },
  { value: "kankao", label: "Kankao Health Facility", description: "HC03" },
  { value: "nandumbo", label: "Nandumbo Health Center", description: "HC04" },
]

const PROGRAMS = [
  { value: "family-planning", label: "Family Planning" },
  { value: "essential-meds", label: "Essential Meds" },
  { value: "new-program", label: "New Program" },
  { value: "arv", label: "ARV" },
]

const TAG_SUGGESTIONS = ["Cold Chain", "Controlled", "Essential", "Vaccine"]

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "fr", label: "French" },
  { value: "es", label: "Spanish" },
  { value: "pt", label: "Portuguese", disabled: true },
]

const LOGO = "/projects/openlmis.png"

const schema = z.object({
  username: z.string().trim().min(1, "Enter a username."),
  password: z.string().min(8, "Use at least 8 characters."),
  confirm: z.string(),
  packSize: z.string().regex(/^\d+$/, "Enter a whole number."),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/, "Enter an amount like 12.50."),
  notes: z.string().max(200, "Keep notes under 200 characters."),
  homeFacilityId: z.string().nullable(),
  programs: z.array(z.string()).min(1, "Pick at least one program."),
  tags: z.array(z.string()),
  language: z.string(),
  startDate: z.string().min(1, "Pick a start date."),
  method: z.enum(["email", "manual"]),
  theme: z.enum(["light", "dark", "system"]),
  active: z.boolean(),
  allowNotify: z.boolean(),
  logo: z
    .instanceof(File)
    .refine((file) => file.size < 1_000_000, "Use an image under 1 MB.")
    .nullable(),
})

export default function Page() {
  const [saved, setSaved] = useState<string>()
  const [passwordsVisible, setPasswordsVisible] = useState(false)
  const form = useAppForm({
    defaultValues: {
      username: "",
      password: "",
      confirm: "",
      packSize: "10",
      price: "",
      notes: "",
      homeFacilityId: "comfort" as string | null,
      programs: ["family-planning"] as string[],
      tags: ["Essential"] as string[],
      language: "en",
      startDate: "",
      method: "email" as "email" | "manual",
      theme: "system" as "light" | "dark" | "system",
      active: true,
      allowNotify: false,
      logo: null as File | null,
    },
    validationLogic: revalidateLogic({
      mode: "submit",
      modeAfterSubmission: "change",
    }),
    validators: { onDynamic: schema },
    onSubmit: ({ value }) => setSaved(value.username),
  })

  return (
    <form
      className="flex w-full max-w-2xl flex-col gap-6 p-8"
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        void form.handleSubmit()
      }}
    >
      <FieldGroup>
        <form.AppField name="username">
          {(field) => (
            <field.TextField
              autoComplete="username"
              dir="ltr"
              label="Username"
              required
            />
          )}
        </form.AppField>
        <form.AppField name="password">
          {(field) => (
            <field.PasswordField
              action={
                <Button
                  onClick={() => {
                    form.setFieldValue("password", "")
                    form.setFieldValue("confirm", "")
                  }}
                  size="xs"
                  type="button"
                  variant="link"
                >
                  Reset
                </Button>
              }
              description="At least 8 characters."
              hideLabel="Hide Passwords"
              label="Password"
              onVisibleChange={setPasswordsVisible}
              required
              showLabel="Show Passwords"
              visible={passwordsVisible}
            />
          )}
        </form.AppField>
        <form.AppField name="confirm">
          {(field) => (
            <field.PasswordField
              hideLabel="Hide Passwords"
              label="Confirm Password"
              onVisibleChange={setPasswordsVisible}
              showLabel="Show Passwords"
              visible={passwordsVisible}
            />
          )}
        </form.AppField>
        <div className="grid gap-4 sm:grid-cols-2">
          <form.AppField name="packSize">
            {(field) => <field.NumberField label="Pack Size" required />}
          </form.AppField>
          <form.AppField name="price">
            {(field) => (
              <field.DecimalField description="In USD." label="Unit Price" />
            )}
          </form.AppField>
        </div>
        <form.AppField name="notes">
          {(field) => (
            <field.TextareaField
              dir="auto"
              label="Notes"
              placeholder="Anything the approver should know"
            />
          )}
        </form.AppField>
        <form.AppField name="homeFacilityId">
          {(field) => (
            <field.ComboboxField
              clearLabel="Clear Home Facility"
              emptyMessage="No facilities match."
              items={FACILITIES}
              label="Home Facility"
              placeholder="Search Facilities..."
            />
          )}
        </form.AppField>
        <form.AppField name="programs">
          {(field) => (
            <field.MultiComboboxField
              emptyMessage="No programs match."
              items={PROGRAMS}
              label="Programs"
              placeholder="Add Programs..."
              removeLabel={(label) => `Remove ${label}`}
              required
            />
          )}
        </form.AppField>
        <form.AppField name="tags">
          {(field) => (
            <field.TagsField
              description="Press Enter or a comma to add a tag."
              label="Tags"
              maxLength={20}
              minLength={2}
              placeholder="Add Tags..."
              refusedMessage={(reason) =>
                reason === "duplicate"
                  ? "That tag is added already."
                  : reason === "too-short"
                    ? "Use at least 2 characters."
                    : "Use at most 20 characters."
              }
              removeLabel={(tag) => `Remove ${tag}`}
              suggestions={TAG_SUGGESTIONS}
            />
          )}
        </form.AppField>
        <form.AppField name="startDate">
          {(field) => (
            <field.DateField
              clearLabel="Clear Start Date"
              earliest="2026-01-01"
              label="Start Date"
              placeholder="Pick a Date"
              required
            />
          )}
        </form.AppField>
        <form.AppField name="method">
          {(field) => (
            <field.RadioGroupField
              columns="row"
              label="Method"
              options={[
                {
                  value: "email",
                  label: "Send Reset Email",
                  description: "Email a link where the user picks a password.",
                },
                {
                  value: "manual",
                  label: "Set Password Manually",
                  description: "Type a password to share with the user.",
                },
              ]}
            />
          )}
        </form.AppField>
        <form.AppField name="theme">
          {(field) => (
            <field.RadioGroupField
              label="Theme"
              options={[
                {
                  value: "light",
                  label: "Light",
                  media: (
                    <div className="h-8 w-full rounded-md border bg-background" />
                  ),
                },
                {
                  value: "dark",
                  label: "Dark",
                  media: (
                    <div className="h-8 w-full rounded-md border bg-foreground" />
                  ),
                },
                {
                  value: "system",
                  label: "System",
                  media: (
                    <div className="h-8 w-full rounded-md border bg-muted" />
                  ),
                },
              ]}
              variant="tile"
            />
          )}
        </form.AppField>
        <form.AppField name="active">
          {(field) => (
            <field.SwitchField
              description="Inactive users cannot sign in."
              label="Active"
            />
          )}
        </form.AppField>
      </FieldGroup>

      <FieldSeparator />

      <SettingsList>
        <SettingsItem label="Role">Storeroom Manager</SettingsItem>
        <form.AppField name="language">
          {(field) => (
            <field.SelectField
              items={LANGUAGES}
              label="Language"
              layout="row"
            />
          )}
        </form.AppField>
        <form.AppField name="allowNotify">
          {(field) => (
            <field.SwitchField
              description="Email when a requisition needs approval."
              label="Notifications"
              layout="row"
            />
          )}
        </form.AppField>
        <form.AppField name="username">
          {(field) => (
            <field.TextField
              badge={<Badge variant="secondary">Shown to Others</Badge>}
              label="Display Name"
              layout="row"
            />
          )}
        </form.AppField>
        <form.AppField name="logo">
          {(field) => (
            <LogoPreview file={field.state.value}>
              {(previewUrl) => (
                <field.ImageField
                  accept="image/*"
                  canRemove={field.state.value !== null}
                  chooseLabel="Choose Logo"
                  description="Shown in the header. PNG or SVG, under 1 MB."
                  label="Logo"
                  previewAlt="Current logo"
                  previewUrl={previewUrl}
                  removeLabel="Remove Logo"
                />
              )}
            </LogoPreview>
          )}
        </form.AppField>
      </SettingsList>

      <div className="flex items-center gap-3 rounded-lg border p-3">
        <span className="text-sm text-muted-foreground">
          Inline, as in a cell:
        </span>
        <div className="w-24">
          <form.AppField name="packSize">
            {(field) => <field.NumberField label="Pack Size" layout="inline" />}
          </form.AppField>
        </div>
        <form.AppField name="active">
          {(field) => <field.SwitchField label="Active" layout="inline" />}
        </form.AppField>
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit">Save</Button>
        {saved !== undefined && (
          <p className="text-sm text-muted-foreground">
            Saved {saved || "the form"}.
          </p>
        )}
      </div>
    </form>
  )
}

/** Previews a picked file from an object URL, revoked when the file changes; the saved logo otherwise. */
function LogoPreview({
  file,
  children,
}: {
  file: File | null
  children: (previewUrl: string) => ReactNode
}) {
  const [previewUrl, setPreviewUrl] = useState(LOGO)

  useEffect(() => {
    if (!file) {
      // oxlint-disable-next-line react/set-state-in-effect -- the URL is an external resource that must be created and revoked together
      setPreviewUrl(LOGO)
      return
    }
    const url = URL.createObjectURL(file)
    // oxlint-disable-next-line react/set-state-in-effect -- as above
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  return children(previewUrl)
}
