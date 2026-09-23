"use client"

import { useState } from "react"

import { SearchInput } from "./search-input"

export default function Page() {
  const [query, setQuery] = useState("")

  return (
    <div className="flex w-full max-w-sm flex-col gap-3 p-8">
      <SearchInput
        label="Search by username, name or email"
        onValueChange={setQuery}
        value={query}
      />
      <p className="text-sm text-muted-foreground">
        Searching for: {query ? `"${query}"` : "nothing yet"}
      </p>
    </div>
  )
}
