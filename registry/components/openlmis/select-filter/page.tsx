"use client"

import { useState } from "react"

import { SelectFilter } from "./select-filter"

export default function Page() {
  const [status, setStatus] = useState("active")
  const [facility, setFacility] = useState("bdh")

  return (
    <div className="flex w-full max-w-md flex-col gap-3 px-4 pt-8 pb-28 sm:px-8">
      <div className="w-44 max-w-full">
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
      {/* Long labels stay visible and selected values truncate when space is limited. */}
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
