"use client"

import { useState } from "react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { FormActions } from "./form-actions"

export default function Page() {
  const [saved, setSaved] = useState("Grace Banda")
  const [name, setName] = useState(saved)

  return (
    <div className="flex w-full max-w-md flex-col gap-4 p-8">
      <form
        className="flex flex-col gap-2"
        id="profile-name"
        onSubmit={(event) => {
          event.preventDefault()
          setSaved(name)
        }}
      >
        <Label htmlFor="display-name">Display Name</Label>
        <Input
          id="display-name"
          onChange={(event) => setName(event.target.value)}
          value={name}
        />
      </form>
      <div className="flex justify-between gap-2">
        <FormActions
          actions={{
            formId: "profile-name",
            changed: name !== saved,
            pending: false,
            cancel: () => setName(saved),
          }}
          saveLabel="Save Profile"
        />
      </div>
    </div>
  )
}
