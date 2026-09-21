import { type Registry, registryItemSchema } from "shadcn/schema"

import { siteConfig } from "@/config/site"
import { registryItems } from "@/registry/registry-items"

// Parsing at import time means a malformed item fails the build, not a consumer's install.
export const registry = {
  name: siteConfig.SLUG,
  homepage: siteConfig.URL,
  items: registryItemSchema.array().parse(registryItems),
} satisfies Registry
