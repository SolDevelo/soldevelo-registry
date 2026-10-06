"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"

import { applySaved, type Profile, profileChanges } from "./profile"
import { ProfileBasicInformation } from "./profile-basic-information"

const PROFILE: Profile = {
  user: {
    id: "u1",
    username: "divo1",
    firstName: "Grace",
    lastName: "Banda",
    jobTitle: "Storeroom Manager",
    homeFacility: "HC02 - Comfort Health Clinic",
  },
  contact: {
    email: "grace.banda@example.org",
    emailVerified: true,
    phoneNumber: "+265 999 123 456",
    allowNotify: true,
  },
}

type Scenario = "ready" | "loading" | "saving" | "error"

const SCENARIOS: { value: Scenario; label: string }[] = [
  { value: "ready", label: "Ready" },
  { value: "loading", label: "Loading" },
  { value: "saving", label: "Saving" },
  { value: "error", label: "Save Failed" },
]

export default function Page() {
  const [profile, setProfile] = useState(PROFILE)
  const [revision, setRevision] = useState(0)
  const [pendingEmail, setPendingEmail] = useState<string | null>(null)
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
          onClick={() => setProfile({ ...profile })}
          size="sm"
          variant="outline"
        >
          Refresh Preview
        </Button>
      </div>
      <ProfileBasicInformation
        key={revision}
        error={
          scenario === "error"
            ? "Something went wrong. Check your connection and try again."
            : undefined
        }
        onResendEmail={() => undefined}
        onCancel={() => setScenario("ready")}
        onSubmit={(values, current) => {
          // Stands in for a save: a new address waits for its link before it is used.
          if (profileChanges(current, values).email && values.email.trim())
            setPendingEmail(values.email.trim())
          setProfile(applySaved(current, values))
          setRevision((value) => value + 1)
        }}
        pending={scenario === "saving"}
        pendingEmail={pendingEmail}
        profile={scenario === "loading" ? undefined : profile}
      />
    </div>
  )
}
