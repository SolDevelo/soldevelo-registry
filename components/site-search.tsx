"use client"

import { Command as CommandPrimitive } from "cmdk"
import { SearchIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { posthog } from "posthog-js"
import * as React from "react"

import { ProjectMark } from "@/components/logo"
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command"
import { getProject } from "@/config/projects"
import { KIND_LABEL, REGISTRY_KINDS, itemPath } from "@/lib/registry-kinds"
import type { SearchEntry } from "@/lib/registry-data"

export function SiteSearch({
  open,
  onOpenChange,
  entries,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  entries: SearchEntry[]
}) {
  const router = useRouter()

  const groups = React.useMemo(
    () =>
      REGISTRY_KINDS.map((kind) => ({
        kind,
        items: entries.filter((entry) => entry.kind === kind),
      })).filter((group) => group.items.length > 0),
    [entries]
  )

  function go(entry: SearchEntry) {
    posthog.capture("search_result_selected", {
      item: entry.name,
      kind: entry.kind,
    })
    onOpenChange(false)
    router.push(itemPath(entry.kind, entry.name))
  }

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Search the registry"
      description="Find a component, block or template by name"
      className="sm:max-w-xl"
    >
      <Command
        filter={(value, search, keywords) => {
          const query = search.trim().toLowerCase()
          if (!query) return 1
          // Match the title and the item name only. Matching the description
          // makes an item hit on any common word that happens to be in it.
          return (keywords ?? [value]).some((keyword) =>
            keyword.toLowerCase().includes(query)
          )
            ? 1
            : 0
        }}
      >
        <div className="flex items-center gap-3 border-b px-4">
          <SearchIcon
            className="size-4 shrink-0 text-muted-foreground"
            aria-hidden="true"
          />
          <CommandPrimitive.Input
            placeholder="Search components, blocks and templates…"
            className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>

        <CommandPrimitive.List className="max-h-96 overflow-x-hidden overflow-y-auto p-0 outline-none">
          <CommandEmpty>Nothing found.</CommandEmpty>
          {groups.map(({ kind, items }) => (
            <CommandGroup
              key={kind}
              heading={`${KIND_LABEL[kind]}s`}
              className="p-1.5"
            >
              {items.map((entry) => (
                <CommandItem
                  key={entry.name}
                  value={entry.name}
                  keywords={[entry.title, entry.name, entry.project]}
                  onSelect={() => go(entry)}
                  className="gap-3 px-3 py-2.5"
                >
                  <ProjectMark project={entry.project} />
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="text-sm font-medium">{entry.title}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {getProject(entry.project)?.name}
                      {" · "}
                      {entry.description}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
        </CommandPrimitive.List>
      </Command>
    </CommandDialog>
  )
}
