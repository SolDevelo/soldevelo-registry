"use client"

import { useMemo } from "react"

import { withForm } from "@/registry/components/openlmis/form-fields/form"

import {
  categoryLabel,
  EMPTY_REASON,
  REASON_CATEGORIES,
  REASON_TYPES,
  TAG_REFUSALS,
  toCodeItems,
  typeLabel,
} from "./reason-form"

export type ReasonLookups = {
  /** Category codes; defaults to the four OpenLMIS ships. */
  categories?: readonly string[]
  /** Type codes; defaults to Credit, Debit and Balance Adjustment. */
  types?: readonly string[]
  /** Tags other reasons use, suggested as the user types. */
  tags?: readonly string[]
}

type ReasonFormFieldsProps = {
  lookups?: ReasonLookups
  /** A saved reason keeps its category and type, so both are read only. */
  saved?: { category: string; type: string }
  readOnly?: boolean
}

const DEFAULT_CATEGORIES = Object.keys(REASON_CATEGORIES)
const DEFAULT_TYPES = Object.keys(REASON_TYPES)
const NO_TAGS: readonly string[] = []
const NO_LOOKUPS: ReasonLookups = {}

/** The reason's name, tags, category, type and free text, shared by Add Reason and the editor. */
export const ReasonFormFields = withForm({
  defaultValues: EMPTY_REASON,
  props: {} as ReasonFormFieldsProps,
  render: function Render({
    form,
    lookups = NO_LOOKUPS,
    saved,
    readOnly = false,
  }) {
    const {
      categories = DEFAULT_CATEGORIES,
      types = DEFAULT_TYPES,
      tags = NO_TAGS,
    } = lookups
    const categoryItems = useMemo(
      () => toCodeItems(categories, categoryLabel, saved?.category),
      [categories, saved?.category]
    )
    const typeItems = useMemo(
      () => toCodeItems(types, typeLabel, saved?.type),
      [types, saved?.type]
    )

    return (
      <div className="grid grid-cols-1 gap-x-6 gap-y-5 @3xl/main:grid-cols-2">
        <form.AppField name="name">
          {(field) => (
            <field.TextField
              autoComplete="off"
              dir="auto"
              disabled={readOnly}
              label="Name"
              required
            />
          )}
        </form.AppField>
        <form.AppField name="tags">
          {(field) => (
            <field.TagsField
              description="Tags group reasons for other screens; their meaning is up to your team. Press Enter or a comma to add one."
              disabled={readOnly}
              label="Tags"
              maxLength={255}
              minLength={3}
              placeholder="Add A Tag"
              refusedMessage={(reason) => TAG_REFUSALS[reason]}
              removeLabel={(tag) => `Remove ${tag}`}
              suggestions={tags}
            />
          )}
        </form.AppField>
        <form.AppField name="category">
          {(field) => (
            <field.SelectField
              description={
                saved
                  ? "A saved reason keeps its category and type."
                  : undefined
              }
              disabled={readOnly || Boolean(saved)}
              items={categoryItems}
              label="Category"
              required
            />
          )}
        </form.AppField>
        <form.AppField name="type">
          {(field) => (
            <field.SelectField
              disabled={readOnly || Boolean(saved)}
              items={typeItems}
              label="Type"
              required
            />
          )}
        </form.AppField>
        <form.AppField name="isFreeTextAllowed">
          {(field) => (
            <field.SwitchField
              description="Let users type a note when they pick this reason."
              disabled={readOnly}
              label="Allow Free Text"
            />
          )}
        </form.AppField>
      </div>
    )
  },
})
