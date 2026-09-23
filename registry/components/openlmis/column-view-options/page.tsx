"use client"

import { useState } from "react"

import { type ColumnVisibility, ColumnViewOptions } from "./column-view-options"

const COLUMNS = [
  { id: "name", label: "Name" },
  { id: "email", label: "Email" },
  { id: "status", label: "Status" },
]

export default function Page() {
  const [visibility, setVisibility] = useState<ColumnVisibility>({})
  const shown = COLUMNS.filter((column) => visibility[column.id] !== false)

  return (
    <div className="flex w-full max-w-sm flex-col items-start gap-3 p-8 pb-56">
      <ColumnViewOptions
        columns={COLUMNS}
        onReset={() => setVisibility({})}
        onVisibilityChange={setVisibility}
        visibility={visibility}
      />
      <p className="text-sm text-muted-foreground">
        Showing: {shown.map((column) => column.label).join(", ") || "none"}
      </p>
    </div>
  )
}
