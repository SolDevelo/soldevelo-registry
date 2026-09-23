"use client"

import Link from "next/link"
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  LockIcon,
  SearchIcon,
  UserIcon,
  XIcon,
} from "lucide-react"
import { MotionConfig, motion, type Variants } from "motion/react"

import { ShadcnAvatar } from "@/components/icons"
import { ProjectMark } from "@/components/logo"
import { SectionEyebrow } from "@/components/section-eyebrow"
import { StackMarks } from "@/components/stack-marks"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"

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

// The heading and subtitle are the LCP candidates, and an element at opacity 0 has not painted
// yet, so they move without fading: visible in the server HTML, before any script runs.
const settle: Variants = {
  hidden: { y: 12 },
  show: { y: 0, transition: { duration: 0.6, ease } },
}

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
}

// The devices rise out of the fold after the copy has settled.
function device(delay: number): Variants {
  return {
    hidden: { opacity: 0, y: 90 },
    show: { opacity: 1, y: 0, transition: { duration: 0.9, ease, delay } },
  }
}

export function Hero() {
  return (
    <MotionConfig reducedMotion="user">
      <section className="relative isolate flex w-full flex-col items-center overflow-hidden px-4 pt-10 sm:pt-14">
        <GlowBackdrop />

        <motion.div
          initial="hidden"
          animate="show"
          variants={stagger}
          className="relative z-10 flex w-full max-w-4xl flex-col items-center gap-4 text-center"
        >
          <motion.p variants={rise}>
            <SectionEyebrow
              className="flex-col whitespace-nowrap sm:flex-row"
              mark={<StackMarks />}
              lead="Powered By"
              emphasis="Latest Technologies"
            />
          </motion.p>

          <motion.h1
            variants={settle}
            className="font-heading text-4xl leading-hero font-bold tracking-tighter text-balance sm:text-5xl"
          >
            Every open source project rebuilds the same screens.{" "}
            <span className="font-light italic">Install them instead.</span>
          </motion.h1>

          <motion.p
            variants={settle}
            className="max-w-2xl text-pretty text-muted-foreground"
          >
            {siteConfig.DESCRIPTION}
          </motion.p>

          <motion.div
            variants={rise}
            className="mt-2 flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row"
          >
            <Button
              size="xl"
              variant="secondary"
              nativeButton={false}
              className="w-full sm:w-auto"
              render={<Link href="/docs" />}
            >
              Read The Docs
            </Button>
            <Button
              size="xl"
              nativeButton={false}
              className="w-full sm:w-auto"
              render={<Link href="/blocks" />}
            >
              Browse Blocks
              <ChevronRightIcon data-icon="inline-end" aria-hidden="true" />
            </Button>
          </motion.div>

          <motion.p
            variants={rise}
            className="flex flex-wrap items-center justify-center gap-x-1.5 text-xs text-muted-foreground"
          >
            <span>Install with the</span>
            {/* Decorative now that "shadcn" is spelled out beside it. */}
            <ShadcnAvatar className="size-4" alt="" />
            <span className="font-medium text-foreground">shadcn CLI.</span>
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease, delay: 0.3 }}
          aria-hidden="true"
          className="relative z-10 w-full max-w-5xl pt-12 sm:pt-14"
        >
          <div className="relative h-72 overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-b from-muted/60 via-muted/25 to-transparent ring-1 ring-foreground/5 ring-inset sm:h-88">
            <div className="absolute inset-x-8 top-0 h-28 bg-brand-glow" />

            <motion.div
              variants={device(0.6)}
              initial="hidden"
              animate="show"
              className="absolute top-20 left-10 z-10 hidden origin-bottom scale-90 -rotate-6 lg:block"
            >
              <Phone>
                <StockScreen />
              </Phone>
            </motion.div>

            <motion.div
              variants={device(0.45)}
              initial="hidden"
              animate="show"
              className="absolute inset-x-4 top-6 z-20 flex justify-center"
            >
              <BrowserWindow>
                <ApprovalScreen />
              </BrowserWindow>
            </motion.div>

            <motion.div
              variants={device(0.72)}
              initial="hidden"
              animate="show"
              className="absolute top-20 right-10 z-10 hidden origin-bottom scale-90 rotate-6 lg:block"
            >
              <Phone>
                <RequisitionsScreen />
              </Phone>
            </motion.div>
          </div>
        </motion.div>
      </section>
    </MotionConfig>
  )
}

function GlowBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10"
    >
      <div className="absolute top-0 left-1/2 h-96 w-full max-w-4xl -translate-x-1/2 bg-brand-glow" />
    </div>
  )
}

function Phone({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-52 rounded-phone border border-border/80 bg-gradient-to-b from-card to-card/70 p-2 shadow-2xl ring-1 ring-foreground/10 sm:w-56">
      <div className="relative h-104 overflow-hidden rounded-phone-inner bg-gradient-to-b from-background to-muted/30 ring-1 ring-border/60 ring-inset">
        <div className="absolute top-2.5 left-1/2 h-5 w-16 -translate-x-1/2 rounded-full bg-foreground/85" />
        <div className="px-4 pt-11 pb-4">{children}</div>
      </div>
    </div>
  )
}

// The template's install target under a reserved documentation domain, so the mock never points at a real host.
const PREVIEW_URL = "openlmis.example/requisition-approval"

function BrowserWindow({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full max-w-lg overflow-hidden rounded-xl border border-border/80 bg-card shadow-2xl ring-1 ring-foreground/10">
      <div className="flex items-center gap-3 border-b bg-muted/50 px-3 py-2">
        <span className="flex gap-1.5">
          <span className="size-2.5 rounded-full bg-foreground/15" />
          <span className="size-2.5 rounded-full bg-foreground/15" />
          <span className="size-2.5 rounded-full bg-foreground/15" />
        </span>
        <span className="flex h-5 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-md bg-background px-2.5 text-3xs text-muted-foreground ring-1 ring-border/60">
          <LockIcon className="size-2.5 shrink-0" />
          <span className="min-w-0 truncate">{PREVIEW_URL}</span>
        </span>
        <span className="hidden w-9 sm:block" />
      </div>
      {children}
    </div>
  )
}

function OpenLmisBar({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 border-b",
        compact ? "pb-2.5" : "px-4 py-2"
      )}
    >
      <ProjectMark
        project="openlmis"
        className={compact ? "size-3.5" : "size-4"}
      />
      <span className={cn("font-semibold", compact ? "text-3xs" : "text-2xs")}>
        OpenLMIS
      </span>
      {!compact && (
        <span className="ml-3 hidden gap-3 text-3xs text-muted-foreground sm:flex">
          <span className="font-medium text-foreground">Requisitions</span>
          <span>Stock</span>
          <span>Reports</span>
        </span>
      )}
      <span className="ml-auto grid size-5 place-items-center rounded-full bg-primary/15 text-primary">
        <UserIcon className="size-3" />
      </span>
    </div>
  )
}

// Illustrative OpenLMIS data for the hero; it is drawn here and imports no registry item.
const LINE_ITEMS = [
  { code: "C100", product: "Amoxicillin 250mg", soh: 860, requested: 1200 },
  { code: "C200", product: "ORS sachet", soh: 550, requested: 900 },
  { code: "C300", product: "Zinc sulfate 20mg", soh: 760, requested: 1500 },
  {
    code: "C400",
    product: "Artemether/Lumefantrine",
    soh: 430,
    requested: 1800,
  },
  { code: "C500", product: "Paracetamol 500mg", soh: 750, requested: 2600 },
]

const FILTERS = [
  { label: "Facility", value: "Kankao Health Facility" },
  { label: "Program", value: "Essential Medicines" },
  { label: "Period", value: "March 2026" },
]

function ApprovalScreen() {
  return (
    <div>
      <OpenLmisBar />

      <div className="flex flex-col gap-3 px-4 pt-3 pb-3">
        <div>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-sm font-semibold tracking-tight whitespace-nowrap">
              Approve Requisition
            </span>
            <Badge variant="secondary">In Approval</Badge>
          </div>
          <p className="mt-0.5 truncate text-3xs text-muted-foreground">
            Kankao Health Facility · Essential Medicines · March 2026 ·
            Submitted 4 Mar 2026 by A. Phiri
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {FILTERS.map((filter) => (
            <span
              key={filter.label}
              className="flex h-6 min-w-0 items-center justify-between gap-1.5 rounded-md border bg-background px-2 text-3xs sm:flex-1"
            >
              <span className="shrink-0 text-muted-foreground">
                {filter.label}
              </span>
              <span className="hidden truncate font-medium sm:inline">
                {filter.value}
              </span>
              <ChevronDownIcon className="size-3 shrink-0 text-muted-foreground" />
            </span>
          ))}
          <span className="hidden h-6 w-28 shrink-0 items-center gap-1.5 rounded-md border bg-background px-2 text-3xs text-muted-foreground sm:flex">
            <SearchIcon className="size-3" />
            Find A Product
          </span>
        </div>

        <div className="min-w-0 overflow-hidden rounded-md border">
          <table className="w-full table-fixed text-2xs">
            <thead className="bg-muted/40 text-3xs text-muted-foreground">
              <tr>
                <th className="px-2.5 py-1.5 text-left font-medium whitespace-nowrap">
                  Product
                </th>
                <th className="hidden w-24 px-2.5 py-1.5 text-right font-medium whitespace-nowrap sm:table-cell">
                  Stock On Hand
                </th>
                <th className="w-20 px-2.5 py-1.5 text-right font-medium whitespace-nowrap">
                  Requested
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {LINE_ITEMS.map((item) => (
                <tr key={item.code}>
                  <td className="truncate px-2.5 py-1.5">
                    <span className="font-medium">{item.product}</span>
                    <span className="ml-1.5 hidden font-mono text-3xs text-muted-foreground sm:inline">
                      {item.code}
                    </span>
                  </td>
                  <td className="hidden px-2.5 py-1.5 text-right tabular-nums sm:table-cell">
                    {item.soh.toLocaleString("en-US")}
                  </td>
                  <td className="px-2.5 py-1.5 text-right font-medium tabular-nums">
                    {item.requested.toLocaleString("en-US")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between border-t px-4 py-2.5">
        <span className="text-3xs text-muted-foreground">
          {LINE_ITEMS.length} full-supply products · Reviewed by A. Banda
        </span>
        <span className="flex gap-1.5">
          <Button size="xs" variant="outline" tabIndex={-1}>
            <XIcon data-icon="inline-start" />
            Reject
          </Button>
          <Button size="xs" tabIndex={-1}>
            <CheckIcon data-icon="inline-start" />
            Approve
          </Button>
        </span>
      </div>
    </div>
  )
}

// The stock summary block's four cards, at phone width.
const STOCK = [
  { label: "On Hand", value: "48,120", share: 72 },
  { label: "Below Min", value: "17", share: 34 },
  { label: "Expiring", value: "2,340", share: 58 },
  { label: "Stockouts", value: "3", share: 18 },
]

function StockScreen() {
  return (
    <div>
      <OpenLmisBar compact />
      <p className="mt-3 text-3xs text-muted-foreground">Essential Medicines</p>
      <p className="mt-0.5 text-sm font-semibold">Stock On Hand</p>

      <div className="mt-3 grid grid-cols-2 gap-2">
        {STOCK.map((tile) => (
          <div
            key={tile.label}
            className="flex flex-col gap-1 rounded-md border bg-card p-2"
          >
            <span className="text-3xs text-muted-foreground">{tile.label}</span>
            <span className="text-sm font-semibold tabular-nums">
              {tile.value}
            </span>
            <span className="block h-1 rounded-full bg-muted">
              <span
                style={{ width: `${tile.share}%` }}
                className="block h-1 rounded-full bg-primary"
              />
            </span>
          </div>
        ))}
      </div>

      <p className="mt-3 text-3xs text-muted-foreground">
        Against Previous Period
      </p>
    </div>
  )
}

// The status pill's lifecycle, one facility per stage.
const REQUISITIONS = [
  { facility: "Kankao HF", status: "Approved", variant: "default" as const },
  {
    facility: "Nandumbo HC",
    status: "In Approval",
    variant: "secondary" as const,
  },
  {
    facility: "Kalembo HC",
    status: "Rejected",
    variant: "destructive" as const,
  },
  { facility: "Balaka DW", status: "Submitted", variant: "secondary" as const },
  { facility: "Mangochi DH", status: "Initiated", variant: "outline" as const },
]

function RequisitionsScreen() {
  return (
    <div>
      <OpenLmisBar compact />
      <p className="mt-3 text-3xs text-muted-foreground">March 2026</p>
      <p className="mt-0.5 text-sm font-semibold">Requisitions</p>

      <div className="mt-3 flex flex-col divide-y">
        {REQUISITIONS.map((requisition) => (
          <div
            key={requisition.facility}
            className="flex items-center justify-between gap-2 py-2"
          >
            <span className="truncate text-2xs font-medium">
              {requisition.facility}
            </span>
            <Badge variant={requisition.variant}>{requisition.status}</Badge>
          </div>
        ))}
      </div>
    </div>
  )
}
