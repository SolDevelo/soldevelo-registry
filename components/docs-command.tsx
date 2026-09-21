"use client"

import type { BundledLanguage } from "shiki/bundle/web"

import { CodeBlock, CopyButton } from "@/components/block-code-view"
import { usePackageManager } from "@/components/package-manager-picker"
import { PACKAGE_RUNNERS } from "@/lib/package-managers"
import { cn } from "@/lib/utils"

export function CodePanel({
  fileName,
  code,
  lang = "bash",
  className,
}: {
  fileName: string
  code: string
  lang?: BundledLanguage
  className?: string
}) {
  return (
    <div className={cn("overflow-hidden rounded-lg border bg-card", className)}>
      <header className="flex h-10 items-center gap-2 border-b bg-muted/40 pr-1.5 pl-3">
        <p className="font-mono text-xs text-muted-foreground">{fileName}</p>
        <CopyButton
          text={code}
          label={`Copy ${fileName} to clipboard`}
          className="ml-auto"
        />
      </header>
      <CodeBlock
        className="max-w-full overflow-x-auto"
        code={code}
        lang={lang}
      />
    </div>
  )
}

// `lines` are everything after the runner, so one source renders as pnpm dlx, npx,
// yarn dlx or bunx depending on what the reader picked.
export function DocsCommand({
  lines,
  className,
}: {
  lines: string | string[]
  className?: string
}) {
  const [packageManager] = usePackageManager()
  const runner = PACKAGE_RUNNERS[packageManager]
  const code = (Array.isArray(lines) ? lines : [lines])
    .map((line) => `${runner} ${line}`)
    .join("\n")

  return <CodePanel fileName="Terminal" code={code} className={className} />
}
