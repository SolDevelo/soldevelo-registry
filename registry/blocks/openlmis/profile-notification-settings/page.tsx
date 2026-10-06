"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"

import type { DigestConfiguration, DigestSubscription } from "./digest"
import { ProfileNotificationSettings } from "./profile-notification-settings"

const CONFIGURATIONS: DigestConfiguration[] = [
  { id: "c1", tag: "requisition-actionRequired" },
  { id: "c2", tag: "requisition-statusUpdate" },
  { id: "c3", tag: "order-shipped" },
  { id: "c4", tag: "stockEvent-lowStock" },
]

const SUBSCRIPTIONS: DigestSubscription[] = [
  {
    digestConfiguration: { id: "c1" },
    preferredChannel: "EMAIL",
    useDigest: true,
    cronExpression: "0 0 8 * * 1",
  },
  {
    digestConfiguration: { id: "c2" },
    preferredChannel: "SMS",
    useDigest: false,
  },
  {
    digestConfiguration: { id: "c3" },
    preferredChannel: "EMAIL",
    useDigest: true,
    cronExpression: "0 30 7 * * MON-FRI",
  },
]

type Scenario =
  | "ready"
  | "loading"
  | "saving"
  | "save-failed"
  | "load-failed"
  | "empty"
  | "no-contact"

const SCENARIOS: { value: Scenario; label: string }[] = [
  { value: "ready", label: "Ready" },
  { value: "loading", label: "Loading" },
  { value: "saving", label: "Saving" },
  { value: "save-failed", label: "Save Failed" },
  { value: "load-failed", label: "Load Failed" },
  { value: "empty", label: "Empty" },
  { value: "no-contact", label: "No Contact Details" },
]

export default function Page() {
  const [subscriptions, setSubscriptions] = useState(SUBSCRIPTIONS)
  const [scenario, setScenario] = useState<Scenario>("ready")

  return (
    <div className="flex w-full max-w-4xl flex-col gap-4 p-8">
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
        <Button
          onClick={() =>
            setSubscriptions((rows) => rows.map((row) => ({ ...row })))
          }
          size="sm"
          variant="outline"
        >
          Refresh Preview
        </Button>
      </div>
      <ProfileNotificationSettings
        configurations={
          scenario === "loading"
            ? undefined
            : scenario === "empty"
              ? []
              : CONFIGURATIONS
        }
        error={
          scenario === "save-failed"
            ? "Something went wrong. Check your connection and try again."
            : undefined
        }
        failed={scenario === "load-failed"}
        hasContactDetails={scenario !== "no-contact"}
        onRetry={() => setScenario("ready")}
        onCancel={() => setScenario("ready")}
        onSubmit={setSubscriptions}
        pending={scenario === "saving"}
        subscriptions={subscriptions}
      />
    </div>
  )
}
