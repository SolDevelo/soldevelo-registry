import { EquipmentStatusCard } from "./equipment-status"

export default function Page() {
  return (
    <div className="w-full max-w-sm p-8">
      <EquipmentStatusCard
        counts={{
          FUNCTIONING: 42,
          NEEDS_ATTENTION: 6,
          AWAITING_REPAIR: 3,
          UNSERVICEABLE: 2,
        }}
      />
    </div>
  )
}
