"use client"

import { AlertCircleIcon } from "lucide-react"
import { useState } from "react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

import { applyBranding, type Branding } from "./branding"
import { BrandingSettings, useBrandingForm } from "./branding-settings"

const LOGO = "/projects/openlmis.png"

const SAVED: Branding = { appName: "SIGECA", showAppName: true, logo: null }

type Mode = "ready" | "saving" | "error"

export default function Page() {
  const [saved, setSaved] = useState(SAVED)
  const [mode, setMode] = useState<Mode>("ready")
  const form = useBrandingForm({
    saved,
    formId: "branding-preview",
    onSave: (values) => setSaved(applyBranding(saved, values)),
  })

  return (
    <div className="@container/main flex w-full flex-col gap-4 p-6">
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => setMode("ready")} size="sm" variant="outline">
          Ready
        </Button>
        <Button onClick={() => setMode("saving")} size="sm" variant="outline">
          Saving
        </Button>
        <Button onClick={() => setMode("error")} size="sm" variant="outline">
          Save Error
        </Button>
        <Button form="branding-preview" size="sm" type="submit">
          Save
        </Button>
      </div>
      <BrandingSettings
        defaultAppName="OpenLMIS"
        defaultLogoUrl={LOGO}
        feedback={
          mode === "error" && (
            <Alert variant="destructive">
              <AlertCircleIcon />
              <AlertTitle>Settings Not Saved</AlertTitle>
              <AlertDescription>
                The settings could not be saved. Try again.
              </AlertDescription>
            </Alert>
          )
        }
        form={form}
        formId="branding-preview"
        pending={mode === "saving"}
        saved={saved}
      />
    </div>
  )
}
