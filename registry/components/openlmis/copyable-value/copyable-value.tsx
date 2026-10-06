"use client"

import { CheckIcon, CopyIcon } from "lucide-react"
import type { ComponentProps } from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/** Copy state for a value; the caller does the copying and says when it is done. */
export type CopyState = {
  /** Shows a tick and `copiedLabel` in place of the copy icon. */
  copied?: boolean
  /** Called on click; copy `value`, then pass `copied`. */
  onCopy?: ((value: string) => void) | undefined
  /** Called with `false` when a copied button loses focus or the pointer, so the tick can reset. */
  onCopiedChange?: ((copied: boolean) => void) | undefined
}

export type CopyButtonProps = CopyState & {
  value: string
  /** Accessible name before copying. */
  copyLabel?: string
  /** Accessible name once copied. */
  copiedLabel?: string
  /** Takes focus as it mounts, e.g. when a dialog opens on a new value. */
  focusOnMount?: boolean
}

/** An icon button that asks the caller to copy `value`, showing a tick while `copied` is set. */
export function CopyButton({
  value,
  copyLabel = "Copy",
  copiedLabel = "Copied",
  focusOnMount = false,
  copied = false,
  onCopy,
  onCopiedChange,
}: CopyButtonProps) {
  // Safari does not focus a clicked button, so blur alone may never fire.
  const reset = () => copied && onCopiedChange?.(false)

  return (
    <Button
      aria-label={copied ? copiedLabel : copyLabel}
      // oxlint-disable-next-line jsx-a11y/no-autofocus -- a caller opts in when the value is what its surface is about
      autoFocus={focusOnMount}
      onBlur={reset}
      onClick={() => onCopy?.(value)}
      onPointerLeave={reset}
      size="icon-xs"
      type="button"
      variant="ghost"
    >
      {copied ? <CheckIcon /> : <CopyIcon />}
    </Button>
  )
}

type CopyableValueProps = CopyButtonProps &
  Omit<ComponentProps<"div">, "children" | "onCopy">

/** A value shown in full, monospaced, with its Copy button. */
export function CopyableValue({
  value,
  copyLabel,
  copiedLabel,
  focusOnMount,
  copied,
  onCopy,
  onCopiedChange,
  className,
  ...props
}: CopyableValueProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg border bg-muted/50 px-3 py-2",
        className
      )}
      {...props}
    >
      <span className="min-w-0 flex-1 font-mono text-sm break-all" dir="ltr">
        {value}
      </span>
      <CopyButton
        copied={copied}
        copiedLabel={copiedLabel}
        copyLabel={copyLabel}
        focusOnMount={focusOnMount}
        onCopiedChange={onCopiedChange}
        onCopy={onCopy}
        value={value}
      />
    </div>
  )
}
