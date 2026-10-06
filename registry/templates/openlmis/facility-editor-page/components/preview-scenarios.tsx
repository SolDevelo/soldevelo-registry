"use client"

import { type ComponentProps, useState } from "react"

import { Button } from "@/components/ui/button"

import { FacilityEditorPage } from "./facility-editor-page"

// Catalog-only: switches the mock states; not part of the installed template.
const SCENARIOS: {
  label: string
  props: ComponentProps<typeof FacilityEditorPage>
}[] = [
  { label: "Edit", props: {} },
  { label: "Add", props: { adding: true } },
  { label: "Managed Externally", props: { managed: true } },
  { label: "Code Refused", props: { refuseCodes: true } },
  { label: "Save Failed", props: { saveFails: true } },
  { label: "Saving", props: { pending: true } },
  { label: "Loading", props: { loading: true } },
]

export function FacilityEditorPreviewScenarios() {
  const [active, setActive] = useState(0)
  return (
    <div className="flex w-full flex-1 flex-col">
      <div className="flex flex-wrap items-center gap-2 border-b bg-muted/50 px-4 py-2 lg:px-6">
        <span className="text-sm text-muted-foreground">Preview</span>
        {SCENARIOS.map((item, index) => (
          <Button
            aria-pressed={active === index}
            key={item.label}
            onClick={() => setActive(index)}
            size="sm"
            variant={active === index ? "secondary" : "ghost"}
          >
            {item.label}
          </Button>
        ))}
      </div>
      <FacilityEditorPage key={active} {...SCENARIOS[active].props} />
    </div>
  )
}
