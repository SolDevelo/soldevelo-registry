"use client"

import { useState } from "react"

import { SelectFilter } from "./select-filter"

export default function Page() {
  const [status, setStatus] = useState("active")

  return (
    <div className="w-full max-w-60 p-8">
      <SelectFilter
        label="Status"
        onValueChange={setStatus}
        options={[
          { value: "active", label: "Active" },
          { value: "inactive", label: "Inactive" },
        ]}
        value={status}
      />
    </div>
  )
}
