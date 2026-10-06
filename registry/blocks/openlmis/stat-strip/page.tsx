"use client"

import { useState } from "react"

import { Stat, StatStrip } from "./stat-strip"

export default function Page() {
  const [retried, setRetried] = useState(false)

  return (
    <div className="w-full max-w-5xl p-8">
      <StatStrip>
        <Stat label="Requisitions To Approve" value={4} />
        <Stat label="Requisitions To Convert" value={2} />
        <Stat label="Orders Not Received" value={undefined} />
        <Stat
          failed={!retried}
          label="Equipment Not Functioning"
          onRetry={() => setRetried(true)}
          value={5}
        />
      </StatStrip>
    </div>
  )
}
