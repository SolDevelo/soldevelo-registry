import { HouseIcon, LockIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

type NoAccessProps = {
  /** `h1` when it stands in for the whole page, `h2` inside one. */
  heading?: "h1" | "h2"
  /** Where Back Home goes; `null` leaves the button out. */
  homeHref?: string | null
}

/** Where a page's content would be, for a user whose roles do not reach it. */
export function NoAccess({
  heading: Heading = "h2",
  homeHref = "/",
}: NoAccessProps) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <LockIcon />
        </EmptyMedia>
        <EmptyTitle>
          <Heading>No Access To This Page</Heading>
        </EmptyTitle>
        <EmptyDescription>
          Your roles do not include the rights this page needs. Ask an
          administrator if you need access.
        </EmptyDescription>
      </EmptyHeader>
      {homeHref !== null && (
        <EmptyContent>
          <Button
            nativeButton={false}
            // oxlint-disable-next-line jsx-a11y/control-has-associated-label -- Base UI renders the Button's text into the link
            render={<a href={homeHref} />}
            variant="outline"
          >
            <HouseIcon data-icon="inline-start" />
            Back Home
          </Button>
        </EmptyContent>
      )}
    </Empty>
  )
}
