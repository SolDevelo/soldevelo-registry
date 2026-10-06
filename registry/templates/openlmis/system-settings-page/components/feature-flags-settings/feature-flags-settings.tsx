"use client"

import { useStore } from "@tanstack/react-form"
import { InfoIcon, RotateCcwIcon, SearchXIcon } from "lucide-react"
import { type ReactNode, useRef } from "react"

import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"
import { DataTableEmpty } from "@/registry/blocks/openlmis/data-table/data-table"
import { useAppForm } from "@/registry/components/openlmis/form-fields/form"
import { SearchInput } from "@/registry/components/openlmis/search-input/search-input"
import { SettingsList } from "@/registry/components/openlmis/settings-list/settings-list"

import {
  buildFlagOverrides,
  type FeatureFlagDefinition,
  filterFlags,
  flagValueLabel,
  type StoredFlags,
  toFlagDraft,
} from "./feature-flags"

type FeatureFlagsFormOptions = {
  flags: readonly FeatureFlagDefinition[]
  saved: StoredFlags
  /** Gets every override to store, including saved ones for flags not shown. */
  onSave: (overrides: StoredFlags) => void
}

/** The flags form, held by the page so its footer can save, cancel and see unsaved changes. */
export function useFeatureFlagsForm({
  flags,
  saved,
  onSave,
}: FeatureFlagsFormOptions) {
  return useAppForm({
    defaultValues: toFlagDraft(flags, saved),
    onSubmit: ({ value }) => onSave(buildFlagOverrides(flags, value, saved)),
  })
}

export type FeatureFlagsForm = ReturnType<typeof useFeatureFlagsForm>

function FlagAbout({ flag }: { flag: FeatureFlagDefinition }) {
  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            aria-label={`About ${flag.label}`}
            size="icon-xs"
            type="button"
            variant="ghost"
          />
        }
      >
        <InfoIcon />
      </PopoverTrigger>
      <PopoverContent align="start">
        <PopoverHeader>
          <PopoverTitle>{flag.label}</PopoverTitle>
          <PopoverDescription>{flag.description}</PopoverDescription>
        </PopoverHeader>
        <p className="text-sm">Used by: {flag.usedBy}.</p>
      </PopoverContent>
    </Popover>
  )
}

type FeatureFlagsSettingsProps = {
  form: FeatureFlagsForm
  flags: readonly FeatureFlagDefinition[]
  /** The page's Save button submits this form by id. */
  formId: string
  search: string
  onSearchChange: (search: string) => void
  /** Locks every flag while the parent saves. */
  pending?: boolean
  /** Between the search and the flags, such as a failed save. */
  feedback?: ReactNode
}

/** Each flag as a row: a switch or a select, what it inherits, and a Reset once it is changed here. */
export function FeatureFlagsSettings({
  form,
  flags,
  formId,
  search,
  onSearchChange,
  pending = false,
  feedback,
}: FeatureFlagsSettingsProps) {
  const values = useStore(form.store, (state) => state.values)
  const searchBox = useRef<HTMLDivElement>(null)
  const visible = filterFlags(flags, search)

  const clearSearch = () => {
    onSearchChange("")
    searchBox.current?.querySelector("input")?.focus()
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="w-full @2xl/main:w-72" ref={searchBox}>
        <SearchInput
          label="Search Feature Flags"
          onValueChange={onSearchChange}
          placeholder="Search By Name, Key Or Screen"
          value={search}
        />
      </div>
      {feedback}
      <form
        id={formId}
        noValidate
        onSubmit={(event) => {
          event.preventDefault()
          void form.handleSubmit()
        }}
      >
        {visible.length === 0 ? (
          <DataTableEmpty
            action={
              <Button
                onClick={clearSearch}
                size="sm"
                type="button"
                variant="outline"
              >
                Clear Filters
              </Button>
            }
            description="Try another name, key or screen."
            icon={<SearchXIcon />}
            title="No Feature Flags Match"
          />
        ) : (
          <SettingsList>
            {visible.map((flag) => {
              const { inherited } = flag
              const changed = values[flag.key]?.overridden ?? false
              return (
                <form.AppField
                  key={flag.key}
                  listeners={{
                    onChange: ({ value }) =>
                      form.setFieldValue(
                        `${flag.key}.overridden`,
                        value !== inherited.value
                      ),
                  }}
                  name={`${flag.key}.value`}
                >
                  {(field) => {
                    const shared = {
                      action: (
                        <>
                          <FlagAbout flag={flag} />
                          {changed && (
                            <Button
                              aria-label={`Reset ${flag.label}`}
                              disabled={pending}
                              onClick={(event) => {
                                const row = event.currentTarget.closest(
                                  "[data-slot='field']"
                                )
                                field.handleChange(inherited.value)
                                // The button goes away, so focus moves to the control it reset.
                                row
                                  ?.querySelector<HTMLElement>(
                                    "[role='switch'], [data-slot='select-trigger']"
                                  )
                                  ?.focus()
                              }}
                              size="xs"
                              type="button"
                              variant="destructive"
                            >
                              <RotateCcwIcon data-icon="inline-start" />
                              Reset
                            </Button>
                          )}
                        </>
                      ),
                      description: (
                        <>
                          <code className="font-mono text-xs" dir="ltr">
                            {flag.key}
                          </code>
                          {!changed &&
                            inherited.source === "deployment" &&
                            " · Set by the deployment"}
                          {changed && (
                            <span className="block text-primary">
                              Changed here ·{" "}
                              {inherited.source === "deployment"
                                ? "The deployment sets "
                                : "The default is "}
                              <span className="font-semibold">
                                {flagValueLabel(flag, inherited.value)}
                              </span>
                            </span>
                          )}
                        </>
                      ),
                      disabled: pending,
                      label: flag.label,
                      layout: "row" as const,
                    }
                    return (
                      <div className="relative">
                        {changed && (
                          <span
                            aria-hidden="true"
                            className="absolute inset-y-3 start-0 w-0.5 rounded-full bg-primary"
                          />
                        )}
                        {flag.type === "boolean" ? (
                          <field.SwitchField {...shared} />
                        ) : (
                          <field.SelectField {...shared} items={flag.options} />
                        )}
                      </div>
                    )
                  }}
                </form.AppField>
              )
            })}
          </SettingsList>
        )}
      </form>
    </div>
  )
}
