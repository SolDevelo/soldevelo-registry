import { Button } from "@/components/ui/button"

import { Callout } from "./callout"

export default function Page() {
  return (
    <div className="flex w-full max-w-lg flex-col gap-3 p-8">
      <Callout title="No Home Facility" tone="warning">
        Without a supervisory node this role applies at the home facility, and
        divo1 has none, so it grants nothing until one is set.
      </Callout>
      <Callout
        action={
          <Button size="sm" variant="outline">
            Undo
          </Button>
        }
        title="Role Removed"
        tone="info"
      >
        Storeroom Manager is removed. Save to keep the change.
      </Callout>
      <Callout title="Roles Saved" tone="success">
        The changes are saved.
      </Callout>
    </div>
  )
}
