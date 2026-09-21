export { cn } from "cn"

// Plain title-casing mangles this domain's abbreviations ("Cce", "Soh"), and every heading is slug-derived.
const ACRONYMS: Record<string, string> = {
  api: "API",
  cce: "CCE",
  csv: "CSV",
  faq: "FAQ",
  faqs: "FAQs",
  fefo: "FEFO",
  lmis: "LMIS",
  rnr: "R&R",
  seo: "SEO",
  sms: "SMS",
  soh: "SOH",
  ui: "UI",
  ux: "UX",
}

// A slug (or slug-with-number) as display text, e.g. `stock-1` -> "Stock 1".
export function prettifySlug(slug: string): string {
  return slug
    .split("-")
    .map((part) =>
      /^\d+$/.test(part)
        ? part
        : (ACRONYMS[part.toLowerCase()] ??
          part.charAt(0).toUpperCase() + part.slice(1))
    )
    .join(" ")
}
