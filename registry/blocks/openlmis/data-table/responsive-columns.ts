"use client"

import type { ColumnVisibilityState } from "@tanstack/react-table"
import { useCallback, useRef, useState } from "react"

/** Tailwind's container sizes in px, smallest first, so defaults switch where `@md:`-style classes do. */
const CONTAINER_WIDTHS = {
  sm: 384,
  md: 448,
  lg: 512,
  xl: 576,
  "2xl": 672,
  "3xl": 768,
  "4xl": 896,
  "5xl": 1024,
} as const

export type ContainerSize = keyof typeof CONTAINER_WIDTHS

const SIZES = Object.keys(CONTAINER_WIDTHS) as ContainerSize[]

export type ResponsiveColumn = {
  id: string
  /** The column is hidden by default when the table has less room than this container size. */
  hideBelow?: ContainerSize
}

/** The largest container size that fits, or "none" when even the smallest does not. */
type FittingSize = ContainerSize | "none"

function fittingSize(width: number): FittingSize {
  let fitting: FittingSize = "none"
  for (const size of SIZES) if (width >= CONTAINER_WIDTHS[size]) fitting = size
  return fitting
}

/** The room an element has, as a container size; a sidebar changes it, not just the window. */
export function useContainerSize<T extends HTMLElement>() {
  // A size rather than a width, so resizing only re-renders when a size boundary is crossed.
  const [size, setSize] = useState<FittingSize | undefined>(undefined)
  const observer = useRef<ResizeObserver | null>(null)

  // A ref callback measures during commit, so the first size is in before the browser paints.
  const ref = useCallback((element: T | null) => {
    observer.current?.disconnect()
    observer.current = null
    if (!element) return
    setSize(fittingSize(element.getBoundingClientRect().width))
    observer.current = new ResizeObserver(([entry]) => {
      // The border box, like getBoundingClientRect, so padding never shifts the result.
      const width = entry?.borderBoxSize[0]?.inlineSize
      if (width !== undefined) setSize(fittingSize(width))
    })
    observer.current.observe(element)
  }, [])

  return [ref, size] as const
}

function fits(size: FittingSize | undefined, needed: ContainerSize) {
  // Before the first measurement everything counts as fitting; the ref callback corrects it before paint.
  if (size === undefined) return true
  return size !== "none" && SIZES.indexOf(size) >= SIZES.indexOf(needed)
}

/** Visibility that fits the room until the user picks; the caller stores the picks and measures the room. */
export function useColumnVisibility(
  columns: readonly ResponsiveColumn[],
  [choices, setChoices]: readonly [
    ColumnVisibilityState,
    (next: ColumnVisibilityState) => void,
  ],
  size: FittingSize | undefined
) {
  const visibility: ColumnVisibilityState = Object.fromEntries(
    columns.map((column) => [
      column.id,
      choices[column.id] ??
        (column.hideBelow ? fits(size, column.hideBelow) : true),
    ])
  )

  return {
    visibility,
    // Only the columns the user just toggled are stored, so the rest keep following the room.
    onVisibilityChange: (next: ColumnVisibilityState) =>
      setChoices({
        ...choices,
        ...Object.fromEntries(
          Object.entries(next).filter(([id, shown]) => visibility[id] !== shown)
        ),
      }),
    onReset: () => setChoices({}),
  }
}
