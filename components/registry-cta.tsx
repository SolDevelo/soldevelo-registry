"use client"

import * as React from "react"
import { CheckIcon, GitCommitIcon, StarIcon, TerminalIcon } from "lucide-react"
import {
  motion,
  useInView,
  useReducedMotion,
  type Variants,
} from "motion/react"

import { GitHubIcon } from "@/components/icons"
import { SectionEyebrow } from "@/components/section-eyebrow"
import { Button } from "@/components/ui/button"
import { registryAddress, siteConfig } from "@/config/site"
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

export function RegistryCta({ exampleItem }: { exampleItem: string }) {
  const reduce = useReducedMotion()

  return (
    <section className="relative flex w-full items-center justify-center">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 h-72 w-full max-w-3xl -translate-x-1/2 -translate-y-1/2 bg-brand-glow"
      />

      <div aria-hidden="true" className="absolute inset-0 hidden lg:block">
        <FloatingCard
          className="top-0 left-0"
          duration={7}
          delay={0}
          reduce={reduce}
        >
          <InstallCard item={exampleItem} />
        </FloatingCard>
        <FloatingCard
          className="top-0 right-0"
          duration={7.6}
          delay={0.3}
          reduce={reduce}
        >
          <CommitCard />
        </FloatingCard>
        <FloatingCard
          className="bottom-0 left-6"
          duration={6.6}
          delay={0.5}
          reduce={reduce}
        >
          <MergedCard />
        </FloatingCard>
        <FloatingCard
          className="right-0 bottom-0"
          duration={7.2}
          delay={0.7}
          reduce={reduce}
        >
          <StarredCard />
        </FloatingCard>
      </div>

      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.6 }}
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: 0.08 } },
        }}
        className="relative z-10 mx-auto flex max-w-lg flex-col items-center gap-4 text-center"
      >
        <motion.div variants={blurRise}>
          <SectionEyebrow
            mark={<GitHubIcon className="size-4" aria-hidden="true" />}
            lead="Open Source,"
            emphasis="Built In The Open"
          />
        </motion.div>

        <motion.h2
          variants={blurRise}
          className="font-heading text-3xl font-medium tracking-tighter text-balance sm:text-4xl"
        >
          Open Source, By Design
        </motion.h2>

        <motion.p
          variants={blurRise}
          className="text-pretty text-muted-foreground"
        >
          Every item is readable source you copy into your own repository. Read
          it, edit it, or send a pull request and add your own.
        </motion.p>

        <motion.div variants={blurRise} className="mt-4">
          <Button
            size="xl"
            nativeButton={false}
            render={
              <a
                href={siteConfig.REPO}
                aria-label={`${siteConfig.NAME} on GitHub`}
                target="_blank"
                rel="noopener noreferrer"
              />
            }
          >
            <GitHubIcon data-icon="inline-start" aria-hidden="true" />
            View On GitHub
          </Button>
        </motion.div>
      </motion.div>
    </section>
  )
}

function FloatingCard({
  className,
  duration,
  delay,
  reduce,
  children,
}: {
  className?: string
  duration: number
  delay: number
  reduce: boolean | null
  children: React.ReactNode
}) {
  // The ambient float pauses off-screen rather than animating forever.
  const ambientRef = React.useRef<HTMLDivElement>(null)
  const ambientInView = useInView(ambientRef, { amount: 0.2 })

  return (
    <motion.div
      ref={ambientRef}
      className={cn("absolute", className)}
      initial={{ opacity: 0, y: 18, filter: "blur(8px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.5 }}
      transition={reduce ? { duration: 0 } : { duration: 0.6, ease, delay }}
    >
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={
          reduce
            ? undefined
            : {
                duration,
                repeat: ambientInView ? Number.POSITIVE_INFINITY : 0,
                ease: "easeInOut",
                delay,
              }
        }
        className="transform-gpu will-change-transform"
      >
        {children}
      </motion.div>
    </motion.div>
  )
}

function InstallCard({ item }: { item: string }) {
  return (
    <div className="w-56 rounded-lg border bg-card p-3 shadow-lg">
      <div className="flex items-center gap-2">
        <TerminalIcon className="size-3.5 text-muted-foreground" />
        <span className="text-xs font-medium">Terminal</span>
      </div>
      <p className="mt-2 truncate font-mono text-3xs text-muted-foreground">
        shadcn add {registryAddress(item)}
      </p>
    </div>
  )
}

function CommitCard() {
  return (
    <div className="w-56 rounded-lg border bg-card p-3 shadow-lg">
      <div className="flex items-center gap-2">
        <span className="grid size-6 shrink-0 place-items-center rounded-full bg-muted text-3xs font-medium">
          AB
        </span>
        <span className="text-xs font-medium">A. Banda</span>
      </div>
      <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
        <GitCommitIcon className="size-3.5 shrink-0" aria-hidden="true" />
        <span className="truncate">
          pushed{" "}
          <span className="font-medium text-foreground">
            feat: add stock-summary
          </span>
        </span>
      </div>
    </div>
  )
}

function StarredCard() {
  return (
    <div className="flex w-56 items-center gap-3 rounded-lg border bg-card p-3 shadow-lg">
      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-warning/10">
        <StarIcon className="size-4 text-warning" aria-hidden="true" />
      </span>
      <div>
        <p className="text-xs font-semibold">Forked and shipped</p>
        <p className="text-3xs text-muted-foreground">
          Source lives in your repo
        </p>
      </div>
    </div>
  )
}

function MergedCard() {
  return (
    <div className="flex w-56 items-center gap-3 rounded-lg border bg-card p-3 shadow-lg">
      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-success/10">
        <CheckIcon className="size-4 text-success" aria-hidden="true" />
      </span>
      <div>
        <p className="text-xs font-semibold">Pull request merged</p>
        <p className="text-3xs text-muted-foreground">
          New block added to the catalog
        </p>
      </div>
    </div>
  )
}
