"use client"

import { toJsxRuntime } from "hast-util-to-jsx-runtime"
import { CheckIcon, CodeXmlIcon, CopyIcon } from "lucide-react"
import { useTheme } from "next-themes"
import { posthog } from "posthog-js"
import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type JSX,
} from "react"
import { jsx, jsxs } from "react/jsx-runtime"
import {
  codeToHast,
  type BundledLanguage,
  type BundledTheme,
} from "shiki/bundle/web"

import { ReactIcon } from "@/components/icons"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  TreeExpander,
  TreeIcon,
  TreeLabel,
  TreeNode,
  TreeNodeContent,
  TreeNodeTrigger,
  TreeProvider,
  TreeView,
} from "@/components/ui/tree"
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard"
import type { RegistryFile } from "@/lib/types"
import { cn } from "@/lib/utils"

const DEFAULT_FILE_NAME = "page.tsx"

const SHIKI_THEMES: Record<string, BundledTheme> = {
  dark: "github-dark",
  light: "github-light",
}

// The folder each file type is shown under, mirroring where `shadcn add` writes it.
const FILE_TREE_FOLDERS = [
  { id: "app", label: "app", fileType: "page" },
  { id: "components", label: "components", fileType: "component" },
  { id: "hooks", label: "hooks", fileType: "hook" },
  { id: "lib", label: "lib", fileType: "lib" },
] as const

async function getHighlighted(
  code: string,
  theme: string,
  lang: BundledLanguage
): Promise<JSX.Element> {
  if (!code.trim()) return <pre>{"// No code"}</pre>

  try {
    const hast = await codeToHast(code, {
      lang,
      theme: SHIKI_THEMES[theme] ?? SHIKI_THEMES.light,
    })
    return toJsxRuntime(hast, { Fragment, jsx, jsxs }) as JSX.Element
  } catch {
    return <pre>{"// Failed to highlight"}</pre>
  }
}

export function CodeBlock({
  code,
  lang = "tsx",
  className,
}: {
  code: string
  lang?: BundledLanguage
  className?: string
}) {
  const { resolvedTheme = "light" } = useTheme()
  const [highlighted, setHighlighted] = useState<JSX.Element | null>(null)

  useEffect(() => {
    let cancelled = false

    async function highlight() {
      const element = await getHighlighted(code, resolvedTheme, lang)
      if (!cancelled) setHighlighted(element)
    }

    void highlight()

    return () => {
      cancelled = true
    }
  }, [code, resolvedTheme, lang])

  return (
    <div
      className={cn(
        "[&_code]:font-mono [&_code]:text-sm [&_code]:whitespace-pre",
        "[&_pre]:h-full [&_pre]:overflow-auto [&_pre]:bg-transparent! [&_pre]:p-4 [&_pre]:leading-relaxed",
        className
      )}
    >
      {/* Show the plain source until Shiki resolves, so the panel is never blank. */}
      {highlighted ?? (
        <pre>
          <code>{code}</code>
        </pre>
      )}
    </div>
  )
}

// Icon-only copy, for panels whose header has no room for a label.
export function CopyButton({
  text,
  label = "Copy to clipboard",
  className,
  onCopied,
}: {
  text: string
  label?: string
  className?: string
  onCopied?: () => void
}) {
  const { copied, copy } = useCopyToClipboard()

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      disabled={!text}
      aria-label={copied ? "Copied" : label}
      className={className}
      onClick={async () => {
        if (await copy(text)) onCopied?.()
      }}
    >
      {copied ? (
        <CheckIcon aria-hidden="true" />
      ) : (
        <CopyIcon aria-hidden="true" />
      )}
    </Button>
  )
}

function CopyCodeButton({
  text,
  onCopied,
}: {
  text: string
  onCopied: () => void
}) {
  const { copied, copy } = useCopyToClipboard()

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              type="button"
              size="sm"
              disabled={!text}
              aria-label={copied ? "Copied" : "Copy source to clipboard"}
              onClick={async () => {
                if (await copy(text)) onCopied()
              }}
            />
          }
        >
          {copied ? (
            <CheckIcon data-icon="inline-start" aria-hidden="true" />
          ) : (
            <CopyIcon data-icon="inline-start" aria-hidden="true" />
          )}
          {copied ? "Copied" : "Copy"}
        </TooltipTrigger>
        <TooltipContent side="left">
          {copied ? "Copied!" : "Copy source to clipboard"}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

function FileTreeFolder({
  id,
  label,
  files,
}: {
  id: string
  label: string
  files: RegistryFile[]
}) {
  if (files.length === 0) return null

  return (
    <TreeNode nodeId={id}>
      <TreeNodeTrigger>
        <TreeExpander hasChildren />
        <TreeIcon hasChildren />
        <TreeLabel>{label}</TreeLabel>
      </TreeNodeTrigger>
      <TreeNodeContent hasChildren>
        {files.map((file) => (
          <TreeNode key={file.name} level={1} nodeId={file.name}>
            <TreeNodeTrigger>
              <TreeExpander />
              <TreeIcon icon={<ReactIcon />} />
              <TreeLabel>{file.name}</TreeLabel>
            </TreeNodeTrigger>
          </TreeNode>
        ))}
      </TreeNodeContent>
    </TreeNode>
  )
}

export function BlockCodeView({
  name,
  files,
}: {
  name: string
  files: RegistryFile[]
}) {
  const defaultFile = useMemo(
    () => files.find((file) => file.name === DEFAULT_FILE_NAME) ?? files[0],
    [files]
  )

  const [selectedIds, setSelectedIds] = useState<string[]>(() =>
    defaultFile ? [defaultFile.name] : []
  )
  const [currentFile, setCurrentFile] = useState<RegistryFile | undefined>(
    defaultFile
  )

  const filesByType = useMemo(() => {
    const grouped: Record<string, RegistryFile[]> = {
      page: defaultFile ? [defaultFile] : [],
      component: [],
      hook: [],
      lib: [],
    }

    for (const file of files) {
      if (file.name === defaultFile?.name) continue
      grouped[file.type]?.push(file)
    }

    return grouped
  }, [files, defaultFile])

  const defaultExpandedIds = useMemo(
    () =>
      FILE_TREE_FOLDERS.filter(
        ({ fileType }) => (filesByType[fileType]?.length ?? 0) > 0
      ).map(({ id }) => id),
    [filesByType]
  )

  // Remounts the tree when the item changes, so expansion state does not leak between blocks.
  const treeKey = useMemo(
    () => files.map((file) => `${file.type}:${file.name}`).join("|"),
    [files]
  )

  const handleSelectionChange = useCallback(
    (ids: string[]) => {
      const firstId = ids[0]
      // Folder rows have no extension; clicking one should expand, not blank the panel.
      if (!firstId?.includes(".")) return

      const file = files.find((item) => item.name === firstId)
      if (!file) return

      setSelectedIds(ids)
      setCurrentFile(file)
    },
    [files]
  )

  if (files.length === 0) {
    return (
      <Empty className="h-(--code-height)">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <CodeXmlIcon aria-hidden="true" />
          </EmptyMedia>
          <EmptyTitle>Code not available</EmptyTitle>
          <EmptyDescription>
            The source for this item could not be loaded.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <div className="flex h-(--code-height)">
      <aside className="w-64 shrink-0 overflow-auto">
        <TreeProvider
          key={treeKey}
          defaultExpandedIds={defaultExpandedIds}
          selectedIds={selectedIds}
          onSelectionChange={handleSelectionChange}
        >
          <TreeView>
            {FILE_TREE_FOLDERS.map(({ id, label, fileType }) => (
              <FileTreeFolder
                key={id}
                id={id}
                label={label}
                files={filesByType[fileType] ?? []}
              />
            ))}
          </TreeView>
        </TreeProvider>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col border-l">
        <header className="flex h-10 shrink-0 items-center gap-2 border-b px-2">
          {/* The install path, so a reader knows where `shadcn add` puts this file. */}
          <p className="truncate font-mono text-xs text-muted-foreground">
            {currentFile?.target ?? currentFile?.name}
          </p>
          <div className="ml-auto">
            <CopyCodeButton
              text={currentFile?.code ?? ""}
              onCopied={() =>
                posthog.capture("source_copied", {
                  item: name,
                  file: currentFile?.target ?? currentFile?.name,
                })
              }
            />
          </div>
        </header>

        <CodeBlock
          key={currentFile?.name ?? "no-file"}
          code={currentFile?.code ?? ""}
          lang={currentFile?.lang ?? "tsx"}
          className="min-h-0 flex-1 overflow-auto"
        />
      </main>
    </div>
  )
}
