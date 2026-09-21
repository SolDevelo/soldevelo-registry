"use client"

import { CheckIcon } from "lucide-react"

import { PackageManagerLogo } from "@/components/package-manager-logo"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useLocalStorage } from "@/hooks/use-local-storage"
import {
  PACKAGE_MANAGER_LABELS,
  PACKAGE_MANAGER_STORAGE_KEY,
  PACKAGE_MANAGERS,
  type PackageManager,
} from "@/lib/package-managers"
import { cn } from "@/lib/utils"

// useLocalStorage is a useSyncExternalStore over a dispatched storage event, so one
// picker updates every command on the page, and the choice carries between pages.
export function usePackageManager() {
  return useLocalStorage<PackageManager>(PACKAGE_MANAGER_STORAGE_KEY, "pnpm")
}

export function PackageManagerPicker({ className }: { className?: string }) {
  const [packageManager, setPackageManager] = usePackageManager()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="outline"
            size="sm"
            className={cn("gap-2", className)}
            aria-label={`Package manager: ${PACKAGE_MANAGER_LABELS[packageManager]}`}
          />
        }
      >
        <PackageManagerLogo
          manager={packageManager}
          className="size-4 shrink-0"
          aria-hidden="true"
        />
        <span className="font-mono text-xs">{packageManager}</span>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Package manager</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {PACKAGE_MANAGERS.map((manager) => (
            <DropdownMenuItem
              key={manager}
              onClick={() => setPackageManager(manager)}
              className="gap-2"
            >
              <CheckIcon
                className={cn(
                  "size-3.5",
                  packageManager === manager ? "opacity-100" : "opacity-0"
                )}
                aria-hidden="true"
              />
              <PackageManagerLogo
                manager={manager}
                className="size-4 shrink-0"
                aria-hidden="true"
              />
              <span className="font-mono text-xs">{manager}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
