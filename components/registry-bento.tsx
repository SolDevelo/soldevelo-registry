"use client"

import * as React from "react"
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
} from "recharts"
import {
  animate,
  motion,
  useInView,
  useReducedMotion,
  type Variants,
} from "motion/react"
import { FileJsonIcon, ListTreeIcon, PlugIcon } from "lucide-react"
import Link from "next/link"

import { ProjectMark } from "@/components/logo"
import { registryAddress } from "@/config/site"
import { LiveDot, SectionEyebrow } from "@/components/section-eyebrow"
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  KIND_LABEL,
  itemPath,
  REGISTRY_KINDS,
  type RegistryKind,
} from "@/lib/registry-kinds"
import { cn } from "@/lib/utils"

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1]

const blurRise: Variants = {
  hidden: { opacity: 0, y: 16, filter: "blur(8px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.6, ease },
  },
}

export type GrowthPoint = {
  month: string
  actual: number | null
  projected: number
}

export type BentoItem = {
  name: string
  kind: RegistryKind
  project: string
  title: string
}

export function RegistryBento({
  counts,
  totalItems,
  items,
  growth,
}: {
  counts: Record<RegistryKind, number>
  totalItems: number
  items: BentoItem[]
  growth: GrowthPoint[]
}) {
  return (
    <motion.section
      aria-labelledby="bento-heading"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
      className="w-full"
    >
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
        <motion.div variants={blurRise}>
          <SectionEyebrow
            mark={<LiveDot />}
            lead="Generated From The"
            emphasis="Live Catalog"
          />
        </motion.div>
        <motion.h2
          variants={blurRise}
          id="bento-heading"
          className="font-heading text-3xl font-medium tracking-tighter text-balance sm:text-4xl"
        >
          One Command, Source You Own
        </motion.h2>
        <motion.p
          variants={blurRise}
          className="text-pretty text-muted-foreground"
        >
          The shadcn CLI copies each item into your repository. Nothing is
          hidden behind a package, and nothing phones home.
        </motion.p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-px overflow-hidden rounded-xl border bg-border md:grid-cols-3 md:grid-rows-3">
        <motion.div
          variants={blurRise}
          className="bg-card p-6 sm:p-8 md:col-span-2 md:row-span-2"
        >
          <GrowthMock totalItems={totalItems} growth={growth} />
        </motion.div>

        <motion.div variants={blurRise} className="bg-card p-6 md:row-span-2">
          <CatalogMock items={items} totalItems={totalItems} />
        </motion.div>

        <motion.div variants={blurRise} className="bg-card p-6">
          <KindMixMock counts={counts} totalItems={totalItems} />
        </motion.div>

        <motion.div variants={blurRise} className="bg-card p-6">
          <ArtifactsMock totalItems={totalItems} />
        </motion.div>

        <motion.div variants={blurRise} className="bg-card p-6">
          <AgentsMock />
        </motion.div>
      </div>
    </motion.section>
  )
}

const chartConfig = {
  actual: { label: "Shipped", color: "var(--primary)" },
  projected: { label: "Projected", color: "var(--chart-2)" },
} satisfies ChartConfig

function GrowthMock({
  totalItems,
  growth,
}: {
  totalItems: number
  growth: GrowthPoint[]
}) {
  const reduce = useReducedMotion()
  const today = growth[0]?.month ?? ""

  return (
    <div className="flex h-full flex-col">
      <h3 className="font-heading text-sm font-medium text-muted-foreground">
        Projected Growth
      </h3>
      <div className="mt-1 flex items-baseline gap-2">
        <CountUp
          value={totalItems}
          className="text-3xl font-bold tracking-tight tabular-nums sm:text-4xl"
        />
        <span className="text-sm text-muted-foreground">Installable Items</span>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        Shipped as of {today}. The dashed line is a projection, not a record.
      </p>

      <ChartContainer
        config={chartConfig}
        className="mt-6 min-h-0 w-full flex-1"
      >
        <ComposedChart
          aria-label="Installable items today and projected over the coming months"
          data={growth}
          margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="bento-fill" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor="var(--color-projected)"
                stopOpacity={0.16}
              />
              <stop
                offset="100%"
                stopColor="var(--color-projected)"
                stopOpacity={0}
              />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            interval={0}
            padding={{ left: 12, right: 12 }}
          />
          <YAxis
            width={32}
            tickLine={false}
            axisLine={false}
            tickMargin={6}
            allowDecimals={false}
          />
          <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
          <Area
            dataKey="projected"
            type="monotone"
            fill="url(#bento-fill)"
            stroke="var(--color-projected)"
            strokeWidth={2}
            strokeDasharray="6 4"
            isAnimationActive={!reduce}
            animationDuration={1300}
          />
          <Line
            dataKey="actual"
            stroke="var(--color-actual)"
            strokeWidth={2}
            dot={{ r: 5, fill: "var(--color-actual)", strokeWidth: 0 }}
            isAnimationActive={false}
          />
        </ComposedChart>
      </ChartContainer>
    </div>
  )
}

function CatalogMock({
  items,
  totalItems,
}: {
  items: BentoItem[]
  totalItems: number
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-sm font-medium">In The Catalog</h3>
        <LiveDot />
      </div>

      <motion.ul
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.4 }}
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
        }}
        className="mt-4 flex flex-col divide-y"
      >
        {items.map((item) => (
          <motion.li
            key={item.name}
            variants={{
              hidden: { opacity: 0, x: 8 },
              show: { opacity: 1, x: 0, transition: { duration: 0.45, ease } },
            }}
            className="py-3 first:pt-0"
          >
            <Link
              href={itemPath(item.kind, item.name)}
              className="flex items-center gap-3"
            >
              <ProjectMark project={item.project} className="size-5" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium">{item.title}</p>
                <p className="truncate font-mono text-3xs text-muted-foreground">
                  {registryAddress(item.name)}
                </p>
              </div>
              <span className="shrink-0 text-3xs text-muted-foreground">
                {KIND_LABEL[item.kind]}
              </span>
            </Link>
          </motion.li>
        ))}
      </motion.ul>

      <div className="mt-auto flex items-center justify-between border-t pt-4 text-xs">
        <span className="text-muted-foreground">Total Items</span>
        <CountUp value={totalItems} className="font-semibold tabular-nums" />
      </div>
    </div>
  )
}

const KIND_OPACITY: Record<RegistryKind, string> = {
  component: "opacity-100",
  block: "opacity-60",
  template: "opacity-35",
}

function KindMixMock({
  counts,
  totalItems,
}: {
  counts: Record<RegistryKind, number>
  totalItems: number
}) {
  const reduce = useReducedMotion()

  return (
    <div className="flex h-full flex-col">
      <h3 className="font-heading text-sm font-medium">Catalog By Kind</h3>

      <div className="mt-4 flex h-2 w-full overflow-hidden rounded-full bg-muted">
        <motion.div
          className="flex h-full w-full"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, amount: 0.8 }}
          transition={{ duration: 1.1, ease, delay: reduce ? 0 : 0.2 }}
          style={{ transformOrigin: "left" }}
        >
          {REGISTRY_KINDS.map((kind) => (
            <span
              key={kind}
              style={{ flex: counts[kind] }}
              className={cn("h-full bg-primary", KIND_OPACITY[kind])}
            />
          ))}
        </motion.div>
      </div>

      <ul className="mt-auto flex flex-col gap-2.5 pt-5 text-xs">
        {REGISTRY_KINDS.map((kind) => (
          <li key={kind} className="flex items-center gap-2.5">
            <span
              aria-hidden="true"
              className={cn(
                "size-2.5 shrink-0 rounded-sm bg-primary",
                KIND_OPACITY[kind]
              )}
            />
            <span className="flex-1 text-muted-foreground">
              {KIND_LABEL[kind]}s
            </span>
            <span className="font-medium tabular-nums">
              {Math.round((counts[kind] / totalItems) * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function ArtifactsMock({ totalItems }: { totalItems: number }) {
  const reduce = useReducedMotion()
  // One JSON per item, plus the index the CLI resolves names through.
  const artifacts = totalItems + 1

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-baseline justify-between">
        <h3 className="font-heading text-sm font-medium">Published</h3>
        <CountUp
          value={artifacts}
          className="text-sm font-semibold tabular-nums"
        />
      </div>

      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.6 }}
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: 0.05 } },
        }}
        className="mt-4 flex h-12 items-end gap-1"
        aria-hidden="true"
      >
        {Array.from({ length: artifacts }, (_, index) => index).map((index) => (
          <motion.span
            key={index}
            variants={{
              hidden: { scaleY: reduce ? 1 : 0.2, opacity: reduce ? 1 : 0 },
              show: {
                scaleY: 1,
                opacity: 1,
                transition: { duration: 0.3, ease },
              },
            }}
            style={{ transformOrigin: "bottom" }}
            className="h-full flex-1 rounded-sm bg-primary/25"
          />
        ))}
      </motion.div>

      <p className="mt-3 text-xs text-muted-foreground">
        Static JSON under /r, rebuilt on every commit
      </p>

      <div className="mt-auto flex items-center justify-between border-t pt-4 text-xs">
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <span
            aria-hidden="true"
            className="size-1.5 rounded-full bg-success"
          />
          In Sync
        </span>
        <span className="text-muted-foreground">
          <span className="font-medium text-foreground tabular-nums">0</span>{" "}
          Runtime Deps
        </span>
      </div>
    </div>
  )
}

const AGENT_SURFACES = [
  { label: "llms.txt", Icon: FileJsonIcon },
  { label: "REGISTRY.md", Icon: ListTreeIcon },
  { label: "shadcn MCP", Icon: PlugIcon },
]

function AgentsMock() {
  return (
    <div className="relative flex h-full flex-col overflow-hidden">
      <h3 className="font-heading text-sm font-medium">Built For Agents</h3>
      <p className="mt-1 text-xs text-muted-foreground">
        The catalog is machine readable, not just browsable.
      </p>
      <ul className="mt-4 flex flex-col gap-2 text-xs text-muted-foreground">
        {AGENT_SURFACES.map(({ label, Icon }) => (
          <li key={label} className="flex items-center gap-2">
            <Icon
              className="size-3.5 shrink-0 text-success"
              aria-hidden="true"
            />
            {label}
          </li>
        ))}
      </ul>
      <CornerDots />
    </div>
  )
}

function CornerDots() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 60 60"
      className="pointer-events-none absolute -right-2 -bottom-2 size-24 mask-corner-dots text-muted-foreground/50"
    >
      {Array.from({ length: 7 }, (_value, row) =>
        Array.from({ length: 7 }, (_inner, column) => (
          <circle
            key={`${row.toString()}-${column.toString()}`}
            cx={column * 9 + 4}
            cy={row * 9 + 4}
            r={1}
            fill="currentColor"
          />
        ))
      )}
    </svg>
  )
}

function CountUp({ value, className }: { value: number; className?: string }) {
  const ref = React.useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.6 })
  const reduce = useReducedMotion()

  React.useEffect(() => {
    const node = ref.current
    if (!node) return
    if (reduce || !inView) {
      node.textContent = value.toLocaleString("en-US")
      return
    }
    const controls = animate(0, value, {
      duration: 1.2,
      ease,
      onUpdate: (current) => {
        node.textContent = Math.round(current).toLocaleString("en-US")
      },
    })
    return () => controls.stop()
  }, [value, inView, reduce])

  return (
    <span ref={ref} className={className}>
      {value.toLocaleString("en-US")}
    </span>
  )
}
