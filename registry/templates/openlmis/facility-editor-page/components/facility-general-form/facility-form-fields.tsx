"use client"

import { useMemo } from "react"

import { withForm } from "@/registry/components/openlmis/form-fields/form"

import {
  EMPTY_FACILITY,
  type FacilityOption,
  toFacilityItems,
} from "./facility-form"

export type FacilityLookups = {
  types: readonly FacilityOption[]
  zones: readonly FacilityOption[]
  operators: readonly FacilityOption[]
}

type FacilityFormFieldsProps = {
  lookups: FacilityLookups
  /** Managed by another system: name, code, zone, description and Active cannot change. */
  locked?: boolean
  /** Every field read only, e.g. without the right to edit facilities. */
  readOnly?: boolean
  /** A saved facility must keep its operational date. */
  goLiveDateRequired?: boolean
}

/** The facility's details in two columns once there is room, shared by Add Facility and the editor. */
export const FacilityFormFields = withForm({
  defaultValues: EMPTY_FACILITY,
  props: {} as FacilityFormFieldsProps,
  render: function Render({
    form,
    lookups,
    locked = false,
    readOnly = false,
    goLiveDateRequired = false,
  }) {
    const typeItems = useMemo(
      () => toFacilityItems(lookups.types),
      [lookups.types]
    )
    const zoneItems = useMemo(
      () => toFacilityItems(lookups.zones),
      [lookups.zones]
    )
    const operatorItems = useMemo(
      () => toFacilityItems(lookups.operators),
      [lookups.operators]
    )
    const fixed = locked || readOnly

    return (
      <div className="grid gap-x-6 gap-y-5 @3xl/main:grid-cols-2">
        <form.AppField name="name">
          {(field) => (
            <field.TextField
              autoComplete="off"
              dir="auto"
              disabled={fixed}
              label="Facility Name"
              required
            />
          )}
        </form.AppField>
        <form.AppField name="code">
          {(field) => (
            <field.TextField
              autoComplete="off"
              dir="ltr"
              disabled={fixed}
              label="Facility Code"
              required
            />
          )}
        </form.AppField>
        <form.AppField name="typeId">
          {(field) => (
            <field.ComboboxField
              clearLabel="Clear Facility Type"
              disabled={readOnly}
              emptyMessage="No Matches"
              items={typeItems}
              label="Facility Type"
              placeholder="Select A Type"
              required
            />
          )}
        </form.AppField>
        <form.AppField name="zoneId">
          {(field) => (
            <field.ComboboxField
              clearLabel="Clear Geographic Zone"
              disabled={fixed}
              emptyMessage="No Matches"
              items={zoneItems}
              label="Geographic Zone"
              limit={-1}
              placeholder="Select A Zone"
              required
            />
          )}
        </form.AppField>
        <form.AppField name="goLiveDate">
          {(field) => (
            <field.DateField
              clearLabel="Clear Operational Date"
              description="This is used in reporting to record the date the facility becomes operational."
              disabled={readOnly}
              label="Operational Date"
              placeholder="Pick A Date"
              required={goLiveDateRequired}
            />
          )}
        </form.AppField>
        <form.AppField name="operatorId">
          {(field) => (
            <field.ComboboxField
              clearLabel="Clear Facility Operator"
              disabled={readOnly}
              emptyMessage="No Matches"
              items={operatorItems}
              label="Facility Operator"
              placeholder="Select An Operator"
            />
          )}
        </form.AppField>
        <form.AppField name="description">
          {(field) => (
            <field.TextareaField
              dir="auto"
              disabled={fixed}
              label="Description"
            />
          )}
        </form.AppField>
        <div className="@3xl/main:col-start-1">
          <form.AppField name="active">
            {(field) => (
              <field.SwitchField
                description="This determines whether or not the facility can submit requisitions or receive deliveries."
                disabled={fixed}
                label="Active Facility"
              />
            )}
          </form.AppField>
        </div>
        <form.AppField name="enabled">
          {(field) => (
            <field.SwitchField
              description="On: the facility can operate. Off: the facility is permanently decommissioned."
              disabled={readOnly}
              label="Enabled"
            />
          )}
        </form.AppField>
      </div>
    )
  },
})
