import { registryAddress } from "@/config/site"

export const PACKAGE_MANAGERS = ["pnpm", "npm", "yarn", "bun"] as const

export type PackageManager = (typeof PACKAGE_MANAGERS)[number]

// How each manager runs a one-off binary. Kept separate from the command because
// everything the docs show is `<runner> <tool> <args>`, not only `shadcn add`.
export const PACKAGE_RUNNERS: Record<PackageManager, string> = {
  pnpm: "pnpm dlx",
  npm: "npx",
  yarn: "yarn dlx",
  bun: "bunx --bun",
}

// Each project brands itself lowercase except Yarn, so this is not a title-case helper.
export const PACKAGE_MANAGER_LABELS: Record<PackageManager, string> = {
  pnpm: "pnpm",
  npm: "npm",
  yarn: "Yarn",
  bun: "Bun",
}

export const PACKAGE_MANAGER_STORAGE_KEY = "soldevelo-registry:package-manager"

export function getInstallCommand(
  packageManager: PackageManager,
  name: string
): string {
  return `${PACKAGE_RUNNERS[packageManager]} shadcn@latest add ${registryAddress(name)}`
}
