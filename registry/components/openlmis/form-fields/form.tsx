import { createFormHook } from "@tanstack/react-form"

import { fieldContext, formContext } from "./form-context"
import {
  SwitchField,
  ComboboxField,
  PasswordField,
  RadioGroupField,
  TextField,
} from "./form-fields"

/** `useForm` with the field components attached, used as `<form.AppField>{(field) => <field.TextField />}`. */
export const { useAppForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    TextField,
    PasswordField,
    SwitchField,
    RadioGroupField,
    ComboboxField,
  },
  formComponents: {},
})
