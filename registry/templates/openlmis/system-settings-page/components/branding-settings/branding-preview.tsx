import type { ReactNode } from "react"

type BrandingPreviewProps = {
  appName: string
  /** Shown when `appName` is empty, e.g. "OpenLMIS". */
  defaultAppName: string
  logoUrl: string
  showAppName: boolean
}

function PreviewItem({
  caption,
  children,
}: {
  caption: string
  children: ReactNode
}) {
  return (
    <figure className="flex min-w-0 flex-col gap-2">
      <figcaption className="text-xs text-muted-foreground">
        {caption}
      </figcaption>
      <div
        aria-hidden="true"
        className="flex h-32 items-center justify-center rounded-xl border bg-muted/40 p-4"
      >
        {children}
      </div>
    </figure>
  )
}

/** The branding as it lands in the browser tab, the sidebar and the sign-in page. */
export function BrandingPreview({
  appName,
  defaultAppName,
  logoUrl,
  showAppName,
}: BrandingPreviewProps) {
  const name = appName.trim() || defaultAppName

  return (
    <section
      aria-labelledby="branding-preview-title"
      className="flex flex-col gap-3"
    >
      <h2 className="text-sm font-medium" id="branding-preview-title">
        Preview
      </h2>
      <div className="grid gap-3 @xl/main:grid-cols-3">
        <PreviewItem caption="Browser Tab">
          <div className="flex max-w-full min-w-0 items-center gap-2 rounded-lg border bg-background px-3 py-1.5 text-sm shadow-xs">
            {/* oxlint-disable-next-line next/no-img-element -- items are framework-neutral, and the logo may be a local object URL */}
            <img
              alt=""
              className="size-4 shrink-0 object-contain"
              src={logoUrl}
            />
            <span className="truncate" dir="auto">
              {name}
            </span>
          </div>
        </PreviewItem>
        <PreviewItem caption="Sidebar">
          <div className="flex w-full min-w-0 items-center gap-2 rounded-lg border bg-sidebar px-3 py-2 text-sidebar-foreground shadow-xs">
            {/* oxlint-disable-next-line next/no-img-element -- items are framework-neutral, and the logo may be a local object URL */}
            <img
              alt=""
              className={
                showAppName
                  ? "h-8 max-w-24 shrink-0 object-contain"
                  : "h-6 max-w-44 object-contain"
              }
              src={logoUrl}
            />
            {showAppName && (
              <span className="truncate text-sm font-semibold" dir="auto">
                {name}
              </span>
            )}
          </div>
        </PreviewItem>
        <PreviewItem caption="Sign-In Page">
          <div className="flex min-w-0 flex-col items-center gap-1 text-center">
            {/* oxlint-disable-next-line next/no-img-element -- items are framework-neutral, and the logo may be a local object URL */}
            <img alt="" className="h-7 max-w-40 object-contain" src={logoUrl} />
            <p className="text-sm font-semibold">Sign In</p>
            <p className="line-clamp-2 text-xs text-muted-foreground">
              Enter your {name} credentials to continue.
            </p>
          </div>
        </PreviewItem>
      </div>
    </section>
  )
}
