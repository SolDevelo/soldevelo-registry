// TODO(soldevelo): set this to the real public origin before the first deploy.
// It is baked into canonicals and into the committed registry artifacts, so it must NOT
// fall back to localhost, or a local `pnpm registry:build` would publish localhost URLs.
const PRODUCTION_URL = "https://registry.soldevelo.com"

// NEXT_PUBLIC_SITE_URL overrides it for preview deploys, which need their own canonical.
function resolveSiteUrl(): string {
  // `||`, not `??`: a host that defines the var with no value yields "", which would crash
  // every `new URL(siteConfig.URL)` in the metadata layer.
  return process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || PRODUCTION_URL
}

export const siteConfig = {
  NAME: "SolDevelo Registry",
  // The shadcn namespace consumers install from: `@soldevelo/<project>/<item>`.
  SLUG: "soldevelo",
  SHORT_DESCRIPTION:
    "Open-source UI blocks for the projects SolDevelo builds, installable with the shadcn CLI.",
  DESCRIPTION:
    "A shadcn registry of components, blocks and page templates for the open-source projects SolDevelo works on. Every item says which project it comes from, previews live, and installs into your own codebase with a single command.",
  URL: resolveSiteUrl(),
  REPO: "https://github.com/SolDevelo/soldevelo-registry",
  DOMAIN: resolveSiteUrl().replace(/^https?:\/\//, ""),
  KEYWORDS: [
    "SolDevelo",
    "shadcn/ui",
    "React components",
    "component registry",
    "Tailwind CSS",
    "open source",
  ],
  AUTHORS: [{ NAME: "SolDevelo", URL: "https://soldevelo.com" }],
  CONTACT_URL: "https://soldevelo.com/contact/",
  PRIVACY_URL: "https://soldevelo.com/privacy-policy/",
  // SolDevelo's own channels, not the registry's. Also feed `sameAs` in the
  // Organization schema, so the company's profiles resolve to one entity.
  SOCIALS: {
    X: "https://x.com/soldevelo",
    LINKEDIN: "https://www.linkedin.com/company/soldevelo-sp--z-o-o-",
    YOUTUBE: "https://www.youtube.com/soldevelo",
  },
} as const

// The address the shadcn CLI resolves an item by, e.g. `@soldevelo/openlmis/stock-summary`.
export function registryAddress(name: string): string {
  return `@${siteConfig.SLUG}/${name}`
}
