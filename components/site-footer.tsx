"use client"

import Link from "next/link"
import { MotionConfig, motion, type Variants } from "motion/react"

import {
  GitHubIcon,
  LinkedInIcon,
  XIcon,
  YouTubeIcon,
} from "@/components/icons"
import { FooterThemeToggle } from "@/components/footer-theme-toggle"
import { Logo } from "@/components/logo"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import type { Project } from "@/config/projects"
import { siteConfig } from "@/config/site"

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

type FooterLink = { label: string; href: string; external?: boolean }

const SOCIAL_LINKS = [
  {
    label: `${siteConfig.NAME} on GitHub`,
    href: siteConfig.REPO,
    Icon: GitHubIcon,
  },
  {
    label: `${siteConfig.AUTHORS[0].NAME} on X`,
    href: siteConfig.SOCIALS.X,
    Icon: XIcon,
  },
  {
    label: `${siteConfig.AUTHORS[0].NAME} on LinkedIn`,
    href: siteConfig.SOCIALS.LINKEDIN,
    Icon: LinkedInIcon,
  },
  {
    label: `${siteConfig.AUTHORS[0].NAME} on YouTube`,
    href: siteConfig.SOCIALS.YOUTUBE,
    Icon: YouTubeIcon,
  },
]

const COLUMNS: { title: string; links: FooterLink[] }[] = [
  {
    title: "Catalog",
    links: [
      { label: "Components", href: "/components" },
      { label: "Blocks", href: "/blocks" },
      { label: "Templates", href: "/templates" },
    ],
  },
  {
    title: "Docs",
    links: [
      { label: "Getting Started", href: "/docs" },
      { label: "Setup", href: "/docs#setup" },
      { label: "Item Names", href: "/docs#naming" },
      { label: "Theme Tokens", href: "/docs#theme-tokens" },
      { label: "Changelog", href: "/changelog" },
    ],
  },
  {
    title: "Machine Readable",
    links: [
      { label: "llms.txt", href: "/llms.txt", external: true },
      { label: "registry.json", href: "/r/registry.json", external: true },
      {
        label: "REGISTRY.md",
        href: `${siteConfig.REPO}/blob/main/REGISTRY.md`,
        external: true,
      },
    ],
  },
]

export function SiteFooter({ projects }: { projects: Project[] }) {
  const columns = [
    ...COLUMNS,
    {
      title: "Projects",
      links: projects.map((project) => ({
        label: project.name,
        href: project.url,
        external: true,
      })),
    },
  ]

  return (
    <MotionConfig reducedMotion="user">
      <div className="w-full">
        <Separator />
        <motion.footer
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.07 } },
          }}
          className="mx-auto w-full max-w-5xl px-4 py-14"
        >
          <div className="flex flex-col gap-10 md:flex-row md:gap-16">
            <motion.div variants={blurRise} className="md:w-64 md:shrink-0">
              <Link href="/" aria-label={`${siteConfig.NAME} home`}>
                <Logo />
              </Link>
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
                {siteConfig.SHORT_DESCRIPTION}
              </p>
              <div className="mt-6">
                <FooterThemeToggle />
              </div>
            </motion.div>

            <motion.div variants={blurRise} className="flex-1">
              <div className="hidden gap-8 sm:grid sm:grid-cols-2 lg:grid-cols-4">
                {columns.map((column) => (
                  <nav
                    key={column.title}
                    aria-label={column.title}
                    className="flex flex-col gap-3"
                  >
                    <h3 className="font-heading text-xs font-medium tracking-label text-muted-foreground uppercase">
                      {column.title}
                    </h3>
                    <ul className="flex flex-col gap-2.5">
                      {column.links.map((link) => (
                        <li key={link.label}>
                          <FooterAnchor link={link} />
                        </li>
                      ))}
                    </ul>
                  </nav>
                ))}
              </div>

              {/* One column per accordion row below sm, where four columns will not fit. */}
              <Accordion className="sm:hidden" multiple>
                {columns.map((column) => (
                  <AccordionItem key={column.title} value={column.title}>
                    <AccordionTrigger>
                      <span className="text-xs font-medium tracking-label uppercase">
                        {column.title}
                      </span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul className="flex flex-col gap-2.5 pb-1">
                        {column.links.map((link) => (
                          <li key={link.label}>
                            <FooterAnchor link={link} />
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </motion.div>
          </div>
        </motion.footer>

        <Separator />
        <div className="mx-auto w-full max-w-5xl px-4 py-5">
          <div className="flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-center gap-2">
              Built by
              <a
                href={siteConfig.AUTHORS[0].URL}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-sm transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none"
              >
                <Logo alt={siteConfig.AUTHORS[0].NAME} className="h-4" />
              </a>
            </p>

            <div className="flex items-center gap-0.5">
              {SOCIAL_LINKS.map(({ label, href, Icon }) => (
                <Button
                  key={label}
                  variant="ghost"
                  size="icon-sm"
                  nativeButton={false}
                  className="text-muted-foreground hover:text-foreground"
                  render={
                    <a
                      href={href}
                      aria-label={label}
                      target="_blank"
                      rel="noopener noreferrer"
                    />
                  }
                >
                  <Icon className="size-4" aria-hidden="true" />
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </MotionConfig>
  )
}

function FooterAnchor({ link }: { link: FooterLink }) {
  const className =
    "text-sm text-foreground/80 transition-colors hover:text-foreground"

  if (link.external) {
    return (
      <a
        href={link.href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {link.label}
      </a>
    )
  }

  return (
    <Link href={link.href} className={className}>
      {link.label}
    </Link>
  )
}
