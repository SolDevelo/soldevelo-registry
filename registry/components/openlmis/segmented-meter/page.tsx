import { SegmentedMeter } from "./segmented-meter"

export default function Page() {
  return (
    <div className="flex w-full max-w-md flex-col gap-10 p-8">
      <SegmentedMeter
        segments={[
          { id: "queued", label: "Queued", value: 12 },
          { id: "started", label: "Started", value: 8 },
          { id: "in-review", label: "In Review", value: 5 },
          { id: "accepted", label: "Accepted", value: 9 },
          { id: "done", label: "Done", value: 21 },
        ]}
      />
      <SegmentedMeter
        segments={[
          { id: "open", label: "Open", value: 0 },
          { id: "closed", label: "Closed", value: 0 },
        ]}
      />
    </div>
  )
}
