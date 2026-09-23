"use client"

import { revalidateLogic } from "@tanstack/react-form"
import { useState } from "react"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { FieldGroup } from "@/components/ui/field"

import { useAppForm } from "./form"

const FACILITIES = [
  { value: "balaka", label: "HC01 - Balaka District Hospital" },
  { value: "comfort", label: "HC02 - Comfort Health Clinic" },
  { value: "kankao", label: "HC03 - Kankao Health Facility" },
  { value: "nandumbo", label: "HC04 - Nandumbo Health Center" },
]

const schema = z.object({
  username: z.string().trim().min(1, "Enter a username."),
  password: z.string().min(8, "Use at least 8 characters."),
  homeFacilityId: z.string().nullable(),
  method: z.enum(["email", "manual"]),
  active: z.boolean(),
})

export default function Page() {
  const [saved, setSaved] = useState<string>()
  const form = useAppForm({
    defaultValues: {
      username: "",
      password: "",
      homeFacilityId: null as string | null,
      method: "email",
      active: true,
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
      className="flex w-full max-w-md flex-col gap-6 p-8"
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        void form.handleSubmit()
      }}
    >
      <FieldGroup>
        <form.AppField name="username">
          {(field) => <field.TextField label="Username" required />}
        </form.AppField>
        <form.AppField name="password">
          {(field) => (
            <field.PasswordField
              description="At least 8 characters."
              label="Password"
              required
            />
          )}
        </form.AppField>
        <form.AppField name="homeFacilityId">
          {(field) => (
            <field.ComboboxField
              items={FACILITIES}
              label="Home Facility"
              placeholder="Search Facilities..."
            />
          )}
        </form.AppField>
        <form.AppField name="method">
          {(field) => (
            <field.RadioGroupField
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
        <form.AppField name="active">
          {(field) => (
            <field.SwitchField
              description="Inactive users cannot sign in."
              label="Active"
            />
          )}
        </form.AppField>
      </FieldGroup>
      <div className="flex items-center gap-3">
        <Button type="submit">Save</Button>
        {saved && (
          <p className="text-sm text-muted-foreground">Saved {saved}.</p>
        )}
      </div>
    </form>
  )
}
