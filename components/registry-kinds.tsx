"use client"

import { motion, type Variants } from "motion/react"

import { LayersIcon } from "lucide-react"

import { SectionEyebrow } from "@/components/section-eyebrow"
import { Badge } from "@/components/ui/badge"
import {
  KIND_LABEL,
  REGISTRY_KINDS,
  type RegistryKind,
} from "@/lib/registry-kinds"

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1]

const rise: Variants = {
  hidden: { opacity: 0, y: 16, filter: "blur(8px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.6, ease },
  },
}

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
}

const COPY: Record<RegistryKind, string> = {
  component:
    "One primitive that renders a domain value the same way everywhere it appears.",
  block:
    "A complete screen region, with layout, dark mode and accessibility already handled.",
  template:
    "A whole page, shipped with editable copies of every section it is built from.",
}

// The mocks mirror what the catalog actually contains, so the illustration and
// the registry cannot tell different stories.
const MOCK: Record<RegistryKind, React.ReactNode> = {
  component: <StatusPillsMock />,
  block: <StatBandMock />,
  template: <PageMock />,
}

export function RegistryKinds({
  counts,
}: {
  counts: Record<RegistryKind, number>
}) {
  return (
    <section aria-labelledby="kinds-heading" className="w-full">
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.6 }}
        variants={stagger}
        className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center"
      >
        <motion.div variants={rise}>
          <SectionEyebrow
            mark={<LayersIcon className="size-4" aria-hidden="true" />}
            lead="Inside The"
            emphasis="Registry"
          />
        </motion.div>
        <motion.h2
          variants={rise}
          id="kinds-heading"
          className="font-heading text-3xl font-medium tracking-tighter text-balance sm:text-4xl"
        >
          Three Kinds Of Thing To Install
        </motion.h2>
        <motion.p variants={rise} className="text-pretty text-muted-foreground">
          Pick the level you need, from a single primitive to an entire page.
        </motion.p>
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        variants={stagger}
        className="mt-8 grid grid-cols-1 gap-px overflow-hidden rounded-xl border bg-border sm:grid-cols-3"
      >
        {REGISTRY_KINDS.map((kind) => (
          <motion.div
            key={kind}
            variants={rise}
            className="flex flex-col bg-card p-6 sm:p-8"
          >
            <div
              className="flex h-36 items-center justify-center"
              aria-hidden="true"
            >
              {MOCK[kind]}
            </div>
            <h3 className="mt-6 flex items-center justify-center gap-2 font-heading text-base font-semibold tracking-tight">
              {KIND_LABEL[kind]}s
              <Badge variant="secondary">{counts[kind]}</Badge>
            </h3>
            <p className="mt-2 text-center text-sm text-pretty text-muted-foreground">
              {COPY[kind]}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}

const STATUSES = [
  { label: "Initiated", variant: "outline" as const },
  { label: "Submitted", variant: "secondary" as const },
  { label: "Approved", variant: "default" as const },
  { label: "Rejected", variant: "destructive" as const },
]

function StatusPillsMock() {
  return (
    <div className="flex w-full max-w-60 flex-col gap-3">
      <div className="flex items-center justify-between text-3xs text-muted-foreground">
        <span>requisition.status</span>
        <span className="font-mono">enum</span>
      </div>
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.6 }}
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: 0.07, delayChildren: 0.15 } },
        }}
        className="flex flex-wrap items-center justify-center gap-1.5"
      >
        {STATUSES.map((status) => (
          <motion.span
            key={status.label}
            variants={{
              hidden: { opacity: 0, scale: 0.85 },
              show: {
                opacity: 1,
                scale: 1,
                transition: { duration: 0.35, ease },
              },
            }}
          >
            <Badge variant={status.variant}>{status.label}</Badge>
          </motion.span>
        ))}
      </motion.div>
      <p className="text-center text-3xs text-muted-foreground">
        One mapping, every screen
      </p>
    </div>
  )
}

const STATS = [
  { label: "On Hand", value: "48,120", trend: 72 },
  { label: "Below Min", value: "17", trend: 34 },
  { label: "Expiring", value: "2,340", trend: 58 },
  { label: "Stockouts", value: "3", trend: 18 },
]

function StatBandMock() {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.5 }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
      }}
      className="grid w-full max-w-60 grid-cols-2 gap-2"
    >
      {STATS.map((tile) => (
        <motion.div
          key={tile.label}
          variants={{
            hidden: { opacity: 0, y: 8 },
            show: { opacity: 1, y: 0, transition: { duration: 0.4, ease } },
          }}
          className="flex flex-col gap-1 rounded-md border p-2"
        >
          <span className="text-3xs text-muted-foreground">{tile.label}</span>
          <span className="text-sm font-semibold tabular-nums">
            {tile.value}
          </span>
          <span className="block h-1 rounded-full bg-muted">
            <motion.span
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: tile.trend / 100 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.9, ease, delay: 0.3 }}
              style={{ transformOrigin: "left" }}
              className="block h-1 rounded-full bg-primary"
            />
          </span>
        </motion.div>
      ))}
    </motion.div>
  )
}

function PageMock() {
  return (
    <div className="flex w-full max-w-60 flex-col gap-2 rounded-md border bg-card p-2.5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="h-2.5 w-20 rounded-sm bg-foreground/70" />
        <span className="h-3.5 w-10 rounded-full bg-primary/80" />
      </div>
      <div className="grid grid-cols-3 gap-1.5">
        {[0, 1, 2].map((filter) => (
          <span
            key={filter}
            className="flex h-4 items-center rounded-md border px-1"
          >
            <span className="h-1 w-full rounded-sm bg-muted" />
          </span>
        ))}
      </div>
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.5 }}
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: 0.07, delayChildren: 0.2 } },
        }}
        className="flex flex-col gap-1.5 rounded-md border p-2"
      >
        {[0, 1, 2, 3].map((row) => (
          <motion.div
            key={row}
            variants={{
              hidden: { opacity: 0, x: -6 },
              show: { opacity: 1, x: 0, transition: { duration: 0.35, ease } },
            }}
            className="flex items-center gap-2"
          >
            <span className="h-1.5 flex-1 rounded-sm bg-muted" />
            <span className="h-1.5 w-5 rounded-sm bg-muted" />
            <span className="h-1.5 w-7 rounded-sm bg-foreground/40" />
          </motion.div>
        ))}
      </motion.div>
      <div className="flex justify-end gap-1.5">
        <span className="h-3.5 w-8 rounded-md border" />
        <span className="h-3.5 w-10 rounded-md bg-primary/80" />
      </div>
    </div>
  )
}
