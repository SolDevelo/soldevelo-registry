import {
  Workspace,
  WorkspaceContent,
} from "@/registry/blocks/openlmis/workspace/workspace"
import { NoAccess } from "@/registry/components/openlmis/no-access/no-access"

/** A whole page the signed-in user's roles do not reach, in place of the page. Render it inside your app shell. */
export function NoAccessPage({ homeHref = "/" }: { homeHref?: string }) {
  return (
    <Workspace>
      <WorkspaceContent>
        <NoAccess heading="h1" homeHref={homeHref} />
      </WorkspaceContent>
    </Workspace>
  )
}
