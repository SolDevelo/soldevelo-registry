"use client"

import { FileQuestionIcon, HouseIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

type NotFoundPageProps = {
  /** The address that was asked for, shown so the reader can spot a typo. */
  path?: string
  /** Where Back Home goes. */
  homeHref?: string
  /** Defaults to the browser's Back; pass your router's instead. */
  onBack?: () => void
}

const goBack = () => window.history.back()

/** A page that does not exist: what was asked for, and a way back. Render it inside your app shell to keep the sidebar. */
export function NotFoundPage({
  path,
  homeHref = "/",
  onBack = goBack,
}: NotFoundPageProps) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <FileQuestionIcon />
        </EmptyMedia>
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Error 404
        </p>
        <EmptyTitle>
          <h1>Page Not Found</h1>
        </EmptyTitle>
        <EmptyDescription>
          This page does not exist, or it has moved. Check the address, or head
          back.
        </EmptyDescription>
        {path && (
          <code className="max-w-full truncate rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
            {path}
          </code>
        )}
      </EmptyHeader>
      <EmptyContent>
        <div className="flex flex-wrap justify-center gap-2">
          <Button onClick={onBack} size="lg" variant="outline">
            Go Back
          </Button>
          <Button
            nativeButton={false}
            // oxlint-disable-next-line jsx-a11y/control-has-associated-label -- Base UI renders the Button's text into the link
            render={<a href={homeHref} />}
            size="lg"
          >
            <HouseIcon data-icon="inline-start" />
            Back Home
          </Button>
        </div>
      </EmptyContent>
    </Empty>
  )
}
