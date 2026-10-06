import { z } from "zod"

export const LOGO_TYPES = ["image/png", "image/jpeg", "image/webp"]
export const MAX_LOGO_BYTES = 512 * 1024
export const MAX_APP_NAME_LENGTH = 20

/** The branding saved for everyone; a null name or logo means the app's own. */
export type Branding = {
  appName: string | null
  showAppName: boolean
  /** A URL, or a file picked here that the page keeps without uploading it. */
  logo: string | File | null
}

/** `logo` is a new file, null to remove the saved one, or undefined to keep it. */
export type BrandingValues = {
  appName: string
  showAppName: boolean
  logo: File | null | undefined
}

export const DEFAULT_BRANDING: Branding = {
  appName: null,
  showAppName: true,
  logo: null,
}

export const logoSchema = z
  .custom<File | null | undefined>(
    (value) => value === undefined || value === null || value instanceof File
  )
  .superRefine((file, context) => {
    if (!(file instanceof File)) return
    if (!LOGO_TYPES.includes(file.type)) {
      context.addIssue({
        code: "custom",
        message: "Choose a PNG, JPEG or WebP image.",
      })
    } else if (file.size > MAX_LOGO_BYTES) {
      context.addIssue({
        code: "custom",
        message: "Choose an image of at most 512 KB.",
      })
    }
  })

export const brandingSchema = (saved: Branding) =>
  z.object({
    appName: z
      .string()
      .trim()
      // A longer name saved before the limit stays allowed until it is changed.
      .refine(
        (name) => name.length <= MAX_APP_NAME_LENGTH || name === saved.appName,
        "Use at most 20 characters, so the name fits the sidebar."
      ),
    showAppName: z.boolean(),
    logo: logoSchema,
  })

export function toBrandingValues(saved: Branding): BrandingValues {
  return {
    appName: saved.appName ?? "",
    showAppName: saved.showAppName,
    logo: undefined,
  }
}

/** The branding once `values` are saved over `saved`. */
export function applyBranding(
  saved: Branding,
  values: BrandingValues
): Branding {
  return {
    appName: values.appName.trim() || null,
    showAppName: values.showAppName,
    logo: values.logo === undefined ? saved.logo : values.logo,
  }
}

export function isBrandingChanged(values: BrandingValues, saved: Branding) {
  const next = applyBranding(saved, values)
  return (
    next.appName !== saved.appName ||
    next.showAppName !== saved.showAppName ||
    next.logo !== saved.logo
  )
}

export const isBrandingDefault = (saved: Branding) =>
  saved.logo === null && saved.appName === null && saved.showAppName
