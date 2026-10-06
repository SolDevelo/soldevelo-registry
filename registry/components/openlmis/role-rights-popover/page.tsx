import { RoleRightsPopover } from "./role-rights-popover"

export default function Page() {
  return (
    <div className="flex w-full flex-col items-start gap-3 p-8 text-sm">
      <RoleRightsPopover
        name="Storeroom Manager"
        rights={[
          "Requisition Create",
          "Requisition Delete",
          "Requisition View",
          "Stock Cards View",
        ]}
      />
      <RoleRightsPopover
        description="Fulfills orders and records proofs of delivery."
        name="Warehouse Manager"
        rights={["Orders Edit", "Orders View", "PODs Manage"]}
      />
      <RoleRightsPopover name="Guest" rights={[]} />
    </div>
  )
}
