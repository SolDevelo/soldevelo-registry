"use client"

import {
  type ChangeEvent,
  type KeyboardEvent,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react"

/** Draft for a text input that reports after a pause and otherwise follows the upstream value. */
export function useDebouncedInput(
  value: string,
  onValueChange: (value: string) => void,
  delay = 300
) {
  const [draft, setDraft] = useState(value)
  const [syncedValue, setSyncedValue] = useState(value)
  const [isTyping, setIsTyping] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const latestOnValueChange = useRef(onValueChange)

  useLayoutEffect(() => {
    latestOnValueChange.current = onValueChange
  })

  // Upstream wins unless the user is mid-typing; an echo that only trims the draft keeps it.
  if (value !== syncedValue) {
    setSyncedValue(value)
    if (!isTyping && value !== draft.trim()) setDraft(value)
  }

  // Leaving the page drops unsent typing; sending it would update a page already gone.
  useEffect(() => () => clearTimeout(timer.current), [])

  const emit = (next: string) => {
    clearTimeout(timer.current)
    setIsTyping(false)
    latestOnValueChange.current(next)
  }

  const change = (next: string) => {
    setDraft(next)
    setIsTyping(true)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => emit(next), delay)
  }

  const commit = (next: string) => {
    setDraft(next)
    emit(next)
  }

  // Leaving the field, e.g. to press Clear Filters, sends what was typed first so nothing arrives after it.
  const flush = () => {
    if (isTyping) emit(draft)
  }

  const inputProps = {
    value: draft,
    onChange: (event: ChangeEvent<HTMLInputElement>) =>
      change(event.target.value),
    onBlur: flush,
    onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => {
      // Enter that confirms an IME candidate is part of typing, not a search.
      if (event.key === "Enter" && !event.nativeEvent.isComposing) {
        commit(event.currentTarget.value)
      }
    },
  }

  return { draft, commit, inputProps }
}
