import {
  AlertTriangleIcon,
  ClockIcon,
  PackageIcon,
  TrendingDownIcon,
  TrendingUpIcon,
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type Metric = {
  label: string
  value: string
  unit: string
  change: number
  // Whether a rise in this metric is good news. Stockouts rising is not.
  higherIsBetter: boolean
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
}

const METRICS: Metric[] = [
  {
    label: "Stock on hand",
    value: "48,120",
    unit: "units across 214 products",
    change: 4.2,
    higherIsBetter: true,
    icon: PackageIcon,
  },
  {
    label: "Below minimum",
    value: "17",
    unit: "products under their reorder point",
    change: -12.5,
    higherIsBetter: false,
    icon: AlertTriangleIcon,
  },
  {
    label: "Expiring in 90 days",
    value: "2,340",
    unit: "units across 9 lots",
    change: 8.1,
    higherIsBetter: false,
    icon: ClockIcon,
  },
  {
    label: "Stockouts",
    value: "3",
    unit: "products with zero stock on hand",
    change: -25,
    higherIsBetter: false,
    icon: TrendingDownIcon,
  },
]

export default function StockSummary() {
  return (
    <section className="w-full px-4 py-8">
      <div className="mx-auto grid w-full max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {METRICS.map((metric) => {
          const Icon = metric.icon
          const isGood = metric.change >= 0 === metric.higherIsBetter
          const TrendIcon =
            metric.change >= 0 ? TrendingUpIcon : TrendingDownIcon

          return (
            <Card key={metric.label}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon
                    className="size-4 text-muted-foreground"
                    aria-hidden="true"
                  />
                  {metric.label}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                <p className="text-3xl font-semibold tracking-tight tabular-nums">
                  {metric.value}
                </p>
                <p className="text-xs text-muted-foreground">{metric.unit}</p>
                <p
                  className={cn(
                    "flex items-center gap-1.5 text-xs font-medium",
                    isGood ? "text-success" : "text-destructive"
                  )}
                >
                  <TrendIcon className="size-3.5" aria-hidden="true" />
                  {metric.change > 0 ? "+" : ""}
                  {metric.change}% vs last period
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </section>
  )
}
