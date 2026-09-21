"use client"

import type { VariantProps } from "class-variance-authority"
import {
  CheckIcon,
  ExternalLinkIcon,
  RefreshCwIcon,
  TerminalIcon,
} from "lucide-react"

import { usePackageManager } from "@/components/package-manager-picker"
import { Button, type buttonVariants } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard"
import { getInstallCommand } from "@/lib/package-managers"
import { cn } from "@/lib/utils"

type IconButtonWithTooltipProps = {
  tooltip: string
  ariaLabel: string
  href?: string
  onClick?: () => void
  disabled?: boolean
  children: React.ReactNode
  className?: string
} & Pick<VariantProps<typeof buttonVariants>, "variant" | "size">

function IconButtonWithTooltip({
  variant = "outline",
  size = "icon-sm",
  tooltip,
  ariaLabel,
  href,
  onClick,
  disabled,
  children,
  className,
}: IconButtonWithTooltipProps) {
  const button =
    href && !disabled ? (
      <Button
        variant={variant}
        size={size}
        aria-label={ariaLabel}
        className={className}
        nativeButton={false}
        render={
          <a
            href={href}
            aria-label={ariaLabel}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClick}
          />
        }
      >
        {children}
      </Button>
    ) : (
      <Button
        type="button"
        variant={variant}
        size={size}
        onClick={disabled ? undefined : onClick}
        disabled={disabled}
        aria-label={ariaLabel}
        className={className}
      >
        {children}
      </Button>
    )

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger render={button} />
        <TooltipContent side="top">{tooltip}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export function OpenInNewTabButton({ previewUrl }: { previewUrl: string }) {
  return (
    <IconButtonWithTooltip
      tooltip="Fullscreen preview"
      ariaLabel="Open preview in a new tab"
      href={previewUrl}
    >
      <ExternalLinkIcon aria-hidden="true" className="size-3.5" />
    </IconButtonWithTooltip>
  )
}

export function RefreshButton({
  onRefresh,
  isRefreshing,
}: {
  onRefresh: () => void
  isRefreshing: boolean
}) {
  const tooltip = isRefreshing ? "Refreshing…" : "Refresh preview"

  return (
    <IconButtonWithTooltip
      tooltip={tooltip}
      ariaLabel={tooltip}
      onClick={onRefresh}
      disabled={isRefreshing}
    >
      <RefreshCwIcon
        aria-hidden="true"
        className={cn("size-3.5", isRefreshing && "animate-spin")}
      />
    </IconButtonWithTooltip>
  )
}

export function InstallCommandButton({ name }: { name: string }) {
  const [packageManager] = usePackageManager()
  const { copied, copy } = useCopyToClipboard()
  const command = getInstallCommand(packageManager, name)

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger
          render={
            // The primary action of the whole toolbar: everything else is a way
            // to look at the item.
            <Button
              type="button"
              size="sm"
              aria-label="Copy the shadcn install command"
              onClick={() => void copy(command)}
            />
          }
        >
          {copied ? (
            <CheckIcon data-icon="inline-start" aria-hidden="true" />
          ) : (
            <TerminalIcon data-icon="inline-start" aria-hidden="true" />
          )}
          {copied ? "Copied" : "Install"}
        </TooltipTrigger>
        <TooltipContent side="top">
          {copied ? "Copied!" : command}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
