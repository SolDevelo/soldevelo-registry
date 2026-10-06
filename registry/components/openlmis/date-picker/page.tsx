"use client"

import { useState } from "react"

import { DatePicker } from "./date-picker"

export default function Page() {
  const [from, setFrom] = useState("2026-09-01")
  const [until, setUntil] = useState("")
  const [due, setDue] = useState("2026-10-15")

  return (
    <div className="flex w-full max-w-md flex-col gap-4 p-8">
      <DatePicker
        clearLabel="Clear Start Date"
        id="from"
        label="From"
        latest={until || undefined}
        onValueChange={setFrom}
        placeholder="Start Date"
        value={from}
      />
      <DatePicker
        clearLabel="Clear End Date"
        earliest={from || undefined}
        id="until"
        label="Until"
        onValueChange={setUntil}
        placeholder="End Date"
        value={until}
      />
      <DatePicker
        id="due"
        label="Due"
        onValueChange={setDue}
        placeholder="Pick a Date"
        required
        value={due}
      />
      <DatePicker
        disabled
        id="locked"
        label="Period"
        onValueChange={() => undefined}
        placeholder="Pick a Date"
        value="2026-01-31"
      />
    </div>
  )
}
