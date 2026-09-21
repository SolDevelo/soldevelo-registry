"use client"

import { CodeIcon, EyeIcon } from "lucide-react"
import dynamic from "next/dynamic"
import * as React from "react"
import {
  Group as PanelGroup,
  Panel,
  Separator as PanelResizeHandle,
} from "react-resizable-panels"

import {
  InstallCommandButton,
  OpenInNewTabButton,
  RefreshButton,
} from "@/components/block-actions"
import { BlockLoader } from "@/components/block-loader"
import { Button } from "@/components/ui/button"
import { useIsMobile } from "@/hooks/use-mobile"
import { useIsMounted } from "@/hooks/use-is-mounted"
import { useOptimizedIframe } from "@/hooks/use-optimized-iframe"
import type { RegistryFile, RendererMode } from "@/lib/types"
import { cn } from "@/lib/utils"

const BlockCodeView = dynamic(
  () => import("@/components/block-code-view").then((m) => m.BlockCodeView),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-(--block-height) items-center justify-center">
        <BlockLoader />
      </div>
    ),
  }
)

const DEFAULT_PANEL_SIZE = 100
const MIN_PANEL_SIZE = 30

type BlockRendererProps = {
  name: string
  height: string
  files: RegistryFile[]
  // Load on mount rather than waiting for the card to scroll into view.
  priority?: boolean
}

function ToggleRendererMode({
  rendererMode,
  setRendererMode,
}: {
  rendererMode: RendererMode
  setRendererMode: (mode: RendererMode) => void
}) {
  return (
    <div
      className="flex items-center gap-1"
      role="group"
      aria-label="View mode"
    >
      <Button
        type="button"
        variant={rendererMode === "preview" ? "outline" : "ghost"}
        size="icon-sm"
        aria-pressed={rendererMode === "preview"}
        aria-label="Preview"
        onClick={() => setRendererMode("preview")}
      >
        <EyeIcon className="size-3.5" aria-hidden="true" />
      </Button>
      <Button
        type="button"
        variant={rendererMode === "code" ? "outline" : "ghost"}
        size="icon-sm"
        aria-pressed={rendererMode === "code"}
        aria-label="Code"
        onClick={() => setRendererMode("code")}
      >
        <CodeIcon className="size-3.5" aria-hidden="true" />
      </Button>
    </div>
  )
}

export function BlockRenderer({
  name,
  height,
  files,
  priority = false,
}: BlockRendererProps) {
  const [rendererMode, setRendererMode] =
    React.useState<RendererMode>("preview")
  const iframeContainerRef = React.useRef<HTMLDivElement>(null)
  const isMounted = useIsMounted()
  const isMobile = useIsMobile()

  const previewUrl = `/preview/${name}`
  const isCodeMode = rendererMode === "code"

  const {
    setIframeNode,
    shouldLoadIframe,
    loaded,
    onIframeLoad,
    onRefreshIframe,
    isRefreshing,
  } = useOptimizedIframe({
    previewUrl,
    containerRef: iframeContainerRef,
    eager: priority,
  })

  return (
    <div
      data-testid={`block-renderer-${name}`}
      className="relative flex min-w-0 flex-col rounded-lg border bg-muted/50"
      style={{ "--block-height": height } as React.CSSProperties}
    >
      <div className="flex items-stretch justify-between p-0.5">
        <ToggleRendererMode
          rendererMode={rendererMode}
          setRendererMode={setRendererMode}
        />

        <div className="flex items-center gap-1">
          <RefreshButton
            onRefresh={onRefreshIframe}
            isRefreshing={isRefreshing}
          />
          <OpenInNewTabButton previewUrl={previewUrl} />
          <InstallCommandButton name={name} />
        </div>
      </div>

      <div className="relative m-0.5 mt-0 flex min-h-0 flex-1 flex-col overflow-hidden rounded-md border bg-background">
        <div className={cn("size-full", isCodeMode && "hidden")}>
          <PanelGroup orientation="horizontal">
            <Panel
              className="h-(--block-height)"
              defaultSize={`${DEFAULT_PANEL_SIZE}%`}
              minSize={`${MIN_PANEL_SIZE}%`}
            >
              <div
                ref={iframeContainerRef}
                className="relative size-full bg-background"
              >
                {shouldLoadIframe ? (
                  <>
                    {/* No loading="lazy": the intersection gate above already
                        made that decision, and the attribute is unobservable. */}
                    <iframe
                      ref={setIframeNode}
                      id={name}
                      src={previewUrl}
                      title={`Preview of ${name}`}
                      className={cn(
                        "absolute inset-0 size-full transition-opacity duration-200 ease-out",
                        loaded ? "opacity-100" : "opacity-0"
                      )}
                      // Same-origin by construction: the frame is this app's own preview route.
                      // oxlint-disable-next-line react/iframe-missing-sandbox
                      sandbox="allow-scripts allow-same-origin"
                      allowFullScreen
                      onLoad={onIframeLoad}
                    />
                    {!loaded && <BlockLoader className="absolute inset-0" />}
                  </>
                ) : (
                  <BlockLoader />
                )}
              </div>
            </Panel>

            {/* Client-only: react-resizable-panels overwrites the handle's aria
                values with layout-measured ones, so a server-rendered handle
                ships role="separator" with no aria-valuenow. */}
            {isMounted && !isMobile && (
              <>
                <PanelResizeHandle
                  aria-label="Resize preview"
                  className="relative w-2"
                >
                  <div className="absolute inset-0 m-auto h-20 w-1 origin-center bg-foreground/20 transition-transform duration-150 ease-out hover:scale-y-125" />
                </PanelResizeHandle>
                <Panel defaultSize="0%" className="bg-muted/50" />
              </>
            )}
          </PanelGroup>
        </div>

        {isCodeMode && <BlockCodeView key={name} files={files} />}
      </div>
    </div>
  )
}
