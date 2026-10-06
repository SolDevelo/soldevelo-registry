"use client"

import { useState } from "react"

import { SelectFilter } from "./select-filter"

export default function Page() {
  const [status, setStatus] = useState("active")
  const [facility, setFacility] = useState("bdh")

  return (
    <div className="flex w-full max-w-60 flex-col gap-3 p-8 pb-28">
      <SelectFilter
        label="Status"
        onValueChange={setStatus}
        options={[
          { value: "active", label: "Active" },
          { value: "inactive", label: "Inactive" },
        ]}
        value={status}
      />
      {/* A long label stays whole while the value is cut short. */}
      <SelectFilter
        label="Supplying Facility"
        onValueChange={setFacility}
        options={[
          { value: "bdh", label: "Balaka District Hospital" },
          { value: "lch", label: "Lilongwe Central Hospital" },
        ]}
        value={facility}
      />
    </div>
  )
}
