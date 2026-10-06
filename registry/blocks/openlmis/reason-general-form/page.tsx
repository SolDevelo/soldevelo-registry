"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"

import { EMPTY_REASON, type ReasonValues } from "./reason-form"
import { ReasonGeneralForm } from "./reason-general-form"

const REASON: ReasonValues = {
  name: "Transfer In",
  category: "TRANSFER",
  type: "CREDIT",
  isFreeTextAllowed: true,
  tags: ["receipts"],
}

const TAGS = ["receipts", "consumed", "damaged", "expired"]
const TAKEN = ["Transfer Out", "Damage"]

type Scenario = "edit" | "add" | "read-only" | "loading"

const SCENARIOS: { value: Scenario; label: string }[] = [
  { value: "edit", label: "Edit" },
  { value: "add", label: "Add" },
  { value: "read-only", label: "Read Only" },
  { value: "loading", label: "Loading" },
]

export default function Page() {
  const [scenario, setScenario] = useState<Scenario>("edit")
  const [reason, setReason] = useState(REASON)
  const adding = scenario === "add"

  return (
    <div className="@container/main flex w-full max-w-4xl flex-col gap-6 p-8">
      <div className="flex flex-wrap gap-2">
        {SCENARIOS.map((item) => (
          <Button
            key={item.value}
            onClick={() => setScenario(item.value)}
            size="sm"
            variant={scenario === item.value ? "default" : "outline"}
          >
            {item.label}
          </Button>
        ))}
      </div>
      <ReasonGeneralForm
        formId="reason-general-form"
        key={scenario}
        lookups={{ tags: TAGS }}
        onSubmit={setReason}
        readOnly={scenario === "read-only"}
        reason={
          scenario === "loading" ? undefined : adding ? EMPTY_REASON : reason
        }
        saved={!adding}
        takenNames={TAKEN}
      />
      {scenario !== "read-only" && (
        <div className="flex justify-end">
          <Button form="reason-general-form" type="submit">
            {adding ? "Create" : "Save"}
          </Button>
        </div>
      )}
    </div>
  )
}
