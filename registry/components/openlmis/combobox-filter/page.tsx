"use client"

import { useState } from "react"

import { type ComboboxFilterOption, ComboboxFilter } from "./combobox-filter"

const DISTRICTS = [
  "Balaka",
  "Blantyre",
  "Chikwawa",
  "Dedza",
  "Dowa",
  "Karonga",
  "Kasungu",
  "Lilongwe",
  "Machinga",
  "Mangochi",
  "Mzimba",
  "Ntcheu",
  "Salima",
  "Zomba",
]

const KINDS = [
  "District Hospital",
  "Health Center",
  "Health Post",
  "Rural Clinic",
  "Dispensary",
]

// 70 facilities, more than the 50 listed at once, so the list asks to be narrowed.
const FACILITIES: ComboboxFilterOption[] = DISTRICTS.flatMap((district) =>
  KINDS.map((kind) => `${district} ${kind}`)
).map((label, index) => ({
  value: `f${index + 1}`,
  label,
  description: `HC${String(index + 1).padStart(2, "0")}`,
}))

export default function Page() {
  const [program, setProgram] = useState("p2")
  const [facility, setFacility] = useState("")

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
        onValueChange={setFacility}
        options={FACILITIES}
        value={facility}
      />
    </div>
  )
}
