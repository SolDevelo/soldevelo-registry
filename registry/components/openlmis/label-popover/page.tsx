import { LabelPopover } from "./label-popover"

export default function Page() {
  return (
    <div className="flex w-full flex-col items-start gap-3 p-8 text-sm">
      <LabelPopover
        ariaLabel="About Lead Time"
        description="Days between placing an order and receiving it."
        label="Lead Time"
        title="Lead Time"
      >
        <ul className="flex max-h-64 flex-col gap-1.5 overflow-y-auto">
          <li>Measured from the order date.</li>
          <li>Averaged over the last three orders.</li>
        </ul>
      </LabelPopover>
      <LabelPopover
        ariaLabel="About Buffer Stock"
        description="Extra stock held to cover unexpected demand."
        label="Buffer Stock"
        title="Buffer Stock"
      />
    </div>
  )
}
