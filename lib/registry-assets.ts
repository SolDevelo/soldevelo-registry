import { siteConfig } from "@/config/site"

// A root-relative image path resolves against the consumer's origin and 404s, and JSON cannot carry the binary.
// So source keeps the relative form (self-contained local dev) and every published artifact gets the absolute URL.
const ASSET_PATH =
  /(["'`])(\/(?!\/)[A-Za-z0-9._-]+(?:\/[A-Za-z0-9._-]+)*\.(?:png|jpe?g|webp|avif|gif|svg))\1/g

export function absolutizeAssets(source: string): string {
  return source.replace(
    ASSET_PATH,
    (_match, quote: string, assetPath: string) =>
      `${quote}${siteConfig.URL}${assetPath}${quote}`
  )
}

export function findRelativeAssets(source: string): string[] {
  return [...source.matchAll(ASSET_PATH)].map((match) => match[2] as string)
}

// An interpolated path (`/facility-${id}.webp`) is invisible to ASSET_PATH, so it ships un-rewritten and 404s.
const INTERPOLATED_ASSET =
  /(["'`])(\/(?!\/)[A-Za-z0-9._${}/-]*\.(?:png|jpe?g|webp|avif|gif|svg))\1/g

export function findInterpolatedAssets(source: string): string[] {
  return [...source.matchAll(INTERPOLATED_ASSET)]
    .map((match) => match[2] as string)
    .filter((assetPath) => assetPath.includes("${"))
}
