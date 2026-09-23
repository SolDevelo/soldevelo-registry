"use client"

import { PlusIcon } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  type ColumnVisibility,
  ColumnViewOptions,
} from "@/registry/components/openlmis/column-view-options/column-view-options"
import { SearchInput } from "@/registry/components/openlmis/search-input/search-input"
import { SelectFilter } from "@/registry/components/openlmis/select-filter/select-filter"

import {
  ListToolbar,
  ListToolbarEnd,
  ListToolbarFilter,
  ListToolbarSearch,
} from "./list-toolbar"

const COLUMNS = [
  { id: "name", label: "Name" },
  { id: "email", label: "Email" },
  { id: "status", label: "Status" },
]

export default function Page() {
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState("")
  const [visibility, setVisibility] = useState<ColumnVisibility>({})

  return (
    <div className="w-full max-w-5xl p-8">
      <ListToolbar>
        <ListToolbarSearch>
          <SearchInput onValueChange={setQuery} value={query} />
        </ListToolbarSearch>
        <ListToolbarFilter>
          <SelectFilter
            label="Status"
            onValueChange={setStatus}
            options={[
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" },
            ]}
            value={status}
          />
        </ListToolbarFilter>
        <ListToolbarEnd>
          <ColumnViewOptions
            columns={COLUMNS}
            onReset={() => setVisibility({})}
            onVisibilityChange={setVisibility}
            visibility={visibility}
          />
          <Button>
            <PlusIcon data-icon="inline-start" />
            Add User
          </Button>
        </ListToolbarEnd>
      </ListToolbar>
    </div>
  )
}
