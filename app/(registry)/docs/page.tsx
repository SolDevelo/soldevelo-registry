import Link from "next/link"
import { TriangleAlertIcon } from "lucide-react"

import { CodePanel, DocsCommand } from "@/components/docs-command"
import { PackageManagerPicker } from "@/components/package-manager-picker"
import { DocsToc, type TocItem } from "@/components/docs-toc"
import { LogoMark } from "@/components/logo"
import { Mono } from "@/components/mono"
import { JsonLd, breadcrumbSchema } from "@/components/structured-data"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { itemSlug, PROJECTS } from "@/config/projects"
import { registryAddress, siteConfig } from "@/config/site"
import { createMetadata } from "@/lib/metadata"
import { getCounts, getEntriesByKind, getProjects } from "@/lib/registry-data"
import { KIND_LABEL, KIND_PLURAL, REGISTRY_KINDS } from "@/lib/registry-kinds"
import { cn } from "@/lib/utils"

const DESCRIPTION =
  "Install components, blocks and page templates from this registry with the shadcn CLI: what you need, how to register the namespace, where each kind lands in your project, and how to point a coding agent at the catalog."

export const metadata = createMetadata({
  title: "Docs",
  description: DESCRIPTION,
  canonicalUrl: "docs",
  keywords: [
    "shadcn registry setup",
    "shadcn cli install",
    "shadcn registry",
    "open source UI blocks",
  ],
})

const TOC: TocItem[] = [
  { id: "requirements", label: "Requirements" },
  { id: "setup", label: "Setup" },
  { id: "installing", label: "Installing An Item" },
  { id: "naming", label: "Item Names" },
  { id: "where-files-land", label: "Where Files Land" },
  { id: "theme-tokens", label: "Theme Tokens" },
  { id: "agents", label: "Agents And MCP" },
  { id: "troubleshooting", label: "Troubleshooting" },
]

// Where each kind installs, mirroring lib/registry-targets.ts.
const INSTALL_TARGETS: Record<(typeof REGISTRY_KINDS)[number], string> = {
  component: "components/{project}/{item}.tsx",
  block: "components/blocks/{project}/{item}.tsx",
  template: "app/{item}/page.tsx + components/{project}/{item}/*",
}

// The clients `shadcn mcp init` supports. Codex is the odd one out: the CLI prints
// the TOML block for you to paste rather than writing the file itself.
const MCP_CLIENTS = [
  { id: "claude", label: "Claude Code", file: ".mcp.json", writes: true },
  { id: "cursor", label: "Cursor", file: ".cursor/mcp.json", writes: true },
  { id: "vscode", label: "VS Code", file: ".vscode/mcp.json", writes: true },
  { id: "codex", label: "Codex", file: "~/.codex/config.toml", writes: false },
] as const

const TROUBLESHOOTING = [
  {
    problem: "The CLI cannot resolve the item",
    fix: `Check that "@${siteConfig.SLUG}" is in the registries object of the components.json in the directory you are running from, and that the item name matches the one on its page.`,
  },
  {
    problem: "A primitive rejects the render prop",
    fix: "Your project is on a legacy new-york or radix-* style, which installs Radix. Items here are built on Base UI, which takes render where Radix takes asChild.",
  },
  {
    problem: "Colours look off after installing",
    fix: "The item uses a state token your theme does not define yet. Tokens ship with the item and are applied additively, so re-run the install, or copy the success, warning and info variables from the theme section above.",
  },
]

function Section({
  id,
  title,
  action,
  children,
  className,
}: React.PropsWithChildren<{
  id: string
  title: string
  action?: React.ReactNode
  className?: string
}>) {
  return (
    <section
      aria-labelledby={`${id}-heading`}
      className={cn("flex flex-col gap-4 border-t pt-10", className)}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2
          id={id}
          className="scroll-mt-28 font-heading text-xl font-medium tracking-tight"
        >
          <span id={`${id}-heading`}>{title}</span>
        </h2>
        {action}
      </div>
      {children}
    </section>
  )
}

// A grey chip on a red panel reads as pasted in, so it picks up its surroundings.
function Warn({ children }: { children: React.ReactNode }) {
  return <Mono className="bg-destructive/10">{children}</Mono>
}

function Prose({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-sm leading-relaxed text-pretty text-muted-foreground">
      {children}
    </p>
  )
}

export default function DocsPage() {
  const counts = getCounts()
  const projects = getProjects()
    .map((id) => PROJECTS[id])
    .filter((project) => project !== undefined)
  // Derived so the examples can never name an item that has been renamed away.
  const components = getEntriesByKind("component")
  const exampleEntry =
    components.find((entry) => entry.name === "openlmis-status-badge") ??
    components[0]
  const example = exampleEntry?.name ?? "openlmis-status-badge"
  const exampleProject = exampleEntry?.project ?? "openlmis"
  const exampleSlug = itemSlug(example, exampleProject)
  const exampleComponent = exampleSlug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("")
  // Where the CLI writes the item's main file, without the extension, as an import path.
  const exampleImport = (
    exampleEntry?.files.find((file) => file.target)?.target ??
    `components/${exampleProject}/${exampleSlug}.tsx`
  ).replace(/\.tsx?$/, "")
  const exampleUsage =
    example === "openlmis-status-badge"
      ? `<${exampleComponent} tone="success">Active</${exampleComponent}>`
      : `<${exampleComponent} />`

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", url: siteConfig.URL },
          { name: "Docs", url: `${siteConfig.URL}/docs` },
        ])}
      />

      <div className="pt-14 sm:pt-20">
        <header className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="flex items-center gap-3 font-heading text-3xl leading-tight font-semibold tracking-tighter text-balance sm:text-4xl">
              {/* Decorative: the heading text alone is what a screen reader should announce. */}
              <LogoMark className="size-8 shrink-0 sm:size-9" />
              Install An Item In One Command
            </h1>
            {/* Sets the runner every command on this page renders with. */}
            <PackageManagerPicker />
          </div>
          <p className="max-w-2xl text-pretty text-muted-foreground">
            {DESCRIPTION}
          </p>
        </header>

        <div className="mt-10 grid gap-x-12 gap-y-10 lg:grid-cols-docs lg:items-start">
          <div className="flex min-w-0 flex-col gap-10">
            <Section
              id="requirements"
              title="Requirements"
              className="border-t-0 pt-0"
            >
              <Prose>
                Any React project with the shadcn CLI configured works. Run the
                commands from the directory that holds{" "}
                <Mono>components.json</Mono>, including inside a monorepo.
              </Prose>
              <ul className="flex list-disc flex-col gap-1.5 pl-5 text-sm text-muted-foreground">
                <li>React 19 and Tailwind CSS v4.</li>
                <li>
                  A shadcn project. If there is not one yet, initialise it
                  first.
                </li>
                <li>
                  A <Mono>base-*</Mono> style in <Mono>components.json</Mono>,
                  which is the <Mono>shadcn init</Mono> default.
                </li>
              </ul>
              <DocsCommand lines="shadcn@latest init" />

              <Alert variant="destructive">
                <TriangleAlertIcon />
                <AlertTitle>Items are built on Base UI</AlertTitle>
                <AlertDescription>
                  <p>
                    The legacy <Warn>new-york</Warn> and <Warn>radix-*</Warn>{" "}
                    styles install Radix primitives, which reject the{" "}
                    <Warn>render</Warn> prop these items use. Changing the style
                    in <Warn>components.json</Warn> does not migrate primitives
                    you already have, so check an existing project before
                    installing.
                  </p>
                </AlertDescription>
              </Alert>
            </Section>

            <Section id="setup" title="Setup">
              <Prose>
                Register the namespace once. Merge this into the{" "}
                <Mono>registries</Mono> object of your{" "}
                <Mono>components.json</Mono>, keeping your other settings.
              </Prose>
              <CodePanel
                fileName="components.json"
                lang="json"
                code={`{
  "registries": {
    "@${siteConfig.SLUG}": "${siteConfig.URL}/r/{name}.json"
  }
}`}
              />
            </Section>

            <Section id="installing" title="Installing An Item">
              <Prose>
                Add any item by name. Every item page carries its own command,
                and the picker above switches the runner.
              </Prose>
              <DocsCommand
                lines={`shadcn@latest add ${registryAddress(example)}`}
              />
              <Prose>
                The CLI installs the shadcn primitives and npm packages the item
                declares, then writes its source into your repository. Pass{" "}
                <Mono>--dry-run</Mono> to see the files it would write first.
                Import it like any other component:
              </Prose>
              <CodePanel
                fileName="app/page.tsx"
                lang="tsx"
                code={`import { ${exampleComponent} } from "@/${exampleImport}"

export default function Page() {
  return ${exampleUsage}
}`}
              />
              <Prose>
                Installing copies source; it does not add the item to a page for
                you.
              </Prose>
            </Section>

            <Section id="naming" title="Item Names">
              <Prose>
                Every item is prefixed with the project it belongs to, so two
                projects can ship a <Mono>stock-summary</Mono> without
                colliding. The prefix is not only a convention: each item
                declares its project in <Mono>meta.project</Mono>, and the build
                rejects a name that disagrees with it.
              </Prose>
              <ul className="flex list-disc flex-col gap-1.5 pl-5 text-sm text-muted-foreground">
                {projects.map((project) => (
                  <li key={project.id}>
                    <a
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline underline-offset-4 hover:text-foreground"
                    >
                      {project.name}
                    </a>{" "}
                    items are named <Mono>{project.id}-&#123;item&#125;</Mono>.
                  </li>
                ))}
              </ul>
            </Section>

            <Section id="where-files-land" title="Where Files Land">
              <Prose>
                Every published file carries an explicit install target, so
                items never overwrite each other.
              </Prose>
              <div className="overflow-x-auto rounded-lg border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/40 text-left">
                      <th className="px-4 py-2.5 font-medium">Kind</th>
                      <th className="px-4 py-2.5 font-medium">Installs to</th>
                      <th className="px-4 py-2.5 text-right font-medium">
                        Published
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {REGISTRY_KINDS.map((kind) => (
                      <tr key={kind} className="border-b last:border-b-0">
                        <td className="px-4 py-2.5">
                          <Link
                            href={`/${KIND_PLURAL[kind]}`}
                            className="underline underline-offset-4 hover:text-foreground"
                          >
                            {KIND_LABEL[kind]}
                          </Link>
                        </td>
                        <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">
                          {INSTALL_TARGETS[kind]}
                        </td>
                        <td className="px-4 py-2.5 text-right tabular-nums">
                          {counts[kind]}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Prose>
                A template owns its sections by value: installing one writes the
                route plus editable copies of every section it is built from, so
                nothing stays hidden behind a package.
              </Prose>
            </Section>

            <Section id="theme-tokens" title="Theme Tokens">
              <Prose>
                Items use semantic tokens rather than raw colours, so they pick
                up your palette. Beyond the shadcn defaults this registry adds{" "}
                <Mono>success</Mono>, <Mono>warning</Mono> and <Mono>info</Mono>
                , each with a matching <Mono>-foreground</Mono>. An item that
                uses one ships it as a CSS variable, applied additively, so
                installing fills the gap without overwriting what your theme
                already defines.
              </Prose>
              <CodePanel
                fileName="app/globals.css"
                lang="css"
                code={`:root {
  --success: oklch(0.596 0.145 163.225);
  --success-foreground: oklch(0.985 0 0);
  --warning: oklch(0.666 0.179 58.318);
  --warning-foreground: oklch(0.985 0 0);
  --info: oklch(0.55 0.13 237);
  --info-foreground: oklch(0.985 0 0);
}`}
              />
            </Section>

            <Section id="agents" title="Agents And MCP">
              <Prose>
                The shadcn MCP server reads the registries declared in{" "}
                <Mono>components.json</Mono>, so once the namespace is
                registered an agent can search and install from this catalog
                directly. Pick your client and run its setup command.
              </Prose>

              <Tabs defaultValue="claude">
                <TabsList aria-label="Coding agent">
                  {MCP_CLIENTS.map((client) => (
                    <TabsTrigger key={client.id} value={client.id}>
                      {client.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {MCP_CLIENTS.map((client) => (
                  <TabsContent
                    key={client.id}
                    value={client.id}
                    className="flex flex-col gap-3 pt-3"
                  >
                    <DocsCommand
                      lines={`shadcn@latest mcp init --client ${client.id}`}
                    />
                    <Prose>
                      {client.writes ? (
                        <>
                          Writes the server config to <Mono>{client.file}</Mono>
                          .
                        </>
                      ) : (
                        <>
                          Prints a TOML block to paste into{" "}
                          <Mono>{client.file}</Mono> yourself.
                        </>
                      )}{" "}
                      Restart the client, then ask it for an item by
                      description.
                    </Prose>
                  </TabsContent>
                ))}
              </Tabs>

              <Prose>
                The same catalog is readable from the CLI, without installing
                anything:
              </Prose>
              <DocsCommand
                lines={[
                  `shadcn@latest search @${siteConfig.SLUG} -q "stock"`,
                  `shadcn@latest view ${registryAddress(example)}`,
                ]}
              />
              <Prose>
                <a
                  href={`${siteConfig.URL}/llms.txt`}
                  className="underline underline-offset-4 hover:text-foreground"
                >
                  llms.txt
                </a>{" "}
                summarises the whole catalog for crawlers and agents, and is
                regenerated from the registry on every build. Item JSON lives at{" "}
                <Mono>/r/&#123;item-name&#125;.json</Mono>, the index at{" "}
                <Mono>/r/registry.json</Mono>, so anything that can read JSON
                can consume this registry without the CLI.
              </Prose>
            </Section>

            <Section id="troubleshooting" title="Troubleshooting">
              <dl className="flex flex-col gap-4">
                {TROUBLESHOOTING.map((entry) => (
                  <div key={entry.problem} className="flex flex-col gap-1">
                    <dt className="text-sm font-medium">{entry.problem}</dt>
                    <dd className="text-sm leading-relaxed text-pretty text-muted-foreground">
                      {entry.fix}
                    </dd>
                  </div>
                ))}
              </dl>
              <Separator className="my-2" />
              <Prose>
                Still stuck? Open an issue on{" "}
                <a
                  href={siteConfig.REPO}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-4 hover:text-foreground"
                >
                  GitHub
                </a>
                . The registry and this site are open source.
              </Prose>
            </Section>
          </div>

          <DocsToc items={TOC} className="sticky top-28 hidden lg:block" />
        </div>
      </div>
    </>
  )
}
