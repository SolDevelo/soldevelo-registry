import { createFormHook } from "@tanstack/react-form"

import { fieldContext, formContext } from "./form-context"
import {
  ComboboxField,
  DateField,
  DecimalField,
  ImageField,
  MultiComboboxField,
  NumberField,
  PasswordField,
  RadioGroupField,
  SelectField,
  SwitchField,
  TagsField,
  TextareaField,
  TextField,
} from "./form-fields"

/** `useForm` with the field components attached, used as `<form.AppField>{(field) => <field.TextField />}`. */
export const { useAppForm, withForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    TextField,
    NumberField,
    DecimalField,
    TextareaField,
    PasswordField,
    SwitchField,
    RadioGroupField,
    ComboboxField,
    MultiComboboxField,
    TagsField,
    SelectField,
    ImageField,
    DateField,
  },
  formComponents: {},
})
