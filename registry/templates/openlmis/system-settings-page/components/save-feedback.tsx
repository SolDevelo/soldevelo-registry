import { AlertCircleIcon } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Callout } from "@/registry/components/openlmis/callout/callout"

export type SaveOutcome =
  | { kind: "saved"; title: string; description: string }
  | { kind: "error"; message?: string }
  | { kind: "conflict" }

type SaveFeedbackProps = {
  outcome: SaveOutcome | undefined
  onReload: () => void
  onDismiss: () => void
}

/** How the last save went, in place of the source app's toasts. */
export function SaveFeedback({
  outcome,
  onReload,
  onDismiss,
}: SaveFeedbackProps) {
  if (!outcome) return null
  if (outcome.kind === "saved") {
    return (
      <Callout
        action={
          <Button onClick={onDismiss} size="sm" type="button" variant="ghost">
            Dismiss
          </Button>
        }
        title={outcome.title}
        tone="success"
      >
        {outcome.description}
      </Callout>
    )
  }
  if (outcome.kind === "conflict") {
    return (
      <Callout
        action={
          <Button onClick={onReload} size="sm" type="button" variant="outline">
            Reload
          </Button>
        }
        title="Settings Changed Elsewhere"
        tone="warning"
      >
        Someone else saved these settings while you were editing. Reload to see
        their changes, then make yours again.
      </Callout>
    )
  }
  return (
    <Alert variant="destructive">
      <AlertCircleIcon />
      <AlertTitle>Settings Not Saved</AlertTitle>
      <AlertDescription>
        {outcome.message ?? "The settings could not be saved. Try again."}
      </AlertDescription>
    </Alert>
  )
}
