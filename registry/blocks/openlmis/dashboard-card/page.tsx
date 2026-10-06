"use client"

import { useState } from "react"

import {
  DashboardCard,
  DashboardCardCount,
  DashboardCardDescriptionSkeleton,
  DashboardCardError,
  DashboardRow,
} from "./dashboard-card"

export default function Page() {
  const [attempts, setAttempts] = useState(0)
  const [online, setOnline] = useState(false)

  return (
    <div className="flex w-full max-w-5xl flex-col gap-4 p-8">
      <DashboardRow
        narrow={
          <DashboardCard
            badge={<DashboardCardCount value={undefined} />}
            description={<DashboardCardDescriptionSkeleton />}
            title="Loading Card"
          >
            <div className="h-24 animate-pulse rounded-lg bg-muted" />
          </DashboardCard>
        }
        wide={
          <DashboardCard
            badge={<DashboardCardCount value={1204} />}
            description="A wide card beside a narrow one when the row has room."
            title="Stock On Hand"
          >
            {attempts === 0 ? (
              <DashboardCardError onRetry={() => setAttempts(1)} />
            ) : (
              <p className="text-sm text-muted-foreground">
                Loaded after Try Again.
              </p>
            )}
          </DashboardCard>
        }
      />
      <DashboardRow
        wide={
          <DashboardCard
            badge={<DashboardCardCount failed={!online} value={86} />}
            description="Offline, the card asks for a connection instead."
            title="Requisitions"
          >
            {online ? (
              <p className="text-sm text-muted-foreground">
                Loaded once back online.
              </p>
            ) : (
              <DashboardCardError
                onRetry={() => setOnline(true)}
                variant="offline"
              />
            )}
          </DashboardCard>
        }
      />
    </div>
  )
}
