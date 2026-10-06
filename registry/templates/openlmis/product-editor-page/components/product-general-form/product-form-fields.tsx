"use client"

import { FieldGroup, FieldLegend, FieldSet } from "@/components/ui/field"
import { withForm } from "@/registry/components/openlmis/form-fields/form"

import { EMPTY_PRODUCT_FORM } from "./product-form"

/** The product's code, name and pack size, shared by Add Product and the General tab. */
export const ProductFormFields = withForm({
  defaultValues: EMPTY_PRODUCT_FORM,
  props: {} as { disabled?: boolean; sizeCode?: string | null },
  render: function Render({ form, disabled, sizeCode }) {
    return (
      <>
        <form.AppField name="productCode">
          {(field) => (
            <field.TextField
              autoComplete="off"
              dir="ltr"
              disabled={disabled}
              label="Product Code"
              required
            />
          )}
        </form.AppField>
        <form.AppField name="fullProductName">
          {(field) => (
            <field.TextField
              autoComplete="off"
              dir="auto"
              disabled={disabled}
              label="Name"
            />
          )}
        </form.AppField>
        <form.AppField name="description">
          {(field) => (
            <field.TextareaField
              dir="auto"
              disabled={disabled}
              label="Description"
            />
          )}
        </form.AppField>
        <FieldSet>
          <FieldLegend>Pack Size Information</FieldLegend>
          <FieldGroup>
            <form.AppField name="dispensingUnit">
              {(field) => (
                <field.TextField
                  autoComplete="off"
                  description={
                    sizeCode
                      ? `Sized by its size code, ${sizeCode}, so it takes no dispensing unit.`
                      : "The basic unit a patient is given when the clinician or pharmacist hands out the product, such as a 10 tab strip or each."
                  }
                  dir="auto"
                  disabled={disabled || Boolean(sizeCode)}
                  label="Dispensing Unit"
                  required={!sizeCode}
                />
              )}
            </form.AppField>
            <div className="grid gap-5 @md/field-group:grid-cols-2">
              <form.AppField name="netContent">
                {(field) => (
                  <field.NumberField
                    description="How many dispensing units one pack holds."
                    disabled={disabled}
                    label="Net Content"
                    required
                  />
                )}
              </form.AppField>
              <form.AppField name="packRoundingThreshold">
                {(field) => (
                  <field.NumberField
                    description="Leftover units above this number round an order up by one pack."
                    disabled={disabled}
                    label="Pack Rounding Threshold"
                    required
                  />
                )}
              </form.AppField>
            </div>
            <form.AppField name="roundToZero">
              {(field) => (
                <field.SwitchField
                  description="Let an order smaller than one pack round down to none. Off, it is always at least one pack."
                  disabled={disabled}
                  label="Round To Zero"
                />
              )}
            </form.AppField>
          </FieldGroup>
        </FieldSet>
      </>
    )
  },
})
