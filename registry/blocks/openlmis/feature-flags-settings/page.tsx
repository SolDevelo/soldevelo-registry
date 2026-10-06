"use client"

import { useState } from "react"
import { AlertCircleIcon } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

import type { FeatureFlagDefinition, StoredFlags } from "./feature-flags"
import {
  FeatureFlagsSettings,
  useFeatureFlagsForm,
} from "./feature-flags-settings"

const UNITS = [
  { value: "PACKS", label: "Packs" },
  { value: "DOSES", label: "Doses" },
]

const FLAGS: FeatureFlagDefinition[] = [
  {
    key: "BATCH_APPROVE_SCREEN",
    type: "boolean",
    label: "Batch Approval",
    description: "Approve several requisitions of the same program at once.",
    usedBy: "Requisitions > Approve",
    inherited: { value: false, source: "default" },
  },
  {
    key: "DEFAULT_QUANTITY_UNIT",
    type: "enum",
    options: UNITS,
    label: "Default Quantity Unit",
    description: "The unit quantities start in, until a user picks another.",
    usedBy: "Stock Management, Requisitions",
    inherited: { value: "DOSES", source: "default" },
  },
  {
    key: "GS1_SCANNING",
    type: "boolean",
    label: "GS1 Barcode Scanning",
    description: "Add products by scanning their GS1 barcode.",
    usedBy:
      "Stock Management > Physical Inventory, Adjustments, Issue, Receive",
    inherited: { value: true, source: "deployment" },
  },
]

const SAVED: StoredFlags = { BATCH_APPROVE_SCREEN: true }

type Mode = "ready" | "saving" | "error"

export default function Page() {
  const [saved, setSaved] = useState(SAVED)
  const [search, setSearch] = useState("")
  const [mode, setMode] = useState<Mode>("ready")
  const form = useFeatureFlagsForm({ flags: FLAGS, saved, onSave: setSaved })

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
        <Button form="feature-flags-preview" size="sm" type="submit">
          Save
        </Button>
      </div>
      <FeatureFlagsSettings
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
        flags={FLAGS}
        form={form}
        formId="feature-flags-preview"
        onSearchChange={setSearch}
        pending={mode === "saving"}
        search={search}
      />
    </div>
  )
}
