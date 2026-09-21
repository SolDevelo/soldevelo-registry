import { SearchIcon, XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const FACILITIES = {
  "hf-kankao": "Kankao Health Facility",
  "hf-nandumbo": "Nandumbo Health Center",
  "hf-kalembo": "Kalembo Health Center",
  "wh-balaka": "Balaka District Warehouse",
}

const PROGRAMS = {
  "essential-meds": "Essential Medicines",
  "family-planning": "Family Planning",
  epi: "EPI (Vaccines)",
  arv: "ARV",
}

const PERIODS = {
  "2026-03": "March 2026",
  "2026-02": "February 2026",
  "2026-01": "January 2026",
}

export function ApprovalFilters() {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <FieldGroup className="grid gap-4 sm:grid-cols-3 lg:max-w-3xl lg:flex-1">
        <Field>
          <FieldLabel htmlFor="facility">Facility</FieldLabel>
          <Select items={FACILITIES} defaultValue="hf-kankao" name="facility">
            <SelectTrigger id="facility" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(FACILITIES).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field>
          <FieldLabel htmlFor="program">Program</FieldLabel>
          <Select items={PROGRAMS} defaultValue="essential-meds" name="program">
            <SelectTrigger id="program" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(PROGRAMS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field>
          <FieldLabel htmlFor="period">Reporting period</FieldLabel>
          <Select items={PERIODS} defaultValue="2026-03" name="period">
            <SelectTrigger id="period" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(PERIODS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </FieldGroup>

      <div className="flex items-center gap-2">
        <div className="relative">
          <SearchIcon
            className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="search"
            placeholder="Find a product"
            aria-label="Find a product"
            className="pl-8"
          />
        </div>
        <Button variant="ghost">
          <XIcon data-icon="inline-start" aria-hidden="true" />
          Clear
        </Button>
      </div>
    </div>
  )
}
