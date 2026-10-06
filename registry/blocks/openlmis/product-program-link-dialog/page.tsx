"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"

import {
  type ProgramLinkDialogTarget,
  ProductProgramLinkDialog,
} from "./product-program-link-dialog"
import {
  type NamedOption,
  type ProgramLink,
  withProgramLink,
} from "./program-link-form"

const PROGRAMS: NamedOption[] = [
  { id: "family-planning", name: "Family Planning" },
  { id: "essential-meds", name: "Essential Meds" },
  { id: "new-program", name: "New Program" },
  { id: "epi", name: "EPI" },
]

const CATEGORIES: NamedOption[] = [
  { id: "contraceptives", name: "Contraceptives" },
  { id: "analgesics", name: "Analgesics" },
  { id: "antibiotics", name: "Antibiotics" },
]

const LINKS: ProgramLink[] = [
  {
    programId: "family-planning",
    categoryId: "contraceptives",
    fullSupply: true,
    dosesPerPatient: 1,
    displayOrder: 2,
    pricePerPack: 4.5,
  },
]

type Demo = "add" | "edit" | "view" | "loading" | "saving" | "error"

const DEMOS: { value: Demo; label: string }[] = [
  { value: "add", label: "Add" },
  { value: "edit", label: "Edit" },
  { value: "view", label: "View" },
  { value: "loading", label: "Loading" },
  { value: "saving", label: "Saving" },
  { value: "error", label: "Save Failed" },
]

export default function Page() {
  const [links, setLinks] = useState(LINKS)
  // Open on load, so the catalog shows the dialog rather than its triggers.
  const [demo, setDemo] = useState<Demo | undefined>("add")
  const target: ProgramLinkDialogTarget | undefined =
    demo === undefined
      ? undefined
      : demo === "add" || demo === "loading"
        ? "new"
        : "family-planning"

  return (
    // Tall enough for the open dialog, which is fixed and so adds nothing to the frame's height.
    <div className="flex min-h-208 w-full flex-wrap content-start gap-2 p-8">
      {DEMOS.map((item) => (
        <Button
          key={item.value}
          onClick={() => setDemo(item.value)}
          size="sm"
          variant="outline"
        >
          {item.label}
        </Button>
      ))}
      <ProductProgramLinkDialog
        categories={demo === "loading" ? undefined : CATEGORIES}
        error={
          demo === "error"
            ? "Something went wrong. Check your connection and try again."
            : undefined
        }
        links={links}
        onClose={() => setDemo(undefined)}
        onSubmit={(link) => {
          setLinks((current) => withProgramLink(current, link))
          setDemo(undefined)
        }}
        pending={demo === "saving"}
        productName="Male Condom"
        programs={demo === "loading" ? undefined : PROGRAMS}
        readOnly={demo === "view"}
        target={target}
      />
    </div>
  )
}
