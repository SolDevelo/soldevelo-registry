import { SettingsIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { PageBreadcrumbs } from "@/registry/components/openlmis/page-breadcrumbs/page-breadcrumbs"

import {
  Workspace,
  WorkspaceActions,
  WorkspaceContent,
  WorkspaceDescription,
  WorkspaceFooter,
  WorkspaceHeader,
  WorkspaceHeading,
  WorkspaceIcon,
  WorkspaceTitle,
} from "./workspace"

export default function Page() {
  return (
    <>
      <Workspace width="narrow">
        <PageBreadcrumbs
          items={[
            { label: "Home", href: "#" },
            { label: "Settings" },
            { label: "General" },
          ]}
        />
        <WorkspaceHeader>
          <WorkspaceHeading>
            <WorkspaceIcon>
              <SettingsIcon />
            </WorkspaceIcon>
            <WorkspaceTitle>General Settings</WorkspaceTitle>
            <WorkspaceDescription>
              A narrow page, for settings that read as one short column.
            </WorkspaceDescription>
          </WorkspaceHeading>
          <WorkspaceActions>
            <Button size="lg" variant="outline">
              Reset
            </Button>
          </WorkspaceActions>
        </WorkspaceHeader>
        <WorkspaceContent>
          <div className="flex h-40 items-center justify-center rounded-xl border border-dashed text-sm text-muted-foreground">
            Page content
          </div>
        </WorkspaceContent>
      </Workspace>
      <WorkspaceFooter width="narrow">
        <Button variant="outline">Cancel</Button>
        <Button>Save</Button>
      </WorkspaceFooter>
    </>
  )
}
