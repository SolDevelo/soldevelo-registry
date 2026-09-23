import { UsersIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { PageBreadcrumbs } from "@/registry/components/openlmis/page-breadcrumbs/page-breadcrumbs"

import {
  Workspace,
  WorkspaceActions,
  WorkspaceContent,
  WorkspaceDescription,
  WorkspaceHeader,
  WorkspaceHeading,
  WorkspaceIcon,
  WorkspaceTitle,
} from "./workspace"

export default function Page() {
  return (
    <Workspace>
      <PageBreadcrumbs
        items={[
          { label: "Home", href: "#" },
          { label: "Administration" },
          { label: "Users" },
        ]}
      />
      <WorkspaceHeader>
        <WorkspaceHeading>
          <WorkspaceIcon>
            <UsersIcon />
          </WorkspaceIcon>
          <WorkspaceTitle>Users</WorkspaceTitle>
          <WorkspaceDescription>
            Accounts that can sign in to OpenLMIS.
          </WorkspaceDescription>
        </WorkspaceHeading>
        <WorkspaceActions>
          <Button size="lg">Export</Button>
        </WorkspaceActions>
      </WorkspaceHeader>
      <WorkspaceContent>
        <div className="flex h-40 items-center justify-center rounded-xl border border-dashed text-sm text-muted-foreground">
          Page content
        </div>
      </WorkspaceContent>
    </Workspace>
  )
}
