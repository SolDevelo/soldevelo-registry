"use client"

import { useState } from "react"

import { type ComboboxFilterOption, ComboboxFilter } from "./combobox-filter"

const FACILITIES: ComboboxFilterOption[] = [
  "Comfort Health Clinic",
  "Nandumbo Health Center",
  "Balaka District Hospital",
  "Kankao Health Facility",
  "Lilongwe Central Hospital",
  "Mzuzu Health Center",
  "Zomba District Hospital",
  "Machinga Health Post",
].map((name, index) => ({
  value: `f${index + 1}`,
  label: name,
  description: `HC${String(index + 1).padStart(2, "0")}`,
}))

// Stands in for a search that returns only the first few matches.
const SHOWN = 3

export default function Page() {
  const [program, setProgram] = useState("p2")
  const [facility, setFacility] = useState("")
  const [text, setText] = useState("")
  const matches = FACILITIES.filter((option) =>
    option.label.toLowerCase().includes(text.trim().toLowerCase())
  )
  const hidden = matches.length - SHOWN
  const shown = matches.slice(0, SHOWN)
  // The picked option stays listed, so the input can still show its label.
  const picked = FACILITIES.find((option) => option.value === facility)
  if (picked && !shown.includes(picked)) shown.push(picked)

  return (
    <div className="grid w-full max-w-xl gap-3 p-8 pb-72 sm:grid-cols-2">
      <ComboboxFilter
        label="Program"
        onValueChange={setProgram}
        options={[
          { value: "p1", label: "Essential Meds" },
          { value: "p2", label: "Family Planning" },
          { value: "p3", label: "ARV" },
        ]}
        value={program}
      />
      <ComboboxFilter
        emptyMessage="No Facilities Match"
        label="Facility"
        onSearch={setText}
        onValueChange={setFacility}
        options={shown}
        status={
          hidden > 0 ? `${hidden} more, type to narrow the list` : undefined
        }
        value={facility}
      />
    </div>
  )
}
