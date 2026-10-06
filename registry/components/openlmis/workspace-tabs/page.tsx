"use client"

import { useState } from "react"

import {
  WorkspaceTabs,
  WorkspaceTabsContent,
  WorkspaceTabsList,
  WorkspaceTabsTrigger,
} from "./workspace-tabs"

const SECTIONS = [
  {
    value: "general",
    label: "General",
    body: "Code, name and dispensing unit.",
  },
  {
    value: "programs",
    label: "Programs",
    body: "Programs that supply this product.",
  },
  {
    value: "facility-types",
    label: "Facility Types",
    body: "Stock targets for each facility type.",
  },
  {
    value: "kit-unpack-list",
    label: "Kit Unpack List",
    body: "Products a kit unpacks into.",
  },
]

export default function Page() {
  const [section, setSection] = useState("general")
  const [narrowSection, setNarrowSection] = useState("programs")

  return (
    <div className="flex w-full max-w-3xl flex-col gap-8 p-8">
      <WorkspaceTabs onValueChange={setSection} value={section}>
        <WorkspaceTabsList label="Product Sections">
          {SECTIONS.map((item) => (
            <WorkspaceTabsTrigger key={item.value} value={item.value}>
              {item.label}
            </WorkspaceTabsTrigger>
          ))}
        </WorkspaceTabsList>
        {SECTIONS.map((item) => (
          <WorkspaceTabsContent key={item.value} value={item.value}>
            <div className="flex h-24 items-center justify-center rounded-xl border border-dashed text-sm text-muted-foreground">
              {item.body}
            </div>
          </WorkspaceTabsContent>
        ))}
      </WorkspaceTabs>
      {/* In a narrow column, two by two. */}
      <div className="w-full max-w-xs">
        <WorkspaceTabs onValueChange={setNarrowSection} value={narrowSection}>
          <WorkspaceTabsList label="Product Sections, Narrow" wrap="grid">
            {SECTIONS.map((item) => (
              <WorkspaceTabsTrigger key={item.value} value={item.value}>
                {item.label}
              </WorkspaceTabsTrigger>
            ))}
          </WorkspaceTabsList>
        </WorkspaceTabs>
      </div>
    </div>
  )
}
