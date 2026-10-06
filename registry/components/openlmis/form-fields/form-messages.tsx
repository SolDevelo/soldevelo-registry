"use client"

import { createContext, type ReactNode, use, useMemo } from "react"

type FormMessages = {
  formatError: (message: string) => string
  aboutLabel: (label: string) => string
  requiredLabel: string
  dateLanguage: string
}

const defaultAboutLabel = (label: string) => `About ${label}`

const FormMessagesContext = createContext<FormMessages>({
  formatError: (message) => message,
  aboutLabel: defaultAboutLabel,
  requiredLabel: "Required",
  dateLanguage: "en-US",
})

type FormMessagesProviderProps = {
  /** Turns a validation message into display text, e.g. by translating a message key. */
  formatError: (message: string) => string
  /** Names the info button that shows a field's description. */
  aboutLabel?: (label: string) => string
  /** Read out with a field that must be filled in but cannot say so itself, such as a date. */
  requiredLabel?: string
  /** The language dates are shown in. */
  dateLanguage?: string
  children: ReactNode
}

/** Optional: without it, messages show exactly as written, in English. */
export function FormMessagesProvider({
  formatError,
  aboutLabel = defaultAboutLabel,
  requiredLabel = "Required",
  dateLanguage = "en-US",
  children,
}: FormMessagesProviderProps) {
  const messages = useMemo(
    () => ({ formatError, aboutLabel, requiredLabel, dateLanguage }),
    [formatError, aboutLabel, requiredLabel, dateLanguage]
  )
  return <FormMessagesContext value={messages}>{children}</FormMessagesContext>
}

export function useFormatError() {
  return use(FormMessagesContext).formatError
}

export function useAboutLabel() {
  return use(FormMessagesContext).aboutLabel
}

export function useDateMessages() {
  const { requiredLabel, dateLanguage } = use(FormMessagesContext)
  return { requiredLabel, dateLanguage }
}
