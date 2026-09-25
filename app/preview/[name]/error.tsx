"use client"

import { useEffect } from "react"
import { AlertTriangleIcon, RefreshCwIcon } from "lucide-react"
import { posthog } from "posthog-js"

import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

export default function PreviewError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
    posthog.captureException(error, { digest: error.digest })
  }, [error])

  return (
    <Empty className="w-full max-w-md">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <AlertTriangleIcon aria-hidden="true" />
        </EmptyMedia>
        <EmptyTitle>Preview failed to load</EmptyTitle>
        <EmptyDescription>
          This preview ran into an unexpected error. Try reloading it.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button onClick={reset}>
          <RefreshCwIcon data-icon="inline-start" aria-hidden="true" />
          Try Again
        </Button>
        {error.digest ? (
          <EmptyDescription>Reference: {error.digest}</EmptyDescription>
        ) : null}
      </EmptyContent>
    </Empty>
  )
}
